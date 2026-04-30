import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'semanal',
    alias: ['weekly', 'mingguan', 'recompensasemanal'],
    category: 'rpg',
    description: 'Reclamá tu recompensa semanal (mucho más grande que la diaria)',
    usage: '.semanal',
    example: '.semanal',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

const WEEKLY_COOLDOWN = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.cooldowns) user.cooldowns = {}
    const lastWeekly = user.cooldowns.weekly || 0
    const now = Date.now()

    // Verificación de tiempo restante
    if (now - lastWeekly < WEEKLY_COOLDOWN) {
        const remaining = lastWeekly + WEEKLY_COOLDOWN - now
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        return m.reply(
            `🕕 *𝐄𝐒𝐏𝐄𝐑𝐀́ 𝐔𝐍 𝐏𝐎𝐂𝐎*\n\n` +
            `> Ya reclamaste tu recompensa de esta semana.\n` +
            `> Faltan: *${days} días y ${hours} horas* para volver a reclamar.`
        )
    }

    // Generación de recompensas aleatorias
    const expReward = Math.floor(Math.random() * 20000) + 10000
    const moneyReward = Math.floor(Math.random() * 50000) + 30000
    const crateReward = Math.floor(Math.random() * 3) + 1

    if (!user.rpg) user.rpg = {}
    user.rpg.exp = (user.rpg.exp || 0) + expReward
    user.koin = (user.koin || 0) + moneyReward

    if (!user.inventory) user.inventory = {}
    user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward

    // Guardar timestamp y actualizar DB
    user.cooldowns.weekly = now
    db.save()

    let txt = `🎊 *¡𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𝐒𝐄𝐌𝐀𝐍𝐀𝐋 𝐂𝐎𝐁𝐑𝐀𝐃𝐀!*\n\n`
    txt += `╭┈┈⬡「 🎁 *𝐁𝐎𝐓𝐈́𝐍* 」\n`
    txt += `┃ ✨ EXP: *+${expReward.toLocaleString('es-AR')}*\n`
    txt += `┃ 🪙 Guita: *+$${moneyReward.toLocaleString('es-AR')}*\n`
    txt += `┃ 🛍️ Cofre Uncommon: *+${crateReward}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Volvé la semana que viene para más en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
