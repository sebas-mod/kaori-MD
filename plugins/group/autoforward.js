import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autoforward',
    alias: ['autofw', 'autofwd', 'autoreenvio'],
    category: 'group',
    description: 'Reenvía automáticamente los mensajes recibidos a este grupo',
    usage: '.autoforward <on/off>',
    example: '.autoforward on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()
    const groupId = m.chat
    const group = db.getGroup(groupId) || {}
    
    if (!option) {
        const status = group.autoforward ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ ◦ Estado: *${status}*\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`${m.prefix}autoforward on/off\`\n\n` +
            `_Esta función reenviará los mensajes entrantes a este grupo._`
        )
    }
    
    if (option === 'on') {
        db.setGroup(groupId, { ...group, autoforward: true })
        m.react('✅')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ✅ *ᴀᴄᴛɪᴠᴀᴅᴏ* 」\n` +
            `┃ ◦ Estado: *ON*\n` +
            `╰┈┈⬡\n\n` +
            `> _Todos los mensajes serán reenviados automáticamente._`
        )
    }
    
    if (option === 'off') {
        db.setGroup(groupId, { ...group, autoforward: false })
        m.react('❌')
        return m.reply(
            `🔄 *ᴀᴜᴛᴏ ꜰᴏʀᴡᴀʀᴅ*\n\n` +
            `╭┈┈⬡「 ❌ *ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ* 」\n` +
            `┃ ◦ Estado: *OFF*\n` +
            `╰┈┈⬡`
        )
    }
    
    return m.reply(`❌ Opción no válida. Usa: on o off`)
}

export { pluginConfig as config, handler }
