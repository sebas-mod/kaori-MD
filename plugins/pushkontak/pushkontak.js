import fs from "fs";
import path from "path";
import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import {
  resolveAnyLidToJid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "pushcontacto",
  alias: ["puskontak", "push", "difusion"],
  category: "pushkontak",
  description: "Envía mensajes a todos los miembros del grupo + guarda contactos en VCF",
  usage: ".pushcontacto <mensaje>",
  example: ".pushcontacto ¡Hola a todos!",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function generarSerial(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let r = "";
  for (let i = 0; i < len; i++)
    r += chars.charAt(Math.floor(Math.random() * chars.length));
  return r;
}

function construirVcf(contactos) {
  return contactos
    .map((jid) => {
      const num = jid.split("@")[0];
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:WA[${generarSerial(2)}] ${num}`,
        `TEL;type=CELL;type=VOICE;waid=${num}:+${num}`,
        "END:VCARD",
        "",
      ].join("\n");
    })
    .join("");
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const modoGrupo = getGroupMode(m.chat, db);

  // Verificación de modo de bot
  if (modoGrupo !== "pushkontak" && modoGrupo !== "all") {
    return m.reply(
      `❌ *ᴍᴏᴅᴏ ɴᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> Activa el modo pushkontak primero para usar esta función\n\n\`${m.prefix}botmode pushkontak\``,
    );
  }

  const texto = m.text?.trim();
  if (!texto) {
    return m.reply(
      `📢 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛᴏ*\n\n> Ingresa el mensaje que deseas enviar\n\n\`Ejemplo: ${m.prefix}pushcontacto ¡Hola a todos!\``,
    );
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
      `📢 *ᴘᴜsʜ ᴄᴏɴᴛᴀᴄᴛᴏ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 📝 ᴍᴇɴsᴀᴊᴇ: \`${texto.substring(0, 50)}${texto.length > 50 ? "..." : ""}\`\n` +
        `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${participantes.length}\` miembros\n` +
        `┃ ⏱️ ɪɴᴛᴇʀᴠᴀʟᴏ: \`${jedaPush}ms\`\n` +
        `┃ 📊 ᴇsᴛɪᴍᴀᴅᴏ: \`${Math.ceil((participantes.length * jedaPush) / 60000)} min\`\n` +
        `┃ 💾 ᴀᴜᴛᴏ-ɢᴜᴀʀᴅᴀᴅᴏ: \`Activo (VCF)\`\n` +
        `╰┈┈⬡\n\n` +
        `> Iniciando envío masivo...`,
    );

    global.statuspush = true;
    let successCount = 0;
    let failedCount = 0;
    const contactosGuardados = [];

    for (const miembro of participantes) {
      if (global.stoppush) {
        delete global.stoppush;
        delete global.statuspush;

        await m.reply(
          `⏹️ *ᴘᴜsʜ ᴅᴇᴛᴇɴɪᴅᴏ*\n\n` +
            `> ✅ Exitosos: \`${successCount}\`\n` +
            `> ❌ Fallidos: \`${failedCount}\`\n` +
            `> ⏸️ Restantes: \`${participantes.length - successCount - failedCount}\``,
        );

        if (contactosGuardados.length > 0) {
          await enviarVcfAlOwner(sock, m.sender, contactosGuardados, metadata.subject);
        }
        return;
      }

      try {
        const codigoUnico = generarSerial(6);
        const mensajeFinal = `${texto}\n\n#${codigoUnico}`;

        await sock.sendMessage(miembro, { text: mensajeFinal });
        contactosGuardados.push(miembro);
        successCount++;
      } catch (err) {
        failedCount++;
      }

      await new Promise((resolve) => setTimeout(resolve, jedaPush));
    }

    delete global.statuspush;

    if (contactosGuardados.length > 0) {
      await enviarVcfAlOwner(sock, m.sender, contactosGuardados, metadata.subject);
    }

    m.react("✅");
    await m.reply(
      `✅ *ᴘᴜsʜ ғɪɴᴀʟɪᴢᴀᴅᴏ*\n\n` +
        `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏs* 」\n` +
        `┃ ✅ ᴇxɪᴛᴏsᴏs: \`${successCount}\`\n` +
        `┃ ❌ ғᴀʟʟɪᴅᴏs: \`${failedCount}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${participantes.length}\`\n` +
        `┃ 💾 ᴄᴏɴᴛᴀᴄᴛᴏs: \`${contactosGuardados.length} guardados\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    delete global.statuspush;
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

async function enviarVcfAlOwner(sock, ownerJid, contactos, nombreGrupo) {
  try {
    const vcfDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(vcfDir)) fs.mkdirSync(vcfDir, { recursive: true });

    const vcfPath = path.join(vcfDir, `pushcontacto_${Date.now()}.vcf`);
    const vcfContent = construirVcf(contactos);
    fs.writeFileSync(vcfPath, vcfContent, "utf8");

    await sock.sendMessage(ownerJid, {
      document: fs.readFileSync(vcfPath),
      fileName: `Contactos_${nombreGrupo || "Grupo"}_${contactos.length}.vcf`,
      mimetype: "text/vcard",
      caption: `💾 *ᴀᴜᴛᴏ-ɢᴜᴀʀᴅᴀᴅᴏ ᴅᴇ ᴄᴏɴᴛᴀᴄᴛᴏs*\n\n> Total: \`${contactos.length}\` contactos\n> Grupo: \`${nombreGrupo || "Desconocido"}\`\n\n> _Importa este archivo en tu teléfono para guardar todos los contactos._`,
    });

    try {
      fs.unlinkSync(vcfPath);
    } catch {}
  } catch (e) {}
}

export { pluginConfig as config, handler };
