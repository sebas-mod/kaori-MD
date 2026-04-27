import { startJadibot, isJadibotActive } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'jadibot',
    alias: ['serbot', 'becomebot', 'bot', 'subbot'],
    category: 'main',
    description: 'Convierte tu número en un sub-bot (Código de vinculación / QR)',
    usage: '.jadibot o .jadibot qr',
    example: '.jadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌ Error al identificar tu número de teléfono.')

    if (isJadibotActive(sender)) {
        return m.reply(
            `⚠️ *ᴊᴀᴅɪʙᴏᴛ ʏᴀ ᴇsᴛá ᴀᴄᴛɪᴠᴏ*\n\n` +
            `> Tu número ya está funcionando como un sub-bot.\n` +
            `> Escribe \`${m.prefix}stopjadibot\` para detenerlo.`
        )
    }

    const arg = (m.args?.[0] || '').toLowerCase()
    const useQR = arg === 'qr'

    if (useQR) {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴍᴏᴅᴏ Qʀ*\n\n` +
            `> Preparando conexión...\n` +
            `> Escanea el código QR que se enviará a continuación.`
        )
    } else {
        await m.reply(
            `🤖 *ᴊᴀᴅɪʙᴏᴛ — ᴄóᴅɪɢᴏ ᴅᴇ ᴠɪɴᴄᴜʟᴀᴄɪóɴ*\n\n` +
            `> Preparando conexión...\n` +
            `> Espera un momento para recibir tu código.`
        )
    }

    try {
        await startJadibot(sock, m, sender, !useQR)
    } catch (e) {
        await m.reply(
            `❌ *ᴊᴀᴅɪʙᴏᴛ ꜰᴀʟʟɪᴅᴏ*\n\n` +
            `> ${e.message || 'Ocurrió un error inesperado'}\n\n` +
            `Por favor, inténtalo de nuevo en unos minutos.`
        )
    }
}

export { pluginConfig as config, handler }
