import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'herreria',
    alias: ['forjar', 'tempa', 'forge', 'herrero'],
    category: 'rpg',
    description: 'Forjá tus armas y armaduras con los materiales que juntaste',
    usage: '.herreria <item>',
    example: '.herreria espada',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 120,
    energi: 1,
    isEnabled: true
}

const RECIPES = {
    espada: { materials: { hierro: 3, madera: 2 }, result: 'espada', name: '⚔️ Espada de Hierro', exp: 200, price: 500 },
    escudo: { materials: { hierro: 4, cuero: 2 }, result: 'escudo', name: '🛡️ Escudo de Hierro', exp: 250, price: 600 },
    casco: { materials: { hierro: 2, cuero: 1 }, result: 'casco', name: '⛑️ Casco de Hierro', exp: 150, price: 400 },
    armadura: { materials: { hierro: 5, cuero: 3 }, result: 'armadura', name: '🦺 Armadura de Hierro', exp: 350, price: 800 },
    hacha: { materials: { hierro: 2, madera: 3 }, result: 'hacha', name: '🪓 Hacha de Hierro', exp: 180, price: 450 },
    pico: { materials: { hierro: 3, madera: 2 }, result: 'pico', name: '⛏️ Pico de Minero', exp: 180, price: 450 },
    arco: { materials: { madera: 4, hilo: 2 }, result: 'arco', name: '🏹 Arco Largo', exp: 200, price: 500 },
    flechas: { materials: { madera: 1, hierro: 1 }, result: 'flecha', name: '🏹 Flechas x10', exp: 50, price: 100, qty: 10 },
    oroespada: { materials: { oro: 5, diamante: 2, hierro: 3 }, result: 'oroespada', name: '🗡️ Espada de Oro', exp: 500, price: 2000 },
    diamantearmadura: { materials: { diamante: 8, hierro: 5, cuero: 3 }, result: 'diamantearmadura', name: '💎 Armadura de Diamante', exp: 800, price: 5000 }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const itemName = args[0]?.toLowerCase()
    
    if (!itemName) {
        let txt = `🔨 *HERRERÍA - LA FRAGUA DEL BOT*\n\n`
        txt += `> ¡Forjá tu propio equipo con los materiales que tengas!\n\n`
        txt += `╭┈┈⬡「 📜 *RECETAS DISPONIBLES* 」\n`
        
        for (const [key, recipe] of Object.entries(RECIPES)) {
            const mats = Object.entries(recipe.materials).map(([m, qty]) => `${qty}x ${m}`).join(', ')
            txt += `┃ ${recipe.name}\n`
            txt += `┃ → \`${m.prefix}herreria ${key}\`\n`
            txt += `┃ 📦 Materiales: ${mats}\n`
            txt += `┃ ✨ EXP: +${recipe.exp}\n`
            txt += `┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Data:* Conseguí hierro, madera y cuero laburando en la quinta o cazando.`
        
        return m.reply(txt)
    }
    
    const recipe = RECIPES[itemName]
    if (!recipe) {
        return m.reply(`❌ ¡Esa receta no existe! Fijate bien la lista con \`${m.prefix}herreria\`.`)
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
            `❌ *TE FALTAN MATERIALES*\n\n` +
            `> Para forjar ${recipe.name} necesitás:\n\n` +
            missingMaterials.map(mat => `> ❌ ${mat}`).join('\n')
        )
    }
    
    await m.react('🔨')
    await m.reply(`🔨 *DÁNDOLE AL YUNQUE PARA HACER: ${recipe.name.toUpperCase()}...*`)
    await new Promise(r => setTimeout(r, 2000))
    
    // Consumir materiales
    for (const [material, needed] of Object.entries(recipe.materials)) {
        user.inventory[material] -= needed
        if (user.inventory[material] <= 0) delete user.inventory[material]
    }
    
    const resultQty = recipe.qty || 1
    user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty
    
    await addExpWithLevelCheck(sock, m, db, user, recipe.exp)
    db.save()
    
    await m.react('✅')
    
    let txt = `✅ *FORJA COMPLETADA*\n\n`
    txt += `╭┈┈⬡「 📦 *NUEVO ITEM* 」\n`
    txt += `┃ 🔨 Objeto: *${recipe.name}*\n`
    txt += `┃ 📊 Cantidad: *+${resultQty}*\n`
    txt += `┃ ✨ EXP ganada: *+${recipe.exp}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡`
    
    return m.reply(txt)
}

export { pluginConfig as config, handler }
