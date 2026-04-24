/**
 * Nama Plugin: Play
 * Pembuat Code: Zann
 * API/Scraper: api.nexray.web.id
 * Saluran: https://whatsapp.com/channel/0029Vb7g5Qt90x2yn7bOlM2U
 */

import yts from "yt-search";
import axios from "axios";
const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Putar musik dari YouTube (Siputzx API)",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function handler(m, { sock, text }) {
  const query = m.text?.trim();
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ*\n\n> Contoh:\n\`${m.prefix}play komang\``);

  m.react("🕐");

  try {
    const search = await yts(query);
    if (!search.videos.length) throw "Video tidak ditemukan";

    const video = search.videos[0];

    let info = `🎵 *NOW PLAYING*\n\n`;
    info += `📌 *Judul:* ${video.title}\n\n`;
    info += `*DETAIL*\n`;
    info += `👤 Channel: *${video.author.name}*\n`;
    info += `⏱️ Durasi: *${video.duration.timestamp}*\n`;
    info += `👀 Views: *${formatViews(video.views)}*\n`;
    info += `📅 Upload: *${video.ago}*\n`;
    info += `🆔 ID: \`${video.videoId}\`\n\n`;
    if (video.description) {
      const desc = video.description.substring(0, 150).replace(/\n/g, " ");
      info += `*Deskripsi:*\n_${desc}${video.description.length > 150 ? "..." : ""}_\n\n`;
    }
    info += `🔗 ${video.url}\n\n`;
    info += `_⏳ mengirim audio, harap tunggu..._`;

    const result = await sock.sendMedia(m.chat, video.thumbnail, info, m, {
      type: "image",
    });

    const { data } = await axios.get(
      `https://api.zenzxz.my.id/download/youtube?url=${video.url}`,
    );

    await sock.sendMedia(m.chat, data?.result.download, video.title, result, {
      type: "audio",
    });

    m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    m.react("😭");
    m.reply(
      `Wahhh, fitur putar musiknya lagi ada kendala kak, coba lagi nanti yak, jangan spam`,
    );
  }
}

export { pluginConfig as config, handler };
