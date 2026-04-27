import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'resetreglas',
    alias: ['resetrulesgrup', 'resetgrouprules', 'borrarreglas'],
    category: 'group',
    description: 'Restablece las reglas del grupo al valor predeterminado (Solo Admins)',
    usage: '.resetreglas',
    example: '.resetreglas',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n\n` +
        `> ¡Las reglas del grupo se han restablecido al valor por defecto!\n` +
        `> Escribe \`${m.prefix}rulesgrup\` para verlas.\n\n` +
        `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Gestión*`
    )
}

export { pluginConfig as config, handler }
