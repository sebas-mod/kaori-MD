import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'craftear',
    alias: ['craft', 'buat', 'crear', 'forjar'],
    category: 'rpg',
    description: 'Fabricá ítems usando tus materiales',
    usage: '.craftear <item>',
    example: '.craftear espada',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const RECIPES = {
    espada: {
        name: '⚔️ Espada de Hierro',
        materials: { hierro: 5, carbon: 3 },
        result: 'sword',
        bonus: { attack: 10 }
    },
    armadura: {
        name: '🛡️ Armadura de Hierro',
        materials: { hierro: 10, carbon: 5 },
        result: 'armor',
        bonus: { defense: 15 }
    },
    pico: {
        name: '⛏️ Pico de Diamante',
        materials: { diamante: 3, hierro: 2 },
        result: 'pickaxe',
        bonus: { mining: 20 }
    },
    caña: {
        name: '🎣 Caña de Oro',
        materials: { oro: 5, hierro: 2 },
        result: 'rod',
        bonus: { fishing: 20 }
    },
    pocion: {
        name: '🥤 Poción de Vida',
        materials: { pescado: 3, conejo: 2 },
        result: 'potion',
        qty: 2
    }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const itemKey = args[0]?.toLowerCase()
    
    if (!itemKey) {
        let txt = `🔨 *FORJA DE OBJETOS - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
        
        for (const [key, recipe] of Object.entries(RECIPES)) {
            txt += `╭┈┈⬡「 ${recipe.name} 」\n`
            txt += `┃ 📦 Materiales:\n`
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                const userHas = user.inventory[mat] || 0
                const status = userHas >= qty ? '✅' : '❌'
                txt += `┃   ${status} ${mat}: ${userHas}/${qty}\n`
            }
            txt += `┃ 🔧 ID: \`${key}\`\n`
            txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        }
        
        txt += `> Para fabricar usá: \`${m.prefix}craftear <id>\``
        return m.reply(txt)
    }
    
    const recipe = RECIPES[itemKey]
    if (!recipe) {
        return m.reply(`❌ ¡Esa receta no la tengo! Mirá la lista con \`${m.prefix}craftear\``)
    }
    
    // Verificación de materiales
    const missing = []
    for (const [mat, qty] of Object.entries(recipe.materials)) {
        const have = user.inventory[mat] || 0
        if (have < qty) {
            missing.push(`${mat} (${have}/${qty})`)
        }
    }
    
    if (missing.length > 0) {
        return m.reply(`❌ *MATERIALES INSUFICIENTES*\n\n> Te falta:\n> ${missing.join('\n> ')}`)
    }
    
    // Descontar materiales
    for (const [mat, qty] of Object.entries(recipe.materials)) {
        user.inventory[mat] -= qty
    }
    
    const resultQty = recipe.qty || 1
    user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty
    
    // Aplicar bonus permanentes si existen
    if (recipe.bonus) {
        for (const [stat, value] of Object.entries(recipe.bonus)) {
            user.rpg[stat] = (user.rpg[stat] || 0) + value
        }
    }
    
    db.save()
    
    let txt = `🔨 *¡FORJA EXITOSA!*\n\n`
    txt += `> ✅ Fabricaste: *${recipe.name} x${resultQty}*\n`
    
    if (recipe.bonus) {
        txt += `> 📈 Stats mejorados permanentemente.`
    }
    
    await m.react('⚒️')
    await m.reply(txt)
}

export { pluginConfig as config, handler }
