import { capcut } from 'btch-downloader'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'capcutdl',
    alias: ['ccdl', 'capcut', 'cc'],
    category: 'download',
    description: 'Descargar video de CapCut',
    usage: '.ccdl <url>',
    example: '.ccdl https://www.capcut.com/t/xxx',
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
            `> \`${m.prefix}ccdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}ccdl https://www.capcut.com/t/xxx\``
        )
    }

    if (!url.match(/capcut\.com/i)) {
        return m.reply(`❌ URL no válida. Por favor, usa un enlace de CapCut.`)
    }

    await m.react('🕕')

    try {
        const data = await capcut(url)

        if (!data?.status || !data?.originalVideoUrl) {
            return m.reply(`❌ Error al obtener el video. Intenta con otro enlace.`)
        }

        await sock.sendMedia(m.chat, data.originalVideoUrl, null, m, {
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