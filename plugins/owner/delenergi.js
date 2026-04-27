import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'delenergi',
    alias: ['quitarenergia', 'removeenergi', 'quitarenergia', 'delenergy', 'restarenergia'],
    category: 'owner',
    description: 'Resta energía a un usuario específico',
    usage: '.delenergi <cantidad> @user',
    example: '.delenergi 50 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Ilimitado'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    // Buscar el argumento numérico que no sea una mención
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    // Si no hay mención pero hay cantidad, se aplica al que envía el mensaje
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⚡ *QUITAR ENERGÍA*\n\n` +
            `> \`${m.prefix}delenergi <cantidad>\` - de ti mismo\n` +
            `> \`${m.prefix}delenergi <cantidad> @user\` - de un usuario\n\n` +
            `\`Ejemplo: ${m.prefix}delenergi 50\``
        )
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌ *ERROR*\n\n> El usuario no existe en la base de datos`)
    }
    
    // Si el usuario tenía energía ilimitada (-1), le ponemos una base antes de restar
    if (user.energi === -1) {
        db.setUser(targetJid, { energi: 25 })
    }
    
    const newEnergi = db.updateEnergi(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ENERGÍA RESTADA*\n\n` +
        `╭┈┈⬡「 📋 *DETALLES* 」\n` +
        `┃ 👤 Usuario: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ Restado: *-${formatNumber(amount)}*\n` +
        `┃ ⚡ Restante: *${formatNumber(newEnergi)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
