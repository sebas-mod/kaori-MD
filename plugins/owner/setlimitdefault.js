import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'setlimitdefault',
    alias: ['setlimitpordefecto', 'limitodefecto', 'limiteinicial'],
    category: 'owner',
    description: 'Establece el límite predeterminado para nuevos usuarios',
    usage: '.setlimitdefault <cantidad>',
    example: '.setlimitdefault 50',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const newLimit = parseInt(args[0])
    
    if (!args[0] || isNaN(newLimit)) {
        const db = getDatabase()
        const currentDefault = db.setting('defaultLimit') || config.limits?.default || 25
        
        return m.reply(
            `📊 *sᴇᴛ ᴅᴇғᴀᴜʟᴛ ʟɪᴍɪᴛ*\n\n` +
            `> Límite actual por defecto: \`${currentDefault}\`\n\n` +
            `*Modo de uso:*\n` +
            `> \`${m.prefix}setlimitdefault <cantidad>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}setlimitdefault 50\``
        )
    }
    
    if (newLimit < 1 || newLimit > 1000) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El límite debe estar entre 1 y 1000`)
    }
    
    const db = getDatabase()
    db.setting('defaultLimit', newLimit)
    
    await m.reply(
        `✅ *ᴄᴏɴғɪɢᴜʀᴀᴅᴏ*\n\n` +
        `> El límite por defecto ha cambiado a: \`${newLimit}\`\n` +
        `> Los nuevos usuarios recibirán esta cantidad.`
    )
}

export { pluginConfig as config, handler }
