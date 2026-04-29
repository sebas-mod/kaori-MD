import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'soloprivado',
    alias: ['onlypc', 'onlyprivate', 'privateonly'],
    category: 'owner',
    description: 'Alternar el modo para que el bot solo responda en chats privados',
    usage: '.soloprivado',
    example: '.soloprivado',
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
    const currentMode = db.setting('onlyPc') || false
    
    if (currentMode) {
        db.setting('onlyPc', false)
        await m.react('❌')
        return m.reply(`❌ *ᴍᴏᴅᴏ sᴏʟᴏ ᴘʀɪᴠᴀᴅᴏ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot ahora puede ser usado en cualquier lugar (Grupos y Privado)`)
    } else {
        db.setting('onlyPc', true)
        db.setting('onlyGc', false)
        await m.react('✅')
        return m.reply(`✅ *ᴍᴏᴅᴏ sᴏʟᴏ ᴘʀɪᴠᴀᴅᴏ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> ¡El bot ahora solo podrá ser utilizado en chats privados!`)
    }
}

export { pluginConfig as config, handler }
