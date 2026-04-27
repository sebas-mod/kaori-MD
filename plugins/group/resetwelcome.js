import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'resetwelcome',
    alias: ['borrarbienvenida', 'delwelcome', 'clearwelcome'],
    category: 'group',
    description: 'Restablece el mensaje de bienvenida al valor predeterminado',
    usage: '.resetwelcome',
    example: '.resetwelcome',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    
    if (!groupData?.welcomeMsg) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> El mensaje de bienvenida ya es el predeterminado.`)
    }
    
    db.setGroup(m.chat, { welcomeMsg: null })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n` +
        `> Se ha eliminado el mensaje personalizado.\n` +
        `> Ahora se usará el mensaje por defecto de **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃**.`
    )
}

export { pluginConfig as config, handler }
