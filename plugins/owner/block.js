import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: ['block', 'bloquear'],
    alias: ['blokir'],
    category: 'owner',
    description: 'Bloquea un número de WhatsApp',
    usage: '.block <número/reply/mention>',
    example: '.block 346xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (m.mentionedJid?.length > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply('❌ El número proporcionado no es válido.')
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *MODO DE USO*\n\n' +
            '> `.block 346xxx` — Bloquear por número\n' +
            '> `.block` (responder mensaje) — Bloquear al remitente\n' +
            '> `.block @mention` — Bloquear al mencionado\n' +
            '> `.block` (en chat privado) — Bloquear a este usuario'
        )
    }

    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply('❌ No puedo bloquear mi propio número.')
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *NÚMERO BLOQUEADO*\n\n` +
            `> Objetivo: @${targetJid.split('@')[0]}\n` +
            `> Usa \`.unblock\` para desbloquearlo`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
