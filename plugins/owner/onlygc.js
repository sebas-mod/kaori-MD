import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'sologrupo',
    alias: ['onlygc', 'onlygroup', 'grouponly'],
    category: 'owner',
    description: 'Alternar el modo para que el bot solo responda en grupos',
    usage: '.sologrupo',
    example: '.sologrupo',
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
    const currentMode = db.setting('onlyGc') || false
    
    if (currentMode) {
        db.setting('onlyGc', false)
        await m.react('❌')
        return m.reply(`❌ *ᴍᴏᴅᴏ sᴏʟᴏ ɢʀᴜᴘᴏs ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot ahora puede ser usado en cualquier lugar (Grupos y Privado)`)
    } else {
        db.setting('onlyGc', true)
        db.setting('onlyPc', false)
        await m.react('✅')
        return m.reply(`✅ *ᴍᴏᴅᴏ sᴏʟᴏ ɢʀᴜᴘᴏs ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> ¡El bot ahora solo responderá dentro de grupos!`)
    }
}

export { pluginConfig as config, handler }
