import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "pushcontacto2",
  alias: ["puskontak2", "push2", "difusion2"],
  category: "pushkontak", // Categoría original restablecida
  description: "Envía un mensaje junto con una tarjeta de contacto a todos los miembros del grupo",
  usage: ".pushcontacto2 <mensaje>|<nombre_contacto>",
  example: ".pushcontacto2 ¡Hola!|MiTienda",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const modoGrupo = getGroupMode(m.chat, db);

  if (modoGrupo !== "pushkontak" && modoGrupo !== "all") {
    return m.reply(
      `❌ *ᴍᴏᴅᴏ ɴᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> Activa el modo pushkontak primero para usar esta función\n\n\`${m.prefix}botmode pushkontak\``,
    );
  }

  const entrada = m.text?.trim();
  if (!entrada || !entrada.includes("|")) {
    return m.reply(
      `📢 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛᴏ 2*\n\n> Formato: mensaje|nombre_contacto\n\n\`Ejemplo: ${m.prefix}pushcontacto2 ¡Hola a todos!|MiTienda\``,
    );
  }

  const [texto, nombreContacto] = entrada.split("|").map((s) => s.trim());

  if (!texto || !nombreContacto) {
    return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Formato incorrecto. Usa: mensaje|nombre_contacto`);
  }

  if (global.statuspush) {
    return m.reply(
      `❌ *ᴇʀʀᴏʀ*\n\n> Ya hay un proceso de push en curso. Escribe \`${m.prefix}stoppush\` para detenerlo.`,
    );
  }

  m.react("📢");

  try {
    const metadata = m.groupMetadata;
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const participantes = metadata.participants
      .map((p) => {
        if (p.phoneNumber) return p.phoneNumber;
        if (p.jid && !p.jid.endsWith("@lid")) return p.jid;
        if (p.id && !p.id.endsWith("@lid")) return p.id;
        const resolved = resolveAnyLidToJid(
          p.jid || p.id,
          metadata.participants,
        );
        if (resolved && !resolved.endsWith("@lid") && !isLidConverted(resolved))
          return resolved;
        const cached = getCachedJid(p.jid || p.id || p.lid || "");
        if (cached && !cached.endsWith("@lid") && !isLidConverted(cached))
          return cached;
        return null;
      })
      .filter((id) => id && id !== botId && !id.includes(m.sender));

    if (participantes.length === 0) {
      m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron miembros válidos para el envío.`);
    }

    const jedaPush = db.setting("jedaPush") || 5000;

    await m.reply(
      `📢 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛᴏ 2*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${texto.substring(0, 50)}${texto.length > 50 ? "..." : ""}\`\n` +
        `┃ 👤 ɴᴏᴍʙʀᴇ: \`${nombreContacto}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${participantes.length}\` miembros\n` +
        `┃ ⏱️ ɪɴᴛᴇʀᴠᴀʟᴏ: \`${jedaPush}ms\`\n` +
        `╰┈┈⬡\n\n` +
        `> Iniciando envío masivo con contacto...`,
    );

    global.statuspush = true;
    let successCount = 0;
    let failedCount = 0;

    function generarCodigo(length) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    }

    for (const miembro of participantes) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;

        await m.reply(
          `⏹️ *ᴘᴜsʜ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
            `> ✅ Exitosos: \`${successCount}\`\n` +
            `> ❌ Fallidos: \`${failedCount}\``,
        );
        return;
      }

      try {
        const numeroMiembro = miembro.split("@")[0];
        const codigoUnico = generarCodigo(6);
        const mensajeFinal = `${texto}\n\n#${codigoUnico}`;

        const vcard = `BEGIN:VCARD\n` +
          `VERSION:3.0\n` +
          `FN:${nombreContacto} - ${numeroMiembro}\n` +
          `TEL;type=CELL;type=VOICE;waid=${numeroMiembro}:+${numeroMiembro}\n` +
          `END:VCARD`;

        // Envía el mensaje de texto
        await sock.sendMessage(miembro, { text: mensajeFinal });

        // Envía la tarjeta de contacto
        await sock.sendMessage(miembro, {
          contacts: {
            displayName: nombreContacto,
            contacts: [
              {
                displayName: nombreContacto,
                vcard: vcard,
              },
            ],
          },
        });

        successCount++;
      } catch (err) {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaPush));
    }

    delete global.statuspush;

    m.react("✅");
    await m.reply(
      `✅ *ᴘᴜsʜ ғɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
        `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏs* 」\n` +
        `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
        `┃ ❌ ғᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${participantes.length}\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
