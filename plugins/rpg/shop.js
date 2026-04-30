import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'tienda',
    alias: ['shop', 'beli', 'jual', 'toko', 'store', 'buy', 'sell', 'comprar', 'vender'],
    category: 'rpg',
    description: 'Comprá y vendé ítems del RPG',
    usage: '.tienda <comprar/vender> <ítem> <cantidad>',
    example: '.tienda comprar potion 1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const ITEMS = {
    // Ítems para comprar (Buyable)
    potion: { price: 500, type: 'buyable', name: '🥤 Poción de Vida' },
    mpotion: { price: 500, type: 'buyable', name: '🧪 Poción de Mana' },
    stamina: { price: 1000, type: 'buyable', name: '⚡ Poción de Stamina' },
    
    common: { price: 2000, type: 'buyable', name: '📦 Caja Común' },
    uncommon: { price: 10000, type: 'buyable', name: '🛍️ Caja Poco Común' },
    mythic: { price: 50000, type: 'buyable', name: '🎁 Caja Mítica' },
    legendary: { price: 200000, type: 'buyable', name: '💎 Caja Legendaria' },
    
    // Ítems para vender (Sellable)
    rock: { price: 20, type: 'sellable', name: '🪨 Piedra' },
    coal: { price: 50, type: 'sellable', name: '⚫ Carbón' },
    iron: { price: 200, type: 'sellable', name: '⛓️ Hierro' },
    gold: { price: 1000, type: 'sellable', name: '🥇 Oro' },
    diamond: { price: 5000, type: 'sellable', name: '💠 Diamante' },
    emerald: { price: 10000, type: 'sellable', name: '💚 Esmeralda' },
    
    trash: { price: 10, type: 'sellable', name: '🗑️ Basura' },
    fish: { price: 100, type: 'sellable', name: '🐟 Pescado' },
    prawn: { price: 200, type: 'sellable', name: '🦐 Langostino' },
    octopus: { price: 500, type: 'sellable', name: '🐙 Pulpo' },
    shark: { price: 2000, type: 'sellable', name: '🦈 Tiburón' },
    whale: { price: 10000, type: 'sellable', name: '🐳 Ballena' }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    
    const action = args[0]?.toLowerCase()
    
    if (!action || !['buy', 'sell', 'comprar', 'vender'].includes(action)) {
        let txt = `🛒 *𝐑𝐏𝐆 𝐒𝐇𝐎𝐏*\n\n`
        txt += `╭┈┈⬡「 📋 *𝐔𝐒𝐎* 」\n`
        txt += `┃ > \`.tienda comprar <ítem> <cantidad>\`\n`
        txt += `┃ > \`.tienda vender <ítem> <cantidad>\`\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 🛍️ *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐂𝐎𝐌𝐏𝐑𝐀* 」\n`
        for (const [key, item] of Object.entries(ITEMS)) {
            if (item.type === 'buyable') {
                txt += `┃ ${item.name}: $${item.price.toLocaleString('es-AR')} [\`${key}\`]\n`
            }
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 💰 *𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐕𝐄𝐍𝐓𝐀* 」\n`
        for (const [key, item] of Object.entries(ITEMS)) {
            if (item.type === 'sellable') {
                txt += `┃ ${item.name}: $${item.price.toLocaleString('es-AR')} [\`${key}\`]\n`
            }
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    const itemKey = args[1]?.toLowerCase()
    const amount = parseInt(args[2]) || 1
    
    if (!itemKey || !ITEMS[itemKey]) {
        return m.reply(
            `❌ *𝐈́𝐓𝐄𝐌 𝐍𝐎 𝐄𝐍𝐂𝐎𝐍𝐓𝐑𝐀𝐃𝐎*\n\n` +
            `> ¡Ese ítem no existe en la tienda!\n` +
            `> Mirá la lista con: \`.tienda\``
        )
    }
    
    const item = ITEMS[itemKey]
    const cleanJid = m.sender.split('@')[0]
    
    if (action === 'buy' || action === 'comprar') {
        if (item.type !== 'buyable') {
            return m.reply(`❌ *𝐍𝐎 𝐒𝐄 𝐏𝐔𝐄𝐃𝐄 𝐂𝐎𝐌𝐏𝐑𝐀𝐑*\n\n> Este ítem solo se puede vender.`)
        }
        
        const totalCost = item.price * amount
        if ((user.koin || 0) < totalCost) {
            return m.reply(
                `❌ *𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> Tenés: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
                `> Necesitás: $${totalCost.toLocaleString('es-AR')}`
            )
        }
        
        if (!db.db.data.users[cleanJid]) db.setUser(m.sender)
        if (!db.db.data.users[cleanJid].inventory) db.db.data.users[cleanJid].inventory = {}
        
        db.db.data.users[cleanJid].koin -= totalCost
        db.db.data.users[cleanJid].inventory[itemKey] = (db.db.data.users[cleanJid].inventory[itemKey] || 0) + amount
        
        await db.save()
        return m.reply(`✅ *𝐂𝐎𝐌𝐏𝐑𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n> 🛒 Ítem: *${amount}x ${item.name}*\n> 💸 Total: $${totalCost.toLocaleString('es-AR')}`)
    }
    
    if (action === 'sell' || action === 'vender') {
        if (item.type !== 'sellable') {
            return m.reply(`❌ *𝐍𝐎 𝐒𝐄 𝐏𝐔𝐄𝐃𝐄 𝐕𝐄𝐍𝐃𝐄𝐑*\n\n> Este ítem no tiene valor de reventa.`)
        }
        
        if (!db.db.data.users[cleanJid]) db.setUser(m.sender)
        const userInventory = db.db.data.users[cleanJid].inventory || {}
        const userStock = userInventory[itemKey] || 0
        
        if (userStock < amount) {
            return m.reply(
                `❌ *𝐒𝐈𝐍 𝐒𝐓𝐎𝐂𝐊*\n\n` +
                `> Tenés ${userStock}x de ${item.name}\n` +
                `> Querés vender: ${amount}`
            )
        }
        
        const totalProfit = item.price * amount
        
        db.db.data.users[cleanJid].inventory[itemKey] = userStock - amount
        db.db.data.users[cleanJid].koin = (db.db.data.users[cleanJid].koin || 0) + totalProfit
        
        await db.save()
        return m.reply(`✅ *𝐕𝐄𝐍𝐓𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n> 📦 Ítem: *${amount}x ${item.name}*\n> 💰 Ganancia: $${totalProfit.toLocaleString('es-AR')}`)
    }
}

export { pluginConfig as config, handler }
