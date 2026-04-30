import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'mercado',
    alias: ['merchant', 'npc', 'toko', 'shop', 'comprar', 'vender'],
    category: 'rpg',
    description: 'Comprá o vendé ítems al mercader local',
    usage: '.mercado <buy/sell> <item> <cantidad>',
    example: '.mercado buy potion 5',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const SHOP_ITEMS = {
    potion: { name: '🧪 Poción', buyPrice: 100, sellPrice: 50, desc: 'Recupera 50 HP' },
    manapotion: { name: '💙 Poción de Maná', buyPrice: 150, sellPrice: 75, desc: 'Recupera 50 de Maná' },
    antidote: { name: '💊 Antídoto', buyPrice: 80, sellPrice: 40, desc: 'Cura el veneno' },
    bread: { name: '🍞 Pan', buyPrice: 30, sellPrice: 15, desc: 'Recupera 10 de stamina' },
    energydrink: { name: '⚡ Energizante', buyPrice: 200, sellPrice: 100, desc: 'Recupera 50 de stamina' },
    pickaxe: { name: '⛏️ Pico', buyPrice: 500, sellPrice: 250, desc: 'Para minar minerales' },
    fishingrod: { name: '🎣 Caña de pescar', buyPrice: 400, sellPrice: 200, desc: 'Para pescar en el lago' },
    wood: { name: '🪵 Madera', buyPrice: 50, sellPrice: 25, desc: 'Material básico' },
    iron: { name: '🔩 Hierro', buyPrice: 80, sellPrice: 40, desc: 'Material de metal' },
    leather: { name: '🧶 Cuero', buyPrice: 60, sellPrice: 30, desc: 'Material para armaduras' },
    string: { name: '🧵 Hilo', buyPrice: 40, sellPrice: 20, desc: 'Material para arcos' },
    herb: { name: '🌿 Hierba', buyPrice: 70, sellPrice: 35, desc: 'Ingrediente de alquimia' },
    gold: { name: '🪙 Oro', buyPrice: 500, sellPrice: 250, desc: 'Material valioso' },
    diamond: { name: '💎 Diamante', buyPrice: 2000, sellPrice: 1000, desc: 'Material de lujo' }
}

function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const itemKey = args[1]?.toLowerCase()
    const qty = Math.max(1, parseInt(args[2]) || 1)
    
    if (!action || !['buy', 'sell', 'list', 'comprar', 'vender', 'lista'].includes(action)) {
        let txt = `🏪 *𝐌𝐄𝐑𝐂𝐀𝐃𝐎 𝐃𝐄 𝐊𝐄𝐈*\n\n`
        txt += `> ¡Bienvenido a la tienda! ¿Qué vas a llevar hoy?\n\n`
        txt += `╭┈┈⬡「 📋 *𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒* 」\n`
        txt += `┃ ${m.prefix}mercado lista\n`
        txt += `┃ ${m.prefix}mercado comprar <item> <cantidad>\n`
        txt += `┃ ${m.prefix}mercado vender <item> <cantidad>\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💰 *Tu Saldo:* $${(user.koin || 0).toLocaleString('es-AR')}`
        return m.reply(txt)
    }
    
    if (action === 'list' || action === 'lista') {
        let txt = `🏪 *𝐈́𝐓𝐄𝐌𝐒 𝐃𝐈𝐒𝐏𝐎𝐍𝐈𝐁𝐋𝐄𝐒*\n\n`
        txt += `╭┈┈⬡「 📦 *𝐒𝐇𝐎𝐏* 」\n`
        
        for (const [key, item] of Object.entries(SHOP_ITEMS)) {
            txt += `┃ ${item.name}\n`
            txt += `┃ 💵 Compra: $${item.buyPrice.toLocaleString('es-AR')}\n`
            txt += `┃ 💰 Venta: $${item.sellPrice.toLocaleString('es-AR')}\n`
            txt += `┃ 📝 ${item.desc}\n`
            txt += `┃ → \`${key}\`\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    if (action === 'buy' || action === 'comprar') {
        if (!itemKey) {
            return m.reply(`❌ ¡Decime qué querés comprar!\n\n> Ejemplo: \`${m.prefix}mercado comprar potion 5\``)
        }
        
        const item = SHOP_ITEMS[itemKey]
        if (!item) {
            return m.reply(`❌ ¡Ese ítem no existe en mis estanterías!\n\n> Poné \`${m.prefix}mercado lista\` para ver qué tengo.`)
        }
        
        const totalCost = item.buyPrice * qty
        if ((user.koin || 0) < totalCost) {
            return m.reply(
                `❌ *𝐆𝐔𝐈𝐓𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> Costo total: $${totalCost.toLocaleString('es-AR')}\n` +
                `> Tu saldo: $${(user.koin || 0).toLocaleString('es-AR')}`
            )
        }
        
        user.koin -= totalCost
        user.inventory[itemKey] = (user.inventory[itemKey] || 0) + qty
        db.save()
        
        return m.reply(
            `✅ *𝐂𝐎𝐌𝐏𝐑𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n` +
            `╭┈┈⬡「 🛒 *𝐃𝐄𝐓𝐀𝐋𝐋𝐄* 」\n` +
            `┃ 📦 Ítem: *${item.name}*\n` +
            `┃ 📊 Cantidad: *${qty}*\n` +
            `┃ 💵 Total pagado: *-$${totalCost.toLocaleString('es-AR')}*\n` +
            `┃ 💰 Saldo restante: *$${user.koin.toLocaleString('es-AR')}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (action === 'sell' || action === 'vender') {
        if (!itemKey) {
            return m.reply(`❌ ¡Decime qué querés vender!\n\n> Ejemplo: \`${m.prefix}mercado vender iron 10\``)
        }
        
        const item = SHOP_ITEMS[itemKey]
        if (!item) {
            return m.reply(`❌ ¡No me interesa comprar ese ítem!`)
        }
        
        const have = user.inventory[itemKey] || 0
        if (have < qty) {
            return m.reply(
                `❌ *𝐍𝐎 𝐓𝐄𝐍𝐄́𝐒 𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
                `> En inventario: ${have}\n` +
                `> Querés vender: ${qty}`
            )
        }
        
        const totalEarn = item.sellPrice * qty
        user.koin = (user.koin || 0) + totalEarn
        user.inventory[itemKey] -= qty
        if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
        db.save()
        
        return m.reply(
            `✅ *𝐕𝐄𝐍𝐓𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n` +
            `╭┈┈⬡「 💰 *𝐃𝐄𝐓𝐀𝐋𝐋𝐄* 」\n` +
            `┃ 📦 Ítem: *${item.name}*\n` +
            `┃ 📊 Cantidad: *${qty}*\n` +
            `┃ 💵 Ganancia: *+$${totalEarn.toLocaleString('es-AR')}*\n` +
            `┃ 💰 Saldo actual: *$${user.koin.toLocaleString('es-AR')}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
}

export { pluginConfig as config, handler }
