import { f } from './../../src/lib/ourin-http.js'

const pluginConfig = {
    name: 'ytmp4',
    alias: ['youtubemp4', 'ytvideo'],
    category: 'download',
    description: 'Descargar video de YouTube',
    usage: '.ytmp4 <url>',
    example: '.ytmp4 https://youtube.com/watch?v=xxx',
    cooldown: 20,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()
    if (!url) return m.reply(`Ejemplo: ${m.prefix}ytmp4 https://youtube.com/watch?v=xxx`)
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return m.reply('❌ La URL debe ser de YouTube')

    m.react('🕕')

    try {
        const { data } = await f(`https://api.ourin.my.id/api/ytmp4?url=${encodeURIComponent(url)}`)

        await sock.sendMedia(m.chat, data.download, null, m, {
            type: 'video',
        })
        m.react('✅')

    } catch (err) {
        console.error('[YTMP4]', err)
        m.react('❌')
        m.reply('Error al descargar el video.')
    }
}

export { pluginConfig as config, handler }
