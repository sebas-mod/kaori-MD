import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'mascota',
    alias: ['pet', 'mypet', 'animal'],
    category: 'rpg',
    description: 'Gestioná tu mascota (alimentar, entrenar, evolucionar)',
    usage: '.mascota <comida/entrenar/status/renombrar/evolucionar>',
    example: '.mascota status',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const PET_TYPES = {
    cat: { name: '🐱 Gato', baseStats: { attack: 5, defense: 3, luck: 5 }, evolve: 'lion' },
    dog: { name: '🐕 Perro', baseStats: { attack: 8, defense: 5, luck: 2 }, evolve: 'wolf' },
    bird: { name: '🐦 Pájaro', baseStats: { attack: 4, defense: 2, luck: 8 }, evolve: 'phoenix' },
    fish: { name: '🐟 Pez', baseStats: { attack: 2, defense: 2, luck: 10 }, evolve: 'dragon' },
    rabbit: { name: '🐰 Conejo', baseStats: { attack: 3, defense: 4, luck: 6 }, evolve: 'thunderbunny' },
    lion: { name: '🦁 León', baseStats: { attack: 15, defense: 10, luck: 8 }, evolve: null },
    wolf: { name: '🐺 Lobo', baseStats: { attack: 18, defense: 12, luck: 5 }, evolve: null },
    phoenix: { name: '🔥 Fénix', baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
    dragon: { name: '🐉 Dragón', baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
    thunderbunny: { name: '⚡ Conejo Trueno', baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null }
}

const FOOD_ITEMS = {
    bread: { name: '🍞 Pan', hunger: 10, exp: 5 },
    fish: { name: '🐟 Pescado', hunger: 20, exp: 10 },
    meat: { name: '🍖 Carne', hunger: 30, exp: 15 },
    fruit: { name: '🍎 Fruta', hunger: 15, exp: 8 },
    premium_food: { name: '⭐ Alimento Premium', hunger: 50, exp: 30 }
}

function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!user.rpg.pet) {
        return m.reply(
            `🐾 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐌𝐀𝐒𝐂𝐎𝐓𝐀𝐒*\n\n` +
            `> ¡Todavía no tenés una mascota!\n\n` +
            `💡 *Cómo conseguir una:*\n` +
            `> • \`${m.prefix}petshop\` - Comprar una\n` +
            `> • \`${m.prefix}breeding\` - Criar mascotas\n` +
            `> • Recompensa de Dungeons o Bosses`
        )
    }
    
    const pet = user.rpg.pet
    const petInfo = PET_TYPES[pet.type]
    
    if (!action || !['comida', 'entrenar', 'status', 'renombrar', 'evolucionar', 'feed', 'train', 'rename', 'evolve'].includes(action)) {
        const maxHunger = 100
        const hungerStatus = pet.hunger >= 70 ? '😊 Lleno' : pet.hunger >= 40 ? '😐 Normal' : '😰 ¡Hambriento!'
        
        let txt = `🐾 *𝐒𝐓𝐀𝐓𝐔𝐒 𝐃𝐄 𝐌𝐀𝐒𝐂𝐎𝐓𝐀*\n\n`
        txt += `╭┈┈⬡「 📋 *𝐈𝐍𝐅𝐎* 」\n`
        txt += `┃ 🏷️ Nombre: *${pet.name}*\n`
        txt += `┃ 🐾 Especie: *${petInfo.name}*\n`
        txt += `┃ 📊 Nivel: *${pet.level || 1}*\n`
        txt += `┃ ✨ EXP: *${pet.exp || 0}/${(pet.level || 1) * 100}*\n`
        txt += `┃ 🍖 Hambre: *${pet.hunger}/${maxHunger}* ${hungerStatus}\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 💪 *𝐒𝐓𝐀𝐓𝐒* 」\n`
        txt += `┃ ⚔️ Ataque: *${pet.stats?.attack || petInfo.baseStats.attack}*\n`
        txt += `┃ 🛡️ Defensa: *${pet.stats?.defense || petInfo.baseStats.defense}*\n`
        txt += `┃ 🍀 Suerte: *${pet.stats?.luck || petInfo.baseStats.luck}*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `╭┈┈⬡「 📋 *𝐂𝐎𝐌𝐀𝐍𝐃𝐎𝐒* 」\n`
        txt += `┃ ${m.prefix}mascota comida <ítem>\n`
        txt += `┃ ${m.prefix}mascota entrenar\n`
        txt += `┃ ${m.prefix}mascota renombrar <nombre>\n`
        if (petInfo.evolve) {
            txt += `┃ ${m.prefix}mascota evolucionar\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    // Acción: Alimentar
    if (action === 'comida' || action === 'feed') {
        const foodKey = args[1]?.toLowerCase()
        
        if (!foodKey) {
            let txt = `🍖 *𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐎 𝐏𝐀𝐑𝐀 𝐌𝐀𝐒𝐂𝐎𝐓𝐀𝐒*\n\n`
            txt += `╭┈┈⬡「 🍽️ *𝐌𝐄𝐍𝐔́* 」\n`
            for (const [key, food] of Object.entries(FOOD_ITEMS)) {
                const have = user.inventory[key] || 0
                txt += `┃ ${food.name} (${have}x)\n`
                txt += `┃ 🍖 +${food.hunger} | ✨ +${food.exp} EXP\n`
                txt += `┃ → \`${key}\`\n┃\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
            return m.reply(txt)
        }
        
        const food = FOOD_ITEMS[foodKey]
        if (!food) return m.reply(`❌ ¡Esa comida no existe!`)
        
        if ((user.inventory[foodKey] || 0) < 1) {
            return m.reply(`❌ ¡No tenés ${food.name} en tu inventario!`)
        }
        
        if (pet.hunger >= 100) return m.reply(`❌ ¡Tu mascota ya está llenísima!`)
        
        user.inventory[foodKey]--
        if (user.inventory[foodKey] <= 0) delete user.inventory[foodKey]
        
        pet.hunger = Math.min(100, pet.hunger + food.hunger)
        pet.exp = (pet.exp || 0) + food.exp
        
        // Check Level Up
        const expNeeded = (pet.level || 1) * 100
        if (pet.exp >= expNeeded) {
            pet.level = (pet.level || 1) + 1
            pet.exp -= expNeeded
            pet.stats = pet.stats || { ...petInfo.baseStats }
            pet.stats.attack += 2
            pet.stats.defense += 1
            pet.stats.luck += 1
        }
        
        db.save()
        
        return m.reply(
            `🍖 *𝐀𝐋𝐈𝐌𝐄𝐍𝐓𝐀𝐍𝐃𝐎*\n\n` +
            `> ¡${pet.name} se comió un/a ${food.name}!\n\n` +
            `╭┈┈⬡「 📊 *𝐔𝐏𝐃𝐀𝐓𝐄* 」\n` +
            `┃ 🍖 Hambre: *+${food.hunger}* (${pet.hunger}/100)\n` +
            `┃ ✨ EXP: *+${food.exp}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    // Acción: Entrenar
    if (action === 'entrenar' || action === 'train') {
        if (pet.hunger < 20) {
            return m.reply(`❌ Tu mascota tiene mucha hambre para entrenar. ¡Dale de comer!`)
        }
        
        pet.hunger = Math.max(0, pet.hunger - 15)
        const expGain = 20 + Math.floor(Math.random() * 20)
        pet.exp = (pet.exp || 0) + expGain
        
        const expNeeded = (pet.level || 1) * 100
        let levelUp = false
        if (pet.exp >= expNeeded) {
            pet.level = (pet.level || 1) + 1
            pet.exp -= expNeeded
            pet.stats = pet.stats || { ...petInfo.baseStats }
            pet.stats.attack += 2
            pet.stats.defense += 1
            pet.stats.luck += 1
            levelUp = true
        }
        
        db.save()
        
        let txt = `🏋️ *𝐄𝐍𝐓𝐑𝐄𝐍𝐀𝐌𝐈𝐄𝐍𝐓𝐎*\n\n`
        txt += `> ¡${pet.name} está entrenando duro!\n\n`
        txt += `╭┈┈⬡「 📊 *𝐑𝐄𝐒𝐔𝐋𝐓𝐀𝐃𝐎* 」\n`
        txt += `┃ ✨ EXP: *+${expGain}*\n`
        txt += `┃ 🍖 Hambre: *-15*\n`
        if (levelUp) {
            txt += `┃ 🎉 *¡𝐒𝐔𝐁𝐈𝐎́ 𝐃𝐄 𝐍𝐈𝐕𝐄𝐋!* → Nivel ${pet.level}\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        return m.reply(txt)
    }
    
    // Acción: Renombrar
    if (action === 'renombrar' || action === 'rename') {
        const newName = args.slice(1).join(' ')
        if (!newName || newName.length < 2 || newName.length > 15) {
            return m.reply(`❌ ¡El nombre debe tener entre 2 y 15 caracteres!`)
        }
        
        pet.name = newName
        db.save()
        
        return m.reply(`✅ Ahora tu mascota se llama *${newName}*!`)
    }
    
    // Acción: Evolucionar
    if (action === 'evolucionar' || action === 'evolve') {
        if (!petInfo.evolve) {
            return m.reply(`❌ ¡Esta mascota ya alcanzó su forma final!`)
        }
        
        if ((pet.level || 1) < 10) {
            return m.reply(`❌ Tu mascota necesita ser Nivel 10+ para evolucionar (Actual: ${pet.level || 1})`)
        }
        
        const evolvedPet = PET_TYPES[petInfo.evolve]
        pet.type = petInfo.evolve
        pet.stats = { ...evolvedPet.baseStats }
        pet.level = 1
        pet.exp = 0
        
        db.save()
        
        return m.reply(
            `🎉 *¡𝐄𝐕𝐎𝐋𝐔𝐂𝐈𝐎́𝐍!*\n\n` +
            `> ¡Increíble! ${pet.name} evolucionó a ${evolvedPet.name}!\n\n` +
            `╭┈┈⬡「 💪 *𝐍𝐔𝐄𝐕𝐎𝐒 𝐒𝐓𝐀𝐓𝐒* 」\n` +
            `┃ ⚔️ Ataque: *${evolvedPet.baseStats.attack}*\n` +
            `┃ 🛡️ Defensa: *${evolvedPet.baseStats.defense}*\n` +
            `┃ 🍀 Suerte: *${evolvedPet.baseStats.luck}*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ¡Seguí cuidando a tu compañero en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
        )
    }
}

export { pluginConfig as config, handler }
