import { snackvideo } from 'btch-downloader'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'snackvideodl',
    alias: ['svdl', 'snackvideo', 'sv'],
    category: 'download',
    description: 'Descargar video de SnackVideo',
    usage: '.svdl <url>',
    example: '.svdl https://www.snackvideo.com/@xxx/video/xxx',
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
            `> \`${m.prefix}svdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}svdl https://www.snackvideo.com/@xxx/video/xxx\``
        )
    }

    if (!url.match(/snackvideo\.com/i)) {
        return m.reply(`❌ URL no válida. Por favor, usa un enlace de SnackVideo.`)
    }

    await m.react('🕕')

    try {
        const data = await snackvideo(url)

        if (!data?.status || !data?.result?.videoUrl) {
            return m.reply(`❌ Error al obtener el video. Intenta con otro enlace.`)
        }

        const result = data.result

        await sock.sendMedia(m.chat, result.videoUrl, null, m, {
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
