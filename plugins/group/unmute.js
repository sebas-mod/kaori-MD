import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'unmute',
    alias: ['desmutear', 'unbisukan', 'hablar'],
    category: 'group',
    description: 'Desactiva el silencio del grupo',
    usage: '.unmute',
    example: '.unmute',
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

    if (!group.mute) return m.reply('❌ El grupo no está silenciado.')

    db.setGroup(m.chat, { ...group, mute: false })
    
    m.reply(
        `✅ El grupo *${groupName}* ha sido activado por @${m.sender.split('@')[0]}\n\n` +
        `> Todos los miembros pueden enviar mensajes ahora.\n\n` +
        `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Moderación*`, 
        { mentions: [m.sender] }
    )
}

export { pluginConfig as config, handler }
