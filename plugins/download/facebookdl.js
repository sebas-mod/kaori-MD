import { fbdown } from 'btch-downloader'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'facebookdl',
    alias: ['fbdown', 'fb', 'facebook'],
    category: 'download',
    description: 'Descargar video de Facebook',
    usage: '.facebookdl <url>',
    example: '.facebookdl https://www.facebook.com/watch?v=xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.text?.trim()

    if (!url) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}facebookdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}fbdown https://www.facebook.com/watch?v=xxx\``
        )
    }

    if (!url.match(/facebook\.com|fb\.watch/i)) {
        return m.reply(`❌ URL no válida. Por favor, usa un enlace de Facebook.`)
    }

    await m.react('🕕')

    try {
        const data = await fbdown(url)

        if (!data?.status) {
            return m.reply(`❌ Error al obtener el video. Intenta con otro enlace.`)
        }

        const videoUrl = data.HD || data.Normal_video

        if (!videoUrl) {
            return m.reply(`❌ Video no encontrado.`)
        }

        const quality = data.HD ? 'HD' : 'SD'

        await sock.sendMedia(m.chat, videoUrl, null, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })

    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
