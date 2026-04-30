import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'cofre',
    alias: ['treasure', 'chest', 'peti', 'openbox', 'tesoro'],
    category: 'rpg',
    description: 'Abrí cofres de tesoro para obtener recompensas aleatorias',
    usage: '.cofre',
    example: '.cofre woodenchest',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

const CHEST_TYPES = {
    woodenchest: { name: '📦 Cofre de Madera', minGold: 50, maxGold: 200, expRange: [30, 80], rarity: 'common' },
    ironchest: { name: '🗃️ Cofre de Hierro', minGold: 150, maxGold: 500, expRange: [80, 150], rarity: 'uncommon' },
    goldchest: { name: '🎁 Cofre de Oro', minGold: 400, maxGold: 1200, expRange: [150, 300], rarity: 'rare' },
    diamondchest: { name: '💎 Cofre de Diamante', minGold: 1000, maxGold: 3000, expRange: [300, 600], rarity: 'epic' },
    mysterybox: { name: '🎲 Caja Misteriosa', minGold: 500, maxGold: 5000, expRange: [200, 800], rarity: 'legendary' }
}

const LOOT_TABLE = {
    common: [
        { item: 'madera', qty: [3, 8], chance: 40 },
        { item: 'hierro', qty: [1, 4], chance: 30 },
        { item: 'hierba', qty: [2, 5], chance: 25 },
        { item: 'pocion', qty: [1, 2], chance: 20 }
    ],
    uncommon: [
        { item: 'hierro', qty: [3, 7], chance: 40 },
        { item: 'oro', qty: [1, 3], chance: 25 },
        { item: 'cuero', qty: [2, 5], chance: 30 },
        { item: 'pocion', qty: [2, 4], chance: 35 }
    ],
    rare: [
        { item: 'oro', qty: [2, 5], chance: 45 },
        { item: 'diamante', qty: [1, 2], chance: 20 },
        { item: 'pocion_mana', qty: [1, 3], chance: 30 },
        { item: 'pocion_fuerza', qty: [1, 1], chance: 15 }
    ],
    epic: [
        { item: 'diamante', qty: [2, 4], chance: 40 },
        { item: 'oro', qty: [5, 10], chance: 50 },
        { item: 'elixir', qty: [1, 1], chance: 15 },
        { item: 'escama_dragon', qty: [1, 2], chance: 10 }
    ],
    legendary: [
        { item: 'diamante', qty: [3, 8], chance: 50 },
        { item: 'nucleo_titan', qty: [1, 2], chance: 20 },
        { item: 'nucleo_divino', qty: [1, 1], chance: 10 },
        { item: 'elixir', qty: [1, 3], chance: 25 },
        { item: 'espada_oro', qty: [1, 1], chance: 5 }
    ]
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}

    const args = m.args || []
    const chestType = args[0]?.toLowerCase()

    const availableChests = Object.entries(CHEST_TYPES).filter(([key]) => (user.inventory[key] || 0) > 0)

    if (!chestType) {
        let txt = `🎁 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐓𝐄𝐒𝐎𝐑𝐎𝐒*\n\n`

        if (availableChests.length === 0) {
            txt += `> ❌ ¡No tenés cofres para abrir!\n\n`
            txt += `💡 *Cómo conseguir cofres:*\n`
            txt += `> • Explorando Mazmorras\n`
            txt += `> • Derrotando Bosses\n`
            txt += `> • Recompensas Diarias/Semanales\n`
            txt += `> • Comprando en la Tienda`
        } else {
            txt += `╭┈┈⬡「 📦 *𝐓𝐔𝐒 𝐂𝐎𝐅𝐑𝐄𝐒* 」\n`
            for (const [key, chest] of availableChests) {
                txt += `┃ ${chest.name}: *${user.inventory[key]}*\n`
                txt += `┃ → \`${m.prefix}cofre ${key}\`\n┃\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        return m.reply(txt)
    }

    const chest = CHEST_TYPES[chestType]
    if (!chest) {
        return m.reply(`❌ ¡Ese tipo de cofre no existe!`)
    }

    if ((user.inventory[chestType] || 0) < 1) {
        return m.reply(`❌ ¡No tenés ningún ${chest.name} en tu inventario!`)
    }

    // Consumir el cofre
    user.inventory[chestType]--
    if (user.inventory[chestType] <= 0) delete user.inventory[chestType]

    await m.react('🎁')
    await m.reply(`🔓 *𝐀𝐁𝐑𝐈𝐄𝐍𝐃𝐎 ${chest.name.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2000))

    // Calcular recompensas base
    const goldReward = Math.floor(Math.random() * (chest.maxGold - chest.minGold)) + chest.minGold
    const expReward = Math.floor(Math.random() * (chest.expRange[1] - chest.expRange[0])) + chest.expRange[0]

    user.koin = (user.koin || 0) + goldReward

    // Calcular loot de ítems
    const droppedItems = []
    const lootPool = LOOT_TABLE[chest.rarity] || LOOT_TABLE.common

    for (const loot of lootPool) {
        if (Math.random() * 100 < loot.chance) {
            const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0]
            user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty
            droppedItems.push(`${loot.item} x${qty}`)
        }
    }

    await addExpWithLevelCheck(sock, m, db, user, expReward)
    db.save()

    await m.react('✅')

    let txt = `🎉 *¡𝐂𝐎𝐅𝐑𝐄 𝐀𝐁𝐈𝐄𝐑𝐓𝐎!*\n\n`
    txt += `╭┈┈⬡「 🎁 *𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀𝐒* 」\n`
    txt += `┃ 📦 Cofre: *${chest.name}*\n`
    txt += `┃ 💰 Guita: *+$${goldReward.toLocaleString('es-AR')}*\n`
    txt += `┃ ✨ EXP: *+${expReward}*\n`
    if (droppedItems.length > 0) {
        txt += `┃ 🎲 Loot extra:\n`
        for (const item of droppedItems) {
            txt += `┃   • ${item}\n`
        }
    }
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Seguí explorando con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`

    return m.reply(txt)
}

export { pluginConfig as config, handler }
