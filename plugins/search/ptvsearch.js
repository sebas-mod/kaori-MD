import axios from 'axios'
import crypto from 'crypto'
import { generateWAMessage, generateWAMessageFromContent, jidNormalizedUser } from 'ourin'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
  name: "ptvsearch",
  alias: ["ptvs", "tiktoksearch", "buscartt"],
  category: "search",
  description: "Buscar videos de TikTok",
  usage: ".ptvsearch <búsqueda>",
  example: ".ptvsearch jj epep",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function tiktokSearchVideo(query) {
  try {
    const res = await axios.get(
      `https://labs.shannzx.xyz/api/v1/tiktok?query=${encodeURIComponent(query)}`,
      {
        timeout: 30000,
      },
    );

    if (!res.data?.status || !res.data?.result) {
      return null;
    }

    return res.data.result;
  } catch (e) {
    return null;
  }
}

async function handler(m, { sock }) {
  const query = m.args.join(" ")?.trim();

  if (!query) {
    return m.reply(
      `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ* 」
┃
┃ ㊗ ᴜsᴏ: \`${m.prefix}ptvsearch <búsqueda>\`
┃
╰┈┈⬡

> \`Ejemplo: ${m.prefix}ptvsearch anime\``,
    );
  }

  m.react("🔍");

  try {
    const videos = await tiktokSearchVideo(query);

    if (!videos || videos.length === 0) {
      m.react("❌");
      return m.reply(`❌ No se encontraron videos para: ${query}`);
    }

    const formatDuration = (sec) => {
      const min = Math.floor(sec / 60);
      const s = sec % 60;
      return `${min}:${s.toString().padStart(2, "0")}`;
    };

    // Selecciona un video aleatorio de los resultados y lo envía como nota de video (PTV)
    await sock.sendMessage(m.chat, {
      video: { url: videos[Math.floor(Math.random() * videos.length)].video },
      mimetype: "video/mp4",
      ptv: true,
    });

    m.react("✅");
  } catch (error) {
    m.react('☢');
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler, tiktokSearchVideo }
