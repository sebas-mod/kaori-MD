import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'mute',
    alias: ['silenciar', 'cerrar', 'bisukan'],
    category: 'group',
    description: 'Silencia el grupo (solo administradores podrán enviar mensajes)',
    usage: '.mute',
    example: '.mute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (group.mute) return m.reply('❌ El grupo ya se encuentra silenciado.')

    db.setGroup(m.chat, { ...group, mute: true })
    
    const response = `✅ *ɢʀᴜᴘᴏ sɪʟᴇɴᴄɪᴀᴅᴏ*\n\n` +
                     `El grupo *${groupName}* ha sido silenciado por @${m.sender.split('@')[0]}.\n\n` +
                     `> Ahora solo los administradores pueden enviar mensajes.\n` +
                     `> Usa \`${m.prefix}unmute\` para habilitar el chat de nuevo.\n\n` +
                     `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Moderación*`

    m.reply(response, { mentions: [m.sender] })
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

export { pluginConfig as config, handler, isMuted }
