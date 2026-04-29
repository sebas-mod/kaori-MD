import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'similarity',
    alias: ['setsimilarity', 'sim', 'similitud'],
    category: 'owner',
    description: 'Activa o desactiva la función de similitud (sugerencias por errores de escritura)',
    usage: '.similarity <on/off>',
    example: '.similarity on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    if (!args[0]) {
        return m.reply(`⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n> \`.similarity on\` - Activar\n> \`.similarity off\` - Desactivar`)
    }
    
    const mode = args[0].toLowerCase()
    
    if (mode === 'on') {
        db.setting('similarity', true)
        await m.react('✅')
        await m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La función de comandos por similitud ha sido *ACTIVADA*`)
    } else if (mode === 'off') {
        db.setting('similarity', false)
        await m.react('✅')
        await m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La función de comandos por similitud ha sido *DESACTIVADA*`)
    } else {
        return m.reply(`⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n> \`.similarity on\` - Activar\n> \`.similarity off\` - Desactivar`)
    }
    
    await db.save()
}

export { pluginConfig as config, handler }
