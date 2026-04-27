import { getDatabase } from '../../src/lib/ourin-database.js'
import { calculateLevel, getRole } from '../user/level.js'

const pluginConfig = {
    name: 'dellevel',
    alias: ['restar nivel', 'quitarnivel', 'quitarlevel', 'dellvl'],
    category: 'owner',
    description: 'Reduce el nivel de un usuario (ajustando su EXP)',
    usage: '.dellevel <cantidad> @user',
    example: '.dellevel 5 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (m.mentionedJid?.length) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args
    
    // Buscar argumento numérico que no sea una mención
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let levels = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    // Si no hay mención, aplicar a uno mismo si hay cantidad
    if (!targetJid && levels > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || levels <= 0) {
        return m.reply(
            `📊 *QUITAR NIVEL*\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ > \`${m.prefix}dellevel <cantidad>\` - a ti mismo\n` +
            `┃ > \`${m.prefix}dellevel <cantidad> @user\` - a otra persona\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Ejemplo: \`${m.prefix}dellevel 5\``
        )
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    if (!user.rpg) user.rpg = {}
    
    const oldLevel = calculateLevel(user.rpg.exp || 0)
    // Se calcula la EXP a eliminar (basado en la lógica original de 20k por nivel)
    const expToRemove = levels * 20000
    user.rpg.exp = Math.max(0, (user.rpg.exp || 0) - expToRemove)
    const newLevel = calculateLevel(user.rpg.exp)
    
    db.save()
    await m.react('✅')
    
    await m.reply(
        `✅ *NIVEL REDUCIDO*\n\n` +
        `╭┈┈⬡「 📋 *DETALLES* 」\n` +
        `┃ 👤 Usuario: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ Quitado: *-${levels} Niveles*\n` +
        `┃ 🚄 EXP Eliminada: *-${expToRemove.toLocaleString('es-ES')}*\n` +
        `┃ 📊 Nivel: *${oldLevel} → ${newLevel}*\n` +
        `┃ Rango: ${getRole(newLevel)}\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
