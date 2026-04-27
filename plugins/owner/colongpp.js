import * as _canvas from '@napi-rs/canvas'
import axios from "axios";

import config from "../../config.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "robapp",
  alias: ["stealpp", "malingpp", "copiarpp", "clonarpp"],
  category: "owner",
  description: "Copia y usa la foto de perfil de un objetivo como foto del bot",
  usage: ".robapp (responde a un mensaje)",
  example: ".robapp",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const FALLBACK_PP = "https://telegra.ph/file/1ecdb5a0aee62ef17d7fc.jpg";
const PP_SIZE = 640;

async function resizeForPP(buffer) {
  const { createCanvas, loadImage } = _canvas;
  const img = await loadImage(buffer);
  const canvas = createCanvas(PP_SIZE, PP_SIZE);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, PP_SIZE, PP_SIZE);
  return canvas.toBuffer("image/jpeg");
}

async function handler(m, { sock }) {
  const targetJid = m.quoted?.sender || m.mentions?.[0];
  
  if (!targetJid) {
    return m.reply(
      `🕵️ *ROBAR FOTO DE PERFIL*\n\n` +
        `> Responde al mensaje de alguien para "robar" su foto de perfil\n\n` +
        `*MODO DE USO:*\n` +
        `> Responde al objetivo → \`${m.prefix}robapp\``,
    );
  }

  await m.react("🕵️");

  try {
    let ppBuffer;
    let source = "perfil del objetivo";
    
    try {
      const ppUrl = await sock.profilePictureUrl(targetJid, "image");
      const res = await axios.get(ppUrl, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
    } catch {
      const res = await axios.get(FALLBACK_PP, {
        responseType: "arraybuffer",
        timeout: 15000,
      });
      ppBuffer = Buffer.from(res.data);
      source = "predeterminada (el objetivo no tiene foto)";
    }

    const processed = await resizeForPP(ppBuffer);
    const botJid = sock.user?.id;
    
    await sock.updateProfilePicture(botJid, processed);
    
    const targetNumber = targetJid.split("@")[0];
    await m.react("✅");

    return m.reply(
      `✅ *¡FOTO CLONADA CON ÉXITO!*\n\n` +
        `> 🎯 Objetivo: @${targetNumber}\n` +
        `> 📸 Origen: ${source}`,
      { mentions: [targetJid] },
    );
  } catch (err) {
    console.error("[RobarPP] Error:", err.message);
    await m.react("☢");
    return m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
