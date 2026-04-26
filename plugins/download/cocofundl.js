import { cocofun } from 'btch-downloader'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cocofundl',
    alias: ['cfdl', 'cocofun', 'cf'],
    category: 'download',
    description: 'Descargar video de CocoFun',
    usage: '.cfdl <url>',
    example: '.cfdl https://www.cocofun.com/share/post/xxx',
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
            `> \`${m.prefix}cfdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}cfdl https://www.cocofun.com/share/post/xxx\``
        )
    }

    if (!url.match(/cocofun\.com/i)) {
        return m.reply(`❌ URL no válida. Por favor, usa un enlace de CocoFun.`)
    }

    await m.react('🕕')

    try {
        const data = await cocofun(url)

        if (!data?.status || !data?.result) {
            return m.reply(`❌ Error al obtener el video. Intenta con otro enlace.`)
        }

        const result = data.result
        const videoUrl = result.no_watermark || result.watermark

        if (!videoUrl) {
            return m.reply(`❌ Video no encontrado.`)
        }

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
