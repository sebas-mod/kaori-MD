import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'establecerespera',
    alias: ['setdelay', 'espera', 'setjeda'],
    category: 'pushkontak', // Categoría original preservada
    description: 'Configura el intervalo de tiempo para pushkontak/jpm',
    usage: '.establecerespera <push/jpm> <ms>',
    example: '.establecerespera push 5000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    const esperaPushActual = db.setting('jedaPush') || 5000
    const esperaJpmActual = db.setting('jedaJpm') || 5000
    
    if (args.length < 2) {
        return m.reply(
            `⏱️ *ᴄᴏɴғɪɢᴜʀᴀʀ ᴇsᴘᴇʀᴀ*\n\n` +
            `╭┈┈⬡「 📋 *ᴀᴊᴜsᴛᴇs ᴀᴄᴛᴜᴀʟᴇs* 」\n` +
            `┃ 📤 ᴇsᴘᴇʀᴀ ᴘᴜsʜ: \`${esperaPushActual}ms\`\n` +
            `┃ 📢 ᴇsᴘᴇʀᴀ ᴊᴘᴍ: \`${esperaJpmActual}ms\`\n` +
            `╰┈┈⬡\n\n` +
            `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
            `> \`${m.prefix}establecerespera push 5000\`\n` +
            `> \`${m.prefix}establecerespera jpm 6000\`\n\n` +
            `> _1 segundo = 1000ms_`
        )
    }
    
    const target = args[0].toLowerCase()
    const value = parseInt(args[1])
    
    if (!['push', 'jpm'].includes(target)) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Opciones válidas: \`push\` o \`jpm\``)
    }
    
    if (isNaN(value) || value < 1000) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Ingresa un número mínimo de 1000 (1 segundo)`)
    }
    
    if (value > 60000) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El máximo permitido es 60000 (1 minuto)`)
    }
    
    if (target === 'push') {
        db.setting('jedaPush', value)
        m.react('✅')
        return m.reply(`✅ *ᴇsᴘᴇʀᴀ ᴘᴜsʜ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n> Intervalo: \`${value}ms\` (${value/1000} segundos)`)
    }
    
    if (target === 'jpm') {
        db.setting('jedaJpm', value)
        m.react('✅')
        return m.reply(`✅ *ᴇsᴘᴇʀᴀ ᴊᴘᴍ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n> Intervalo: \`${value}ms\` (${value/1000} segundos)`)
    }
}

export { pluginConfig as config, handler }
