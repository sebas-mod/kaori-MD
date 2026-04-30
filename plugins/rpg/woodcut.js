import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'talar',
    alias: ['woodcut', 'chop', 'nebang', 'kayu', 'madera'],
    category: 'rpg',
    description: 'Tala árboles para conseguir madera y otros recursos',
    usage: '.talar',
    example: '.talar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}

    const staminaCost = 15
    user.rpg.stamina = user.rpg.stamina || 100

    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Necesitás ${staminaCost} de stamina.\n` +
            `> Tu stamina actual: ${user.rpg.stamina}`
        )
    }

    user.rpg.stamina -= staminaCost

    await m.reply('🪓 *𝐓𝐚𝐥𝐚𝐧𝐝𝐨 𝐚́𝐫𝐛𝐨𝐥𝐞𝐬...*')
    await new Promise(r => setTimeout(r, 2000))

    const drops = [
        { item: 'madera', chance: 70, name: '🪵 Madera', min: 2, max: 5 },
        { item: 'rama', chance: 50, name: '🥢 Ramas', min: 1, max: 3 },
        { item: 'manzana', chance: 20, name: '🍎 Manzana', min: 1, max: 2 },
        { item: 'caucho', chance: 10, name: '⚫ Caucho', min: 1, max: 1 }
    ]

    let results = []
    for (const drop of drops) {
        if (Math.random() * 100 <= drop.chance) {
            const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
            user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty
            results.push({ name: drop.name, qty })
        }
    }

    // Garantizar al menos un trozo de madera si la suerte es muy mala
    if (results.length === 0) {
        user.inventory['madera'] = (user.inventory['madera'] || 0) + 1
        results.push({ name: '🪵 Madera', qty: 1 })
    }

    const expGain = Math.floor(Math.random() * 200) + 50
    await addExpWithLevelCheck(sock, m, db, user, expGain)

    db.save()

    let txt = `🪓 *¡𝐓𝐀𝐋𝐀 𝐅𝐈𝐍𝐀𝐋𝐈𝐿𝐀𝐃𝐀!*\n\n`
    txt += `╭┈┈⬡「 📦 *𝐑𝐄𝐂𝐎𝐋𝐄𝐂𝐂𝐈𝐎́𝐍* 」\n`
    for (const r of results) {
        txt += `┃ ${r.name}: *+${r.qty}*\n`
    }
    txt += `┃ ✨ Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Seguí sumando materiales en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
