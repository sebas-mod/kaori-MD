import axios from "axios";
import { uploadImage } from "../../src/lib/ourin-uploader.js";
import { f } from "../../src/lib/ourin-http.js";
import te from "../../src/lib/ourin-error.js";
import { live3d } from "../../src/scraper/seaart.js";

const pluginConfig = {
  name: "toblack",
  alias: ["black", "oscurecer", "negro", "tohitam"],
  category: "ai",
  description: "Cambia el tono de piel de la imagen a uno más oscuro",
  usage: ".toblack (responde a una imagen)",
  example: ".toblack",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage) {
    return m.reply(
      `🖤 *ᴇsᴛɪʟᴏ ᴏsᴄᴜʀᴏ*\n\n> Envía o responde a una imagen\n\n\`${m.prefix}toblack\``,
    );
  }

  const PROMPT = `Transform skin tone to a darker complexion, maintain facial features, realistic shadows, high detail, natural skin texture, no distortion`;

  try {
    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      m.react("❌");
      return m.reply(`❌ Error al descargar la imagen`);
    }

    const result = await live3d(buffer, PROMPT);

    m.react("✅");

    await sock.sendMedia(m.chat, result.image, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
