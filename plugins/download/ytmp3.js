import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'

const pluginConfig = {
    name: 'ytmp3',
    alias: ['youtubemp3', 'ytaudio'],
    category: 'download',
    description: 'Descargar audio de YouTube',
    usage: '.ytmp3 <url>',
    example: '.ytmp3 https://youtube.com/watch?v=xxx',
    cooldown: 20,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    if (!url) return m.reply(`Ejemplo: ${m.prefix}ytmp3 https://youtube.com/watch?v=xxx`)
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return m.reply('❌ La URL debe ser de YouTube')

    m.react('🕕')

    try {
        const { result } = await f(`https://api.zenzxz.my.id/download/youtube?url=${encodeURIComponent(url)}`)

        await sock.sendMedia(m.chat, result.download, null, m, {
            type: 'audio',
            mimetype: 'audio/mpeg',
            ptt: false,
            fileName: result.title || 'audio.mp3',          
        })
        m.react('✅')

    } catch (err) {
        console.error('[YTMP3]', err)
        m.react('❌')
        m.reply('Error al descargar el audio.')
    }
}

export { pluginConfig as config, handler }
