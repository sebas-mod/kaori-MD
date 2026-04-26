import axios from 'axios'
import config from '../../config.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import path from 'path'
import fs from 'fs'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const NEOXR_APIKEY = config.APIkey?.neoxr || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "pixeldraindl",
  alias: ["pddl", "pixeldrain", "pddownload"],
  category: "download",
  description: "Descargar archivos de Pixeldrain",
  usage: ".pixeldraindl <url>",
  example: ".pixeldraindl https://pixeldrain.com/u/xxxxx",
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = m.args || [];
  const url = args[0]?.trim();

  if (!url || !url.includes("pixeldrain.com")) {
    return m.reply(
      `📥 *ᴘɪxᴇʟᴅʀᴀɪɴ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
        `> Descarga archivos de Pixeldrain\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}pixeldraindl <url>\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}pixeldraindl https://pixeldrain.com/u/xxxxx\``,
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.neoxr.eu/api/pixeldrain?url=${encodeURIComponent(url)}&apikey=${NEOXR_APIKEY}`;
    const data = await f(apiUrl)

    if (!data?.status || !data?.data) {
      m.react("❌");
      return m.reply(
        "❌ *ꜰᴀʟʟᴏ*\n\n> Archivo no encontrado o enlace no válido",
      );
    }

    const file = data.data;

    const sizeMatch = file.size?.match(/([\d.]+)\s*(MB|GB|KB)/i);
    let sizeInMB = 0;
    if (sizeMatch) {
      const value = parseFloat(sizeMatch[1]);
      const unit = sizeMatch[2].toUpperCase();
      if (unit === "GB") sizeInMB = value * 1024;
      else if (unit === "MB") sizeInMB = value;
      else if (unit === "KB") sizeInMB = value / 1024;
    }

    if (sizeInMB > 0 && sizeInMB <= 100) {
      await sock.sendMedia(m.chat, file.url, null, m, {
        type: 'document',
        fileName: file.filename,
        mimetype: 'application/octet-stream',
        contextInfo: {
          forwardingScore: 99,
          isForwarded: true
        }
      })
    } else if (sizeInMB > 100) {
      await m.reply(
        `⚠️ *ᴀʀᴄʜɪᴠᴏ ᴅᴇᴍᴀsɪᴀᴅᴏ ɢʀᴀɴᴅᴇ*\n\n> El archivo (${file.size}) es demasiado pesado para enviarlo por aquí\n> Usa el enlace de descarga directamente`,
      );
    }

    m.react("✅");
  } catch (error) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler }
