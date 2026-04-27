import { getDatabase } from '../../src/lib/ourin-database.js'
import { DEFAULT_INTRO } from './intro.js'

const pluginConfig = {
    name: 'resetintro',
    alias: ['introdel', 'delintro', 'deleteintro', 'borrarintro'],
    category: 'group',
    description: 'Restablece la introducción del grupo al valor predeterminado (Solo Admins)',
    usage: '.resetintro',
    example: '.resetintro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    
    if (!groupData.intro) {
        return m.reply(`❌ ¡Este grupo ya está utilizando la introducción predeterminada!`)
    }
    
    // Eliminamos la intro personalizada
    delete groupData.intro
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ*\n\n` +
        `> La introducción personalizada ha sido eliminada.\n` +
        `> Ahora se mostrará el mensaje por defecto de **KAORI MD**.\n\n` +
        `Escribe *${m.prefix}intro* para ver el resultado.`
    )
}

export { pluginConfig as config, handler }
