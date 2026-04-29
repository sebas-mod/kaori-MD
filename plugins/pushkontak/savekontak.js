import { getDatabase } from "../../src/lib/ourin-database.js";
import { getGroupMode } from "../group/botmode.js";
import {
  resolveAnyLidToJid,
  isLid,
  isLidConverted,
  getCachedJid,
} from "../../src/lib/ourin-lid.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "guardarcontacto",
  alias: ["svcontacto", "savecontact", "guardar"],
  category: "pushkontak", // Categoría original restablecida
  description: "Exporta todos los contactos del grupo a formato VCF",
  usage: ".guardarcontacto <nombre_contacto>",
  example: ".guardarcontacto ListaClientes",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
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

  const nombreKontak = m.text?.trim();
  if (!nombreKontak) {
    return m.reply(
      `📥 *ɢᴜᴀʀᴅᴀʀ ᴄᴏɴᴛᴀᴄᴛᴏs*\n\n> Ingresa un nombre para identificar los contactos\n\n\`Ejemplo: ${m.prefix}guardarcontacto ListaClientes\``,
    );
  }

  m.react("📥");

  try {
    const metadata = m.groupMetadata;
    const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
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
      .filter((id) => id && id !== botJid);

    if (participantes.length === 0) {
      m.react("❌");
      return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No se encontraron contactos para guardar.`);
    }

    const vcards = participantes.map((contact, index) => {
      const phone = contact.split("@")[0];
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${nombreKontak} - ${index + 1}`,
        `TEL;type=CELL;type=VOICE;waid=${phone}:+${phone}`,
        "END:VCARD",
      ].join("\n");
    });

    const BATCH = 100;
    const totalLotes = Math.ceil(vcards.length / BATCH);

    for (let i = 0; i < totalLotes; i++) {
      const batch = vcards.slice(i * BATCH, (i + 1) * BATCH);
      const contacts = batch.map((vcard) => ({ vcard }));

      await sock.sendMessage(m.chat, {
        contacts: {
          displayName: `${nombreKontak} (${batch.length})`,
          contacts,
        },
      });

      if (totalLotes > 1 && i < totalLotes - 1) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    m.react("✅");

    if (m.chat !== m.sender) {
      await m.reply(
        `✅ *ᴄᴏɴᴛᴀᴄᴛᴏs ᴇxᴘᴏʀᴛᴀᴅᴏs*\n\n> Se han obtenido ${participantes.length} contactos\ndel Grupo: \`${metadata.subject}\``,
      );
    }
  } catch (error) {
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
