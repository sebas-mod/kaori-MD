import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'cocina',
    alias: ['cocinar', 'chef', 'masak', 'cook'],
    category: 'rpg',
    description: 'Cociná platos para recuperar Stamina, HP y Mana',
    usage: '.cocina <receta>',
    example: '.cocina pizza',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

const RECIPES = {
    pan: { name: '🍞 Pan Casero', materials: { trigo: 2 }, effect: { stamina: 10, health: 5 }, exp: 30 },
    arroz: { name: '🍚 Arroz con Huevo', materials: { arroz: 2, huevo: 1 }, effect: { stamina: 25, health: 15 }, exp: 60 },
    asado: { name: '🥩 Asado de Obra', materials: { carne: 2, hierba: 1 }, effect: { stamina: 40, health: 30 }, exp: 100 },
    sopa: { name: '🍲 Sopa de la Abuela', materials: { zanahoria: 2, papa: 2, carne: 1 }, effect: { stamina: 35, health: 40 }, exp: 90 },
    sushi: { name: '🍣 Sushi Roll', materials: { pescado: 3, arroz: 2 }, effect: { stamina: 30, health: 25 }, exp: 80 },
    torta: { name: '🍰 Torta de Frutilla', materials: { trigo: 3, huevo: 2, frutilla: 2 }, effect: { stamina: 50, health: 20 }, exp: 120 },
    ramen: { name: '🍜 Ramen Gourmet', materials: { trigo: 2, huevo: 1, carne: 1, hierba: 1 }, effect: { stamina: 45, health: 35 }, exp: 110 },
    pizza: { name: '🍕 Pizza Especial', materials: { trigo: 3, tomate: 2, carne: 2 }, effect: { stamina: 60, health: 30 }, exp: 140 },
    licuado: { name: '🥤 Licuado Power', materials: { frutilla: 3, sandia: 1 }, effect: { stamina: 30, mana: 20 }, exp: 70 },
    elixir: { name: '✨ Manjar de los Dioses', materials: { hierba: 5, diamante: 1, oro: 2 }, effect: { stamina: 100, health: 100, mana: 50 }, exp: 300 }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const recipeName = args[0]?.toLowerCase()
    
    if (!recipeName) {
        let txt = `👨‍🍳 *COCINA - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
        txt += `> ¡Cociná algo rico para recuperar tus stats!\n\n`
        txt += `╭┈┈⬡「 📜 *LIBRO DE RECETAS* 」\n`
        
        for (const [key, recipe] of Object.entries(RECIPES)) {
            const mats = Object.entries(recipe.materials).map(([m, qty]) => `${qty}x ${m}`).join(', ')
            const effects = Object.entries(recipe.effect).map(([e, v]) => `+${v} ${e}`).join(', ')
            txt += `┃ 🍳 *${recipe.name}*\n`
            txt += `┃ 📦 Materiales: ${mats}\n`
            txt += `┃ 💫 Efectos: ${effects}\n`
            txt += `┃ → \`${m.prefix}cocina ${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    const recipe = RECIPES[recipeName]
    if (!recipe) {
        return m.reply(`❌ ¡Esa receta no existe en mi libro!\n\n> Escribí \`${m.prefix}cocina\` para ver la lista.`)
    }
    
    const missingMaterials = []
    for (const [material, needed] of Object.entries(recipe.materials)) {
        const have = user.inventory[material] || 0
        if (have < needed) {
            missingMaterials.push(`${material}: ${have}/${needed}`)
        }
    }
    
    if (missingMaterials.length > 0) {
        return m.reply(
            `❌ *FALTAN INGREDIENTES*\n\n` +
            `> Para preparar ${recipe.name} necesitás:\n\n` +
            missingMaterials.map(m => `> ❌ ${m}`).join('\n')
        )
    }
    
    await m.react('👨‍🍳')
    await m.reply(`👨‍🍳 *PREPARANDO ${recipe.name.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2000))
    
    // Consumir materiales
    for (const [material, needed] of Object.entries(recipe.materials)) {
        user.inventory[material] -= needed
        if (user.inventory[material] <= 0) delete user.inventory[material]
    }
    
    // Cálculo de stats máximos
    const userLevel = user.level || 1
    const maxStamina = 100
    const maxHealth = 100 + userLevel * 5
    const maxMana = 50 + userLevel * 3
    
    // Aplicar efectos
    if (recipe.effect.stamina) {
        user.rpg.stamina = Math.min(maxStamina, (user.rpg.stamina ?? 100) + recipe.effect.stamina)
    }
    if (recipe.effect.health) {
        user.rpg.health = Math.min(maxHealth, (user.rpg.health || 100) + recipe.effect.health)
    }
    if (recipe.effect.mana) {
        user.rpg.mana = Math.min(maxMana, (user.rpg.mana || 50) + recipe.effect.mana)
    }
    
    await addExpWithLevelCheck(sock, m, db, user, recipe.exp)
    db.save()
    
    await m.react('✅')
    
    const effectTexts = Object.entries(recipe.effect).map(([e, v]) => `${e.toUpperCase()}: +${v}`).join('\n┃ ')
    
    return m.reply(
        `✅ *¡PLATILLO TERMINADO!*\n\n` +
        `╭┈┈⬡「 🍽️ *RESULTADO* 」\n` +
        `┃ 🍳 Comida: *${recipe.name}*\n` +
        `┃ ${effectTexts}\n` +
        `┃ ✨ EXP: *+${recipe.exp}*\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Te lo comiste al toque y recuperaste energía!`
    )
}

export { pluginConfig as config, handler }
