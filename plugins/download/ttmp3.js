import ttdown from '../../src/scraper/tiktok.js'
import config from '../../config.js'
import axios from 'axios'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
ffmpeg.setFfmpegPath(ffmpegInstaller.path)

const pluginConfig = {
    name: ['ttmp3'],
    alias: ['ttmusic', 'tiktokmusic'],
    category: 'download',
    description: 'Descargar audio de TikTok',
    usage: '.ttmp3 <url>',
    example: '.ttmp3 https://vt.tiktok.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

function formatNumber(num) {
    if (!num) return '0'
    const n = parseInt(num)
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
}

async function handler(m, { sock }) {
  const url = m.text?.trim()

  if (!url) {
    return m.reply(
`╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* 」
┃ ㊗ ᴜsᴏ: \`${m.prefix}ttmp3 <url>\`
╰┈┈⬡

> Ejemplo: ${m.prefix}ttmp3 https://vt.tiktok.com/xxx`
    )
  }

  if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
    return m.reply('❌ URL no válida. Por favor, usa un enlace de TikTok.')
  }

  m.react('🕕')

  try {
    const result = await ttdown(url)

    const saluranName =
      config.saluran?.name ||
      config.bot?.name ||
      'Ourin-AI'

    const cariaudio = result.downloads.find(d => d.type == 'mp3')
    if (!cariaudio) return m.reply('❌ No se encontró el archivo de audio.')

    await sock.sendMedia(m.chat, cariaudio.url, null, m, {
        type: 'audio',
        mimetype: 'audio/mpeg',
        fileName: `TikTok_Audio_${Date.now()}.mp3`,
        contextInfo: {
            forwardingScore: 99,
            isForwarded: true,
            externalAdReply: {
                title: result.title || 'TikTok Audio',
                body: `👤 Por: \`${result.author.username || '-'}\``,
                thumbnailUrl: result.author?.avatar || result.author?.cover,
                sourceUrl: url,
                mediaUrl: url,
                mediaType: 2,
                renderLargerThumbnail: false,
            }
        }
    })

    m.react('✅')

    // Limpieza de archivos temporales
    setTimeout(() => {
      if (fs.existsSync(result.file)) {
        fs.unlinkSync(result.file)
      }
    }, 5000)

  } catch (err) {
    console.error('[TikTokDL] Error:', err)
    m.react('❌')
    m.reply(
      `❌ *ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n> ${err.message}`
    )
  }
}

export { pluginConfig as config, handler }
