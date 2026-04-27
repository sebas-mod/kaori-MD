import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'setreglas',
    alias: ['setrulesgrup', 'setgrouprules', 'setreglasgrup'],
    category: 'group',
    description: 'Configura reglas personalizadas para el grupo (Solo Admins)',
    usage: '.setreglas <texto>',
    example: '.setreglas 1. No spam\n2. Respetar a todos',
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ɢʀᴜᴘ ʀᴜʟᴇs*\n\n` +
            `> ¡Ingresa el nuevo texto de las reglas!\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}setreglas 1. No hacer spam\\n2. Respetar a los miembros\``
        )
    }
    
    db.setGroup(m.chat, { groupRules: text })
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀs*\n\n` +
        `> ¡Las reglas del grupo han sido modificadas con éxito!\n` +
        `> Escribe \`${m.prefix}rulesgrup\` para ver el resultado.\n\n` +
        `*KAORI MD — Gestión*`
    )
}

export { pluginConfig as config, handler }
