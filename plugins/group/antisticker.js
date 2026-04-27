import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antisticker',
    alias: ['as', 'nosticker'],
    category: 'group',
    description: 'Configura la protección anti-stickers en el grupo',
    usage: '.antisticker <on/off>',
    example: '.antisticker on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function gpMsg(key, replacements = {}) {
    const defaults = {
        antisticker: '⚠ *ᴀɴᴛɪ-sᴛɪᴄᴋᴇʀ* — El sticker de @%user% ha sido eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

async function checkAntisticker(m, sock, db) {
    if (!m.isGroup) return false
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antisticker) return false

    const isSticker = m.isSticker || m.type === 'stickerMessage'
    if (!isSticker) return false

    try {
        await sock.sendMessage(m.chat, { delete: m.key })
    } catch {}

    await sock.sendMessage(m.chat, {
        text: gpMsg('antisticker', { user: m.sender.split('@')[0] }),
        mentions: [m.sender],
    })

    return true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    if (!action) {
        const status = groupData.antisticker ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        await m.reply(`🎭 *ᴀɴᴛɪ-sᴛɪᴄᴋᴇʀ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n> Estado: *${status}*\n\n> Usa: \`.antisticker on/off\``)
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, antisticker: true })
        m.react('✅')
        await m.reply(`✅ *AntiSticker activado*\n> Los stickers enviados por miembros (no admins) serán eliminados automáticamente.`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, antisticker: false })
        m.react('❌')
        await m.reply(`❌ *AntiSticker desactivado*`)
        return
    }

    await m.reply(`❌ Opción no válida. Usa \`.antisticker on\` o \`.antisticker off\``)
}

export { pluginConfig as config, handler, checkAntisticker }
