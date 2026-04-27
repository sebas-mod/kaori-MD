import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'resetgoodbye',
    alias: ['borrardespedida', 'delgoodbye', 'cleargoodbye'],
    category: 'group',
    description: 'Restablece el mensaje de despedida al valor predeterminado',
    usage: '.resetgoodbye',
    example: '.resetgoodbye',
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
    
    // Verificamos si ya está en el estado predeterminado (null)
    if (!groupData?.goodbyeMsg) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> El mensaje de despedida ya es el predeterminado.`)
    }
    
    // Restablecemos el mensaje a null en la base de datos
    db.setGroup(m.chat, { goodbyeMsg: null })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n` +
        `> Se ha eliminado el mensaje personalizado.\n` +
        `> Ahora se usará el mensaje por defecto de **KAORI MD**.`
    )
}

export { pluginConfig as config, handler }
