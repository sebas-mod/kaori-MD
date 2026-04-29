import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'cocinar',
    alias: ['cook', 'masak', 'cooking', 'comida'],
    category: 'rpg',
    description: 'Cociná alimentos para recuperar vida (HP)',
    usage: '.cocinar',
    example: '.cocinar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const RECIPES = {
    fish_soup: { name: '🍲 Sopa de Pescado', materials: { pescado: 2 }, heal: 30 },
    grilled_meat: { name: '🍖 Carne Asada', materials: { conejo: 1, madera: 1 }, heal: 40 },
    apple_pie: { name: '🥧 Tarta de Manzana', materials: { manzana: 3 }, heal: 25 },
    steak: { name: '🥩 Churrasco', materials: { jabali: 1, Carbon: 1 }, heal: 60 }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    user.rpg.health = user.rpg.health || 100
    user.rpg.maxHealth = user.rpg.maxHealth || 100
    
    if (user.rpg.health >= user.rpg.maxHealth) {
        return m.reply(`❤️ ¡Ya tenés la vida al máximo! No desperdicies comida.`)
    }
    
    let cooked = null
    for (const [key, recipe] of Object.entries(RECIPES)) {
        let canCook = true
        for (const [mat, qty] of Object.entries(recipe.materials)) {
            if ((user.inventory[mat] || 0) < qty) {
                canCook = false
                break
            }
        }
        if (canCook) {
            cooked = { key, ...recipe }
            break
        }
    }
    
    if (!cooked) {
        let txt = `🍳 *MENU DE COCINA - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
        txt += `> No tenés ingredientes suficientes para cocinar nada automático. Revisá tus recetas:\n\n`
        for (const [key, recipe] of Object.entries(RECIPES)) {
            txt += `╭┈┈⬡「 ${recipe.name} 」\n`
            txt += `┃ ❤️ Cura: +${recipe.heal} HP\n`
            txt += `┃ 📦 Ingredientes:\n`
            for (const [mat, qty] of Object.entries(recipe.materials)) {
                const has = user.inventory[mat] || 0
                txt += `┃   ${has >= qty ? '✅' : '❌'} ${mat}: ${has}/${qty}\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        }
        return m.reply(txt)
    }
    
    // Consumir ingredientes
    for (const [mat, qty] of Object.entries(cooked.materials)) {
        user.inventory[mat] -= qty
    }
    
    const oldHealth = user.rpg.health
    user.rpg.health = Math.min(user.rpg.health + cooked.heal, user.rpg.maxHealth)
    
    db.save()
    
    let txt = `🍳 *¡COCINASTE ALGO RICO!*\n\n`
    txt += `> 🍽️ Preparaste: *${cooked.name}*\n`
    txt += `> ❤️ Tu vida: ${oldHealth} → *${user.rpg.health}*`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
