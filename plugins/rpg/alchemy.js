import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'alquimia',
    alias: ['pocion', 'cocinar', 'brebaje'],
    category: 'rpg',
    description: 'Cociná unas pociones y brebajes con los yuyos que encontraste',
    usage: '.alquimia <pocion>',
    example: '.alquimia pocionvida',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

const POTIONS = {
    pocionvida: { name: '❤️ Pocion de Vida', materials: { yuyo: 3 }, effect: 'Te cura 50 de HP', exp: 80, result: 'healthpotion' },
    pocionmana: { name: '💙 Pocion de Mana', materials: { yuyo: 2, flor: 1 }, effect: 'Te da 50 de Mana', exp: 90, result: 'manapotion' },
    pocionaguante: { name: '⚡ Pocion de Aguante', materials: { yuyo: 2, hongo: 1 }, effect: 'Te da 30 de Stamina', exp: 100, result: 'staminapotion' },
    pocionfuerza: { name: '💪 Pocion de Fuerza', materials: { yuyo: 3, escamadedragon: 1 }, effect: '+20 ATK (por 5 min)', exp: 200, result: 'strengthpotion' },
    pociondefensa: { name: '🛡️ Pocion de Defensa', materials: { yuyo: 3, hierro: 2 }, effect: '+15 DEF (por 5 min)', exp: 180, result: 'defensepotion' },
    pocionsuerte: { name: '🍀 Pocion de Suerte', materials: { yuyo: 5, diamante: 1 }, effect: '+30% Drop Rate (por 10 min)', exp: 300, result: 'luckpotion' },
    pocionexp: { name: '✨ Pocion de EXP', materials: { yuyo: 4, oro: 2 }, effect: '+50% EXP (por 15 min)', exp: 250, result: 'exppotion' },
    antidoto: { name: '💊 Antídoto', materials: { yuyo: 2 }, effect: 'Te saca el veneno', exp: 50, result: 'antidote' },
    elixir: { name: '🧪 Elixir Supremo', materials: { yuyo: 10, diamante: 2, oro: 5 }, effect: 'Te deja como nuevo (Full Stats)', exp: 500, result: 'elixir' }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.inventory) user.inventory = {}
    if (!user.rpg) user.rpg = {}
    
    const args = m.args || []
    const potionName = args[0]?.toLowerCase()
    
    if (!potionName) {
        let txt = `🧪 *ALQUIMIA - COCINANDO BREBAJES*\n\n`
        txt += `╭┈┈⬡「 📜 *EL CUADERNO DE RECETAS* 」\n`
        
        for (const [key, pot] of Object.entries(POTIONS)) {
            const mats = Object.entries(pot.materials).map(([m, qty]) => `${qty}x ${m}`).join(', ')
            txt += `┃ ${pot.name}\n`
            txt += `┃ 📦 Necesitás: ${mats}\n`
            txt += `┃ 💫 Qué hace: ${pot.effect}\n`
            txt += `┃ → Escribí: \`${key}\`\n┃\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Datazo:* Los yuyos los sacás del jardín o pateando calabozos.`
        
        return m.reply(txt)
    }
    
    const potion = POTIONS[potionName]
    if (!potion) {
        return m.reply(`❌ ¡Esa receta no existe, che!\n\n> Mandá \`${m.prefix}alquimia\` para ver qué podés cocinar.`)
    }
    
    const missingMaterials = []
    for (const [material, needed] of Object.entries(potion.materials)) {
        const have = user.inventory[material] || 0
        if (have < needed) {
            missingMaterials.push(`${material}: ${have}/${needed}`)
        }
    }
    
    if (missingMaterials.length > 0) {
        return m.reply(
            `❌ *TE FALTAN CINCO PARA EL PESO*\n\n` +
            `> Para armar la ${potion.name} necesitás:\n\n` +
            missingMaterials.map(m => `> ❌ ${m}`).join('\n') +
            `\n\n_Andá a buscar lo que falta y volvé._`
        )
    }
    
    await m.react('🧪')
    await m.reply(`🧪 *PREPARANDO ${potion.name.toUpperCase()}... BANCAME UN CACHO.*`)
    await new Promise(r => setTimeout(r, 2000))
    
    for (const [material, needed] of Object.entries(potion.materials)) {
        user.inventory[material] -= needed
        if (user.inventory[material] <= 0) delete user.inventory[material]
    }
    
    user.inventory[potion.result] = (user.inventory[potion.result] || 0) + 1
    
    await addExpWithLevelCheck(sock, m, db, user, potion.exp)
    db.save()
    
    await m.react('✅')
    return m.reply(
        `✅ *¡LISTO EL POLLO!*\n\n` +
        `╭┈┈⬡「 🧪 *BOTÍN COCINADO* 」\n` +
        `┃ 📦 Te salió: *${potion.name}*\n` +
        `┃ 💫 Efecto: *${potion.effect}*\n` +
        `┃ ✨ Ganaste: *+${potion.exp} de EXP*\n` +
        `╰┈┈┈┈┈┈┈┈⬡`
    )
}

export { pluginConfig as config, handler }
