import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'huerta',
    alias: ['jardin', 'cultivar', 'cosecha', 'farm'],
    category: 'rpg',
    description: 'Gestioná tu huerta: plantá, regá y cosechá',
    usage: '.huerta <plant/harvest/status/buy>',
    example: '.huerta plant zanahoria',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const CROPS = {
    zanahoria: { name: '🥕 Zanahoria', growTime: 300000, exp: 50, sellPrice: 30, seedPrice: 10 },
    tomate: { name: '🍅 Tomate', growTime: 600000, exp: 80, sellPrice: 50, seedPrice: 20 },
    maiz: { name: '🌽 Maíz', growTime: 900000, exp: 120, sellPrice: 80, seedPrice: 35 },
    papa: { name: '🥔 Papa', growTime: 1200000, exp: 150, sellPrice: 100, seedPrice: 45 },
    frutilla: { name: '🍓 Frutilla', growTime: 1800000, exp: 200, sellPrice: 150, seedPrice: 60 },
    sandia: { name: '🍉 Sandía', growTime: 3600000, exp: 350, sellPrice: 300, seedPrice: 100 },
    calabaza: { name: '🎃 Calabaza', growTime: 7200000, exp: 500, sellPrice: 500, seedPrice: 150 },
    hierba: { name: '🌿 Hierba', growTime: 1500000, exp: 180, sellPrice: 120, seedPrice: 50 }
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    if (!user.rpg.garden) user.rpg.garden = { plots: [], maxPlots: 3 }
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    const cropName = args[1]?.toLowerCase()
    
    if (!action || !['plant', 'harvest', 'status', 'buy'].includes(action)) {
        let txt = `🌱 *𝐇𝐔𝐄𝐑𝐓𝐀 - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
        txt += `╭┈┈⬡「 📋 *COMANDOS* 」\n`
        txt += `┃ ${m.prefix}huerta status\n`
        txt += `┃ ${m.prefix}huerta plant <cultivo>\n`
        txt += `┃ ${m.prefix}huerta harvest\n`
        txt += `┃ ${m.prefix}huerta buy <cultivo> <cantidad>\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `╭┈┈⬡「 🌾 *SEMILLAS DISPONIBLES* 」\n`
        for (const [key, crop] of Object.entries(CROPS)) {
            txt += `┃ ${crop.name} - ⏱️ ${formatTime(crop.growTime)}\n`
            txt += `┃ 💰 Semilla: $${crop.seedPrice} | Venta: $${crop.sellPrice}\n`
            txt += `┃ → ID: \`${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        return m.reply(txt)
    }
    
    if (action === 'status') {
        const garden = user.rpg.garden
        let txt = `🌱 *𝐄𝐒𝐓𝐀𝐃𝐎 𝐃𝐄 𝐓𝐔 𝐇𝐔𝐄𝐑𝐓𝐀*\n\n`
        txt += `> Parcelas ocupadas: ${garden.plots.length}/${garden.maxPlots}\n\n`
        
        if (garden.plots.length === 0) {
            txt += `> 🌾 Tu huerta está vacía.\n> Usá \`${m.prefix}huerta plant <cultivo>\` para empezar.`
        } else {
            txt += `╭┈┈⬡「 🌿 *PARCELAS* 」\n`
            for (let i = 0; i < garden.plots.length; i++) {
                const plot = garden.plots[i]
                const crop = CROPS[plot.crop]
                const elapsed = Date.now() - plot.plantedAt
                const remaining = Math.max(0, crop.growTime - elapsed)
                const ready = remaining <= 0
                
                txt += `┃ Parcela ${i + 1}: ${crop.name}\n`
                txt += `┃ ${ready ? '✅ ¡LISTO PARA COSECHAR!' : `🕕 Creciendo: ${formatTime(remaining)}`}\n`
                txt += `┃\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        return m.reply(txt)
    }
    
    if (action === 'buy') {
        if (!cropName) {
            return m.reply(`❌ ¿Qué semilla querés comprar?\n\n> Ejemplo: \`${m.prefix}huerta buy zanahoria 5\``)
        }
        
        const crop = CROPS[cropName]
        if (!crop) return m.reply(`❌ Ese cultivo no existe en nuestro catálogo.`)
        
        const qty = Math.max(1, parseInt(args[2]) || 1)
        const totalCost = crop.seedPrice * qty
        
        if ((user.koin || 0) < totalCost) {
            return m.reply(`❌ No tenés suficiente guita. Necesitás $${totalCost.toLocaleString('es-AR')}`)
        }
        
        user.koin -= totalCost
        const seedKey = `seed_${cropName}`
        user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty
        db.save()
        
        return m.reply(
            `✅ *𝐂𝐎𝐌𝐏𝐑𝐀 𝐑𝐄𝐀𝐋𝐈𝐙𝐀𝐃𝐀*\n\n` +
            `> 🌱 Semillas de ${crop.name} x${qty}\n` +
            `> 💰 Costo: -$${totalCost.toLocaleString('es-AR')}`
        )
    }
    
    if (action === 'plant') {
        if (!cropName) {
            return m.reply(`❌ ¿Qué vas a plantar?\n\n> Ejemplo: \`${m.prefix}huerta plant zanahoria\``)
        }
        
        const crop = CROPS[cropName]
        if (!crop) return m.reply(`❌ Ese cultivo no existe.`)
        
        if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
            return m.reply(`❌ No tenés más parcelas libres. ¡Cosechá algo primero!`)
        }
        
        const seedKey = `seed_${cropName}`
        if ((user.inventory[seedKey] || 0) < 1) {
            return m.reply(`❌ No tenés semillas de ${crop.name}.\n\n> Comprá con: \`${m.prefix}huerta buy ${cropName}\``)
        }
        
        user.inventory[seedKey]--
        if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey]
        
        user.rpg.garden.plots.push({
            crop: cropName,
            plantedAt: Date.now()
        })
        db.save()
        
        return m.reply(
            `🌱 *¡𝐏𝐋𝐀𝐍𝐓𝐀𝐃𝐎!*\n\n` +
            `> Has plantado ${crop.name}.\n` +
            `> 🕕 Estará listo en ${formatTime(crop.growTime)}.`
        )
    }
    
    if (action === 'harvest') {
        const garden = user.rpg.garden
        const readyPlots = garden.plots.filter(p => {
            const crop = CROPS[p.crop]
            return Date.now() - p.plantedAt >= crop.growTime
        })
        
        if (readyPlots.length === 0) {
            return m.reply(`❌ Todavía no hay nada listo para cosechar. ¡Dales tiempo!`)
        }
        
        let totalExp = 0
        let harvestedItems = []
        
        for (const plot of readyPlots) {
            const crop = CROPS[plot.crop]
            const qty = Math.floor(Math.random() * 3) + 2 // Produce entre 2 y 4 unidades
            user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty
            totalExp += crop.exp
            harvestedItems.push(`${crop.name} x${qty}`)
        }
        
        // Mantener solo lo que NO estaba listo
        garden.plots = garden.plots.filter(p => {
            const crop = CROPS[p.crop]
            return Date.now() - p.plantedAt < crop.growTime
        })
        
        await addExpWithLevelCheck(sock, m, db, user, totalExp)
        db.save()
        
        await m.react('👨‍🌾')
        return m.reply(
            `🌾 *𝐂𝐎𝐒𝐄𝐂𝐇𝐀 𝐄𝐗𝐈𝐓𝐎𝐒𝐀*\n\n` +
            `╭┈┈⬡「 📦 *PRODUCTOS* 」\n` +
            harvestedItems.map(h => `┃ ${h}`).join('\n') + `\n` +
            `┃ ✨ Experiencia: +${totalExp}\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
}

export { pluginConfig as config, handler }
