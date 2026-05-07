import fetch from "node-fetch";
import yts from "yt-search";

// Implementación de safeFetch integrada
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), global.timeout || 15000); 

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return res;
  } catch (e) {
    throw new Error('API_TIMEOUT');
  } finally {
    clearTimeout(timeout);
  }
}

const pluginConfig = {
  name: 'play', 
  alias: ['play2', 'mp3', 'yta', 'mp4', 'ytv', 'play3', 'ytadoc', 'playdoc', 'ytmp3doc', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'],
  category: 'search',
  description: 'Busca audios/videos en Youtube y los envía usando Faa API',
  usage: '.play <búsqueda>',
  example: '.play Joji Glimpse of Us',
  cooldown: 30,
  energi: 2,
  isEnabled: true
};

async function handler(m, { sock, command }) {
    try {
      const query = m.text?.trim() || m.args?.join(" ");
      if (!query) return m.reply('✨ *𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 - 𝐏𝐋𝐀𝐘*\n\nEscribe el nombre de lo que deseas buscar.\n> *Ejemplo:* `.play stay with me`');
      
      const search = await yts(query);
      if (!search.all?.length) return m.reply('⭐ No se encontraron resultados para tu búsqueda.');
      const video = search.all.find(v => v.type === 'video') || search.all[0];
      
      const mensaje = `╭──〔 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 〕──⬣\n` +
                      `┋ ✧ *TÍTULO:* ${video.title}\n` +
                      `┋ ✧ *TIEMPO:* ${video.timestamp}\n` +
                      `┋ ✧ *URL:* ${video.url}\n` +
                      `╰───────────────⬡\n\n` +
                      `📡 _Obteniendo medios desde Faa API..._`;

      await sock.sendMessage(m.chat, {
        text: mensaje,
        contextInfo: {
          externalAdReply: {
            title: "𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 • 𝐌𝐔𝐒𝐈𝐂",
            body: "Powered by KenisawaDev",
            mediaType: 1,
            sourceUrl: video.url,
            thumbnailUrl: video.thumbnail,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: m });

      const cmd = command || m.command;

      // Lógica para AUDIO (MP3)
      if (['play', 'yta', 'mp3', 'ytmp3', 'play3', 'ytadoc', 'playdoc', 'ytmp3doc'].includes(cmd)) {
        const response = await safeFetch(`https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(video.url)}`);
        const data = await response.json();

        if (!data.status || !data.result?.mp3) throw new Error('DOWNLOAD_ERROR');

        const isDoc = ['play3', 'ytadoc', 'playdoc', 'ytmp3doc'].includes(cmd);
        const options = isDoc 
          ? { document: { url: data.result.mp3 }, mimetype: "audio/mpeg", fileName: `${video.title}.mp3` }
          : { audio: { url: data.result.mp3 }, mimetype: "audio/mpeg" };

        await sock.sendMessage(m.chat, options, { quoted: m });
      } 
      
      // Lógica para VIDEO (MP4)
      else if (['play2', 'ytv', 'mp4', 'play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(cmd)) {
        const response = await safeFetch(`https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(video.url)}`);
        const data = await response.json();

        if (!data.status || !data.result?.download_url) throw new Error('DOWNLOAD_ERROR');

        const isDoc = ['play4', 'ytvdoc', 'play2doc', 'ytmp4doc'].includes(cmd);
        const mediaType = isDoc ? 'document' : 'video';
        
        await sock.sendMessage(m.chat, { 
          [mediaType]: { url: data.result.download_url }, 
          fileName: `${video.title}.mp4`, 
          mimetype: 'video/mp4',
          caption: `🚀 *Archivo listo.*`
        }, { quoted: m });
      }

    } catch (error) {
      console.error("[Kei-Play Error]", error);
      const errorMsg = error.message === 'API_TIMEOUT' 
        ? '⏳ Tiempo de espera agotado (Faa API).' 
        : '⚠️ Error crítico al procesar la descarga.';
      m.reply(errorMsg);
    }
  }

export { pluginConfig as config, handler };
