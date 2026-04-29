import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'unblock',
    alias: ['desbloquear', 'unblocknomor', 'quitarbloqueo'],
    category: 'owner',
    description: 'Desbloquea un número de WhatsApp',
    usage: '.unblock <número/reply/mention>',
    example: '.unblock 346xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    // Lógica para identificar al objetivo (mención, respuesta o número directo)
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
            '⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n' +
            '> `.unblock 346xxx` — Desbloquear vía número\n' +
            '> `.unblock` (respondiendo a un mensaje) — Desbloquear al remitente\n' +
            '> `.unblock @mention` — Desbloquear al usuario mencionado\n' +
            '> `.unblock` (en chat privado) — Desbloquear a este usuario'
        )
    }

    try {
        await sock.updateBlockStatus(targetJid, 'unblock')
        await m.react('✅')
        return m.reply(
            `✅ *ɴᴜ́ᴍᴇʀᴏ ᴅᴇsʙʟᴏǫᴜᴇᴀᴅᴏ*\n\n` +
            `> Objetivo: @${targetJid.split('@')[0]}`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        // Retorna el error predefinido del sistema
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
