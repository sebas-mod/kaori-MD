import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'deltoxic',
    alias: ['hapustoxic', 'remtoxic', 'removetoxic', 'quitarinsulto', 'borrarinsulto'],
    category: 'group',
    description: 'Elimina una palabra prohibida de la lista de toxicidad del grupo',
    usage: '.deltoxic <palabra>',
    example: '.deltoxic groseria',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `🗑️ *ᴅᴇʟ ᴛᴏxɪᴄ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Uso: \`.deltoxic <palabra>\`\n\n` +
            `\`Ejemplo: ${m.prefix}deltoxic groseria\``
        )
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    const index = toxicWords.indexOf(word)
    
    if (index === -1) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> La palabra \`${word}\` no se encuentra en la lista de este grupo.`)
    }
    
    toxicWords.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴘᴀʟᴀʙʀᴀ ᴇʟɪᴍɪɴᴀᴅᴀ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 📝 ᴘᴀʟᴀʙʀᴀ: \`${word}\`\n` +
        `┃ 📊 ʀᴇsᴛᴀɴᴛᴇs: \`${toxicWords.length}\` palabras\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
