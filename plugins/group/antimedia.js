import { getDatabase } from "../../src/lib/ourin-database.js";
import config from "../../config.js";

const pluginConfig = {
  name: "antimedia",
  alias: ["am", "nomedia", "sinfotos", "solotexto"],
  category: "group",
  description: "Bloquea el envío de cualquier archivo multimedia (fotos, videos, audios, etc.)",
  usage: ".antimedia <on/off>",
  example: ".antimedia on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

// Función para localizar los mensajes de advertencia
function gpMsg(key, replacements = {}) {
  const defaults = {
    antimedia: "⚠️ *AntiMedia* — @%user%, el envío de archivos multimedia no está permitido en este grupo.",
  };
  let text = config.groupProtection?.[key] || defaults[key] || "";
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`%${k}%`, "g"), v);
  }
  return text;
}

// Función que chequea los mensajes en tiempo real
async function checkAntimedia(m, sock, db) {
  if (!m.isGroup) return false;
  // Los admins, el dueño y el bot están exentos de la regla
  if (m.isAdmin || m.isOwner || m.fromMe) return false;

  const groupData = db.getGroup(m.chat) || {};
  if (!groupData.antimedia) return false;

  // Detectamos si el mensaje contiene algún tipo de media
  const isMedia =
    m.isImage || m.isVideo || m.isGif || m.isAudio || m.isDocument || m.isSticker;
  
  if (!isMedia) return false;

  try {
    // Borramos el contenido multimedia
    await sock.sendMessage(m.chat, { delete: m.key });
    
    // Avisamos en el grupo
    await sock.sendMessage(m.chat, {
      text: gpMsg("antimedia", { user: m.sender.split("@")[0] }),
      mentions: [m.sender],
    });
    return true;
  } catch (err) {
    console.error('[ANTIMEDIA ERROR]', err);
    return false;
  }
}

async function handler(m, { sock }) {
  const db = getDatabase();
  const action = (m.args || [])[0]?.toLowerCase();
  const groupData = db.getGroup(m.chat) || {};

  // Mostrar estado actual si no hay argumentos
  if (!action) {
    const status = groupData.antimedia ? "✅ ACTIVADO" : "❌ DESACTIVADO";
    await m.reply(
      `🖼️ *CONFIGURACIÓN ANTIMEDIA*\n\n> Estado: *${status}*\n\n> Usá: \`${m.prefix}antimedia on/off\``,
    );
    return;
  }

  if (action === "on") {
    db.setGroup(m.chat, { ...groupData, antimedia: true });
    m.react("✅");
    await m.reply(`✅ *AntiMedia activado.* Se eliminarán fotos, videos, audios y stickers de los miembros.`);
    return;
  }

  if (action === "off") {
    db.setGroup(m.chat, { ...groupData, antimedia: false });
    m.react("❌");
    await m.reply(`❌ *AntiMedia desactivado.*`);
    return;
  }

  await m.reply(`❌ Opción no válida. Usá \`${m.prefix}antimedia on\` o \`off\``);
}

export { pluginConfig as config, handler, checkAntimedia };
