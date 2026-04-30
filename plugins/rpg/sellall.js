import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'venderatodo',
    alias: ['sellall', 'jualsemua', 'quicksell'],
    category: 'rpg',
    description: 'Vende todos tus ítems recolectados de una sola vez',
    usage: '.venderatodo',
    example: '.venderatodo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const SELL_PRICES = {
    rock: 20, coal: 50, iron: 200, gold: 1000, diamond: 5000, emerald: 10000,
    trash: 10, fish: 100, prawn: 200, octopus: 500, shark: 2000, whale: 10000,
    wood: 30, stick: 15, apple: 50, rubber: 100,
    rabbit: 150, deer: 300, boar: 500, bear: 1000, lion: 2000, dragon: 10000
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    
    let totalEarned = 0
    let soldItems = []
    
    for (const [item, price] of Object.entries(SELL_PRICES)) {
        const qty = user.inventory[item] || 0
        if (qty > 0) {
            const earned = qty * price
            totalEarned += earned
            soldItems.push({ item, qty, earned })
            user.inventory[item] = 0 // Limpia el inventario del ítem vendido
        }
    }
    
    if (soldItems.length === 0) {
        return m.reply(`❌ *𝐒𝐈𝐍 𝐈́𝐓𝐄𝐌𝐒*\n\n> ¡No tenés nada en el inventario que se pueda vender!`)
    }
    
    // Sumar el total a la billetera del usuario
    user.koin = (user.koin || 0) + totalEarned
    
    db.save()
    
    let txt = `💰 *𝐕𝐄𝐍𝐓𝐀 𝐌𝐀𝐒𝐈𝐕𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n`
    txt += `╭┈┈⬡「 📦 *𝐃𝐄𝐓𝐀𝐋𝐋𝐄* 」\n`
    
    // Mostrar los primeros 10 ítems para no saturar el mensaje
    for (const s of soldItems.slice(0, 10)) {
        txt += `┃ ${s.item}: ${s.qty}x = $${s.earned.toLocaleString('es-AR')}\n`
    }
    
    if (soldItems.length > 10) {
        txt += `┃ ... y otros ${soldItems.length - 10} ítems más\n`
    }
    
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> 💵 Ganancia Total: *$${totalEarned.toLocaleString('es-AR')}*\n`
    txt += `> ¡Gracias por comerciar con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
