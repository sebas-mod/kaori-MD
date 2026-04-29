import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'listaban',
    alias: ['listabanned', 'banlist', 'baneados'],
    category: 'owner',
    description: 'Ver la lista de usuarios baneados',
    usage: '.listaban',
    example: '.listaban',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const bannedUsers = config.bannedUsers && config.bannedUsers.length > 0 ? config.bannedUsers : (db.setting('bannedUsers') || [])
    
    if (bannedUsers.length === 0) {
        return m.reply(`🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs*\n\n> No hay usuarios baneados actualmente\n\n\`Usa: ${m.prefix}ban <número>\``)
    }
    
    let caption = `🚫 *ʟɪsᴛᴀ ᴅᴇ ʙᴀɴᴇᴀᴅᴏs*\n\n`
    caption += `╭┈┈⬡「 ⛔ *ᴜsᴜᴀʀɪᴏs* 」\n`
    
    for (let i = 0; i < bannedUsers.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsers[i]}\`\n`
    }
    
    caption += `╰┈┈⬡\n\n`
    caption += `> ᴛᴏᴛᴀʟ: \`${bannedUsers.length}\` ᴜsᴜᴀʀɪᴏs ʙᴀɴᴇᴀᴅᴏs`
    
    await m.reply(caption)
}

export { pluginConfig as config, handler }
