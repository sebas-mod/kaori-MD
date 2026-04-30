import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'carterear',
    alias: ['steal', 'mencuri', 'curi', 'pickpocket', 'afanar'],
    category: 'rpg',
    description: 'Robale a los ciudadanos para conseguir guita y objetos',
    usage: '.carterear',
    example: '.carterear',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 300, // 5 minutos
    energi: 2,
    isEnabled: true
}

const TARGETS = [
    { name: '👨‍🌾 Granjero', difficulty: 1, minGold: 50, maxGold: 150, catchChance: 10 },
    { name: '👨‍💼 Comerciante', difficulty: 2, minGold: 100, maxGold: 300, catchChance: 20 },
    { name: '🧙‍♂️ Hechicero', difficulty: 3, minGold: 200, maxGold: 500, catchChance: 30 },
    { name: '⚔️ Caballero', difficulty: 4, minGold: 300, maxGold: 800, catchChance: 40 },
    { name: '👑 Noble', difficulty: 5, minGold: 500, maxGold: 1500, catchChance: 50 },
    { name: '🏰 Rey', difficulty: 6, minGold: 1000, maxGold: 3000, catchChance: 60 }
]

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}

    const staminaCost = 15
    user.rpg.stamina = user.rpg.stamina ?? 100

    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Necesitás: ${staminaCost}\n` +
            `> Tenés: ${user.rpg.stamina}`
        )
    }

    const userLevel = user.level || 1
    const availableTargets = TARGETS.filter(t => userLevel >= t.difficulty * 3)

    if (availableTargets.length === 0) {
        return m.reply(`❌ ¡Tu nivel es muy bajo! Necesitás al menos nivel 3 para empezar a carterear.`)
    }

    user.rpg.stamina -= staminaCost
    const target = availableTargets[Math.floor(Math.random() * availableTargets.length)]

    await m.react('🥷')
    await m.reply(`🥷 *Robándole discretamente al ${target.name}...*`)
    await new Promise(r => setTimeout(r, 2000))

    const luckBonus = (user.rpg.luck || 5) * 2
    const adjustedCatchChance = Math.max(5, target.catchChance - luckBonus)
    const isCaught = Math.random() * 100 < adjustedCatchChance

    if (isCaught) {
        const goldLoss = Math.floor((user.koin || 0) * 0.1)
        const healthLoss = 10 + target.difficulty * 5

        user.koin = Math.max(0, (user.koin || 0) - goldLoss)
        user.rpg.health = Math.max(1, (user.rpg.health || 100) - healthLoss)

        db.save()

        await m.react('💀')
        return m.reply(
            `💀 *¡𝐓𝐄 𝐀𝐆𝐀𝐑𝐑𝐀𝐑𝐎𝐍!*\n\n` +
            `> El ${target.name} se dio cuenta y te molió a palos.\n\n` +
            `╭┈┈⬡「 💔 *𝐏𝐄𝐍𝐀𝐋𝐈𝐙𝐀𝐂𝐈𝐎́𝐍* 」\n` +
            `┃ 💸 Multa: *-$${goldLoss.toLocaleString('es-AR')}*\n` +
            `┃ ❤️ Salud: *-${healthLoss} HP*\n` +
            `┃ ⚡ Stamina: *-${staminaCost}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `💡 *Tip:* ¡Subí tu Suerte (luck) para que no te enganchen tan seguido!`
        )
    }

    const goldStolen = Math.floor(Math.random() * (target.maxGold - target.minGold)) + target.minGold
    const expReward = 50 + target.difficulty * 30

    user.koin = (user.koin || 0) + goldStolen
    await addExpWithLevelCheck(sock, m, db, user, expReward)

    // Chance de encontrar un objeto extra
    const bonusItem = Math.random() > 0.7
    let bonusText = ''
    if (bonusItem) {
        const items = ['potion', 'key', 'gem', 'ring']
        const item = items[Math.floor(Math.random() * items.length)]
        user.inventory[item] = (user.inventory[item] || 0) + 1
        bonusText = `\n┃ 📦 Bonus: *${item} x1*`
    }

    db.save()

    await m.react('💰')
    return m.reply(
        `🥷 *¡𝐑𝐎𝐁𝐎 𝐄𝐗𝐈𝐓𝐎𝐒𝐎!*\n\n` +
        `> Pudiste sacarle la billetera al ${target.name}.\n\n` +
        `╭┈┈⬡「 💰 *𝐁𝐎𝐓𝐈́𝐍* 」\n` +
        `┃ 💵 Guita: *+$${goldStolen.toLocaleString('es-AR')}*\n` +
        `┃ ✨ EXP: *+${expReward}*${bonusText}\n` +
        `┃ ⚡ Stamina: *-${staminaCost}*\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Seguí así en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`
    )
}

export { pluginConfig as config, handler }
