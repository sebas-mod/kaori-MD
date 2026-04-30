import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'minar',
    alias: ['mining', 'mine', 'tambang'],
    category: 'rpg',
    description: 'Trabajá en la mina para conseguir minerales y gemas',
    usage: '.minar',
    example: '.minar',
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
    
    const staminaCost = 20
    user.rpg.stamina = user.rpg.stamina || 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐈𝐍 𝐄𝐍𝐄𝐑𝐆𝐈́𝐀*\n\n` +
            `> Necesitás ${staminaCost} de stamina para laburar en la mina.\n` +
            `> Tu stamina: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.reply('⛏️ *Picando piedra...*')
    await new Promise(r => setTimeout(r, 2000))
    
    const drops = [
        { item: 'rock', chance: 80, name: '🪨 Piedra', min: 2, max: 5 },
        { item: 'coal', chance: 50, name: '⚫ Carbón', min: 1, max: 3 },
        { item: 'iron', chance: 30, name: '⛓️ Hierro', min: 1, max: 2 },
        { item: 'gold', chance: 15, name: '🥇 Oro', min: 1, max: 1 },
        { item: 'diamond', chance: 5, name: '💠 Diamante', min: 1, max: 1 },
        { item: 'emerald', chance: 2, name: '💚 Esmeralda', min: 1, max: 1 }
    ]
    
    let results = []
    for (const drop of drops) {
        if (Math.random() * 100 <= drop.chance) {
            const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
            user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty
            results.push({ name: drop.name, qty })
        }
    }
    
    if (results.length === 0) {
        user.inventory['rock'] = (user.inventory['rock'] || 0) + 1
        results.push({ name: '🪨 Piedra', qty: 1 })
    }
    
    const expGain = Math.floor(Math.random() * 500) + 100
    await addExpWithLevelCheck(sock, m, db, user, expGain)
    
    db.save()
    
    let txt = `⛏️ *𝐌𝐈𝐍𝐄𝐑𝐈́𝐀 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐀*\n\n`
    txt += `╭┈┈⬡「 📦 *𝐁𝐎𝐓𝐈́𝐍* 」\n`
    for (const r of results) {
        txt += `┃ ${r.name}: *+${r.qty}*\n`
    }
    txt += `┃ 🚄 Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Seguí minando con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃**!`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
