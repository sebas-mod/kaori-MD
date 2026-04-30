import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'loteria',
    alias: ['gacha', 'spin', 'suerte', 'undian'],
    category: 'rpg',
    description: 'Probá tu suerte en la lotería para ganar premios únicos',
    usage: '.loteria <1/10>',
    example: '.loteria 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

const GACHA_POOL = [
    { item: 'trash', name: '🗑️ Basura', chance: 30, rarity: 'common' },
    { item: 'wood', name: '🪵 Madera', chance: 20, qty: [3, 8], rarity: 'common' },
    { item: 'iron', name: '🔩 Hierro', chance: 15, qty: [2, 5], rarity: 'common' },
    { item: 'gold', name: '🪙 Oro', chance: 10, qty: [1, 3], rarity: 'uncommon' },
    { item: 'potion', name: '🧪 Poción', chance: 8, qty: [1, 3], rarity: 'uncommon' },
    { item: 'diamond', name: '💎 Diamante', chance: 5, qty: [1, 2], rarity: 'rare' },
    { item: 'goldchest', name: '🎁 Cofre de Oro', chance: 3, qty: [1, 1], rarity: 'rare' },
    { item: 'diamondchest', name: '💎 Cofre de Diamante', chance: 1.5, qty: [1, 1], rarity: 'epic' },
    { item: 'mysterybox', name: '🎲 Caja Misteriosa', chance: 0.8, qty: [1, 1], rarity: 'epic' },
    { item: 'goldsword', name: '🗡️ Espada de Oro', chance: 0.3, qty: [1, 1], rarity: 'legendary' },
    { item: 'diamondarmor', name: '💎 Armadura de Diamante', chance: 0.2, qty: [1, 1], rarity: 'legendary' },
    { item: 'divinecore', name: '⚡ Núcleo Divino', chance: 0.1, qty: [1, 1], rarity: 'mythic' }
]

const RARITY_COLORS = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    epic: '🟣',
    legendary: '🟡',
    mythic: '🔴'
}

const GACHA_COST = 500

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const pulls = Math.min(10, Math.max(1, parseInt(args[0]) || 1))
    const totalCost = GACHA_COST * pulls
    
    if ((user.koin || 0) < totalCost) {
        return m.reply(
            `🎰 *𝐋𝐎𝐓𝐄𝐑𝐈́𝐀 𝐆𝐀𝐂𝐇𝐀*\n\n` +
            `> Precio: $${GACHA_COST.toLocaleString('es-AR')}/tiro\n` +
            `> Total: $${totalCost.toLocaleString('es-AR')} (${pulls}x)\n\n` +
            `❌ ¡No tenés suficiente guita! Tu saldo: $${(user.koin || 0).toLocaleString('es-AR')}`
        )
    }
    
    user.koin -= totalCost
    
    await m.react('🎰')
    await m.reply(`🎰 *Girando la suerte ${pulls} veces...*`)
    await new Promise(r => setTimeout(r, 1500))
    
    const results = []
    let totalExp = 0
    
    for (let i = 0; i < pulls; i++) {
        const roll = Math.random() * 100
        let cumulative = 0
        let result = GACHA_POOL[0]
        
        for (const item of GACHA_POOL) {
            cumulative += item.chance
            if (roll <= cumulative) {
                result = item
                break
            }
        }
        
        if (result.item !== 'trash') {
            const qty = result.qty ? Math.floor(Math.random() * (result.qty[1] - result.qty[0] + 1)) + result.qty[0] : 1
            user.inventory[result.item] = (user.inventory[result.item] || 0) + qty
            results.push({ ...result, finalQty: qty })
            
            const expByRarity = { common: 10, uncommon: 30, rare: 80, epic: 150, legendary: 300, mythic: 500 }
            totalExp += expByRarity[result.rarity] || 10
        } else {
            results.push({ ...result, finalQty: 0 })
        }
    }
    
    await addExpWithLevelCheck(sock, m, db, user, totalExp)
    db.save()
    
    const grouped = {}
    for (const r of results) {
        if (!grouped[r.item]) {
            grouped[r.item] = { ...r, count: 0, totalQty: 0 }
        }
        grouped[r.item].count++
        grouped[r.item].totalQty += r.finalQty
    }
    
    let txt = `🎰 *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎𝐒 𝐃𝐄 𝐋𝐀 𝐒𝐔𝐄𝐑𝐓𝐄*\n\n`
    txt += `> Giros: ${pulls}x | Costo: $${totalCost.toLocaleString('es-AR')}\n\n`
    txt += `╭┈┈⬡「 🎁 *𝐁𝐎𝐓𝐈́𝐍* 」\n`
    
    for (const [key, item] of Object.entries(grouped)) {
        const rarityIcon = RARITY_COLORS[item.rarity] || '⚪'
        if (item.item === 'trash') {
            txt += `┃ ${rarityIcon} ${item.name} x${item.count}\n`
        } else {
            txt += `┃ ${rarityIcon} ${item.name} x${item.totalQty} (${item.count} acierto/s)\n`
        }
    }
    
    txt += `┃\n`
    txt += `┃ ✨ EXP total: +${totalExp}\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Seguí probando suerte con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃**!`
    
    const hasRare = results.some(r => ['epic', 'legendary', 'mythic'].includes(r.rarity))
    await m.react(hasRare ? '🎉' : '✅')
    
    return m.reply(txt)
}

export { pluginConfig as config, handler }
