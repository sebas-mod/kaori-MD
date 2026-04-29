import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'

const pluginConfig = {
    name: 'mazmorra',
    alias: ['dg', 'dungeon', 'explorar', 'laberinto', 'aventura'],
    category: 'rpg',
    description: 'Explorá mazmorras peligrosas para conseguir loot',
    usage: '.mazmorra',
    example: '.mazmorra',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 300, // 5 minutos
    energi: 2,
    isEnabled: true
}

const DUNGEONS = [
    { name: '🌲 Bosque Oscuro', difficulty: 1, monsters: ['Goblin Chupe', 'Slime Pegajoso', 'Lobo Hambriento'], minReward: 100, maxReward: 300 },
    { name: '🏰 Castillo Abandonado', difficulty: 2, monsters: ['Esqueleto Guerrero', 'Zombi Putrefacto', 'Fantasma Vengativo'], minReward: 200, maxReward: 500 },
    { name: '🌋 Volcán de Fuego', difficulty: 3, monsters: ['Elemental de Fuego', 'Golem de Magma', 'Cría de Dragón'], minReward: 400, maxReward: 800 },
    { name: '🧊 Cueva Helada', difficulty: 4, monsters: ['Golem de Hielo', 'Gigante de Escarcha', 'Yeti de las Nieves'], minReward: 600, maxReward: 1200 },
    { name: '👹 Inframundo', difficulty: 5, monsters: ['Demonio Infernal', 'Súcubo', 'Señor del Caos'], minReward: 1000, maxReward: 2500 }
]

const LOOT_TABLE = [
    { item: 'hierro', chance: 40, qty: [1, 5] },
    { item: 'oro', chance: 20, qty: [1, 3] },
    { item: 'diamante', chance: 5, qty: [1, 2] },
    { item: 'pocion', chance: 30, qty: [1, 3] },
    { item: 'hierba', chance: 25, qty: [2, 6] },
    { item: 'cuero', chance: 35, qty: [2, 5] },
    { item: 'cofre_misterioso', chance: 3, qty: [1, 1] }
]

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const staminaCost = 30
    user.rpg.stamina = user.rpg.stamina ?? 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *SIN STAMINA*\n\n` +
            `> Necesitás ${staminaCost} de energía para entrar a una mazmorra.\n` +
            `> Tu energía actual: ${user.rpg.stamina}\n\n` +
            `💡 *Tips:* Usá \`${m.prefix}rest\` o comé algo para recuperar fuerzas.`
        )
    }
    
    const userLevel = user.level || 1
    // Las mazmorras se desbloquean cada 5 niveles
    const availableDungeons = DUNGEONS.filter(d => userLevel >= d.difficulty * 5)
    
    if (availableDungeons.length === 0) {
        return m.reply(`❌ *NIVEL MUY BAJO*\n\n> Necesitás ser al menos Nivel 5 para empezar tus aventuras.`)
    }
    
    const dungeon = availableDungeons[Math.floor(Math.random() * availableDungeons.length)]
    const monster = dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)]
    
    user.rpg.stamina -= staminaCost
    
    await m.react('⚔️')
    await m.reply(`🚪 *ENTRANDO A ${dungeon.name.toUpperCase()}...*\n\n> Gastaste ${staminaCost} de stamina.`)
    await new Promise(r => setTimeout(r, 1500))
    
    await m.reply(`👹 *¡UN ${monster.toUpperCase()} SE CRUZA EN TU CAMINO!*\n\n> ¡Preparate para pelear!`)
    await new Promise(r => setTimeout(r, 2000))
    
    const userPower = (user.rpg.attack || 10) + userLevel * 3 + Math.floor(Math.random() * 20)
    const monsterPower = dungeon.difficulty * 15 + Math.floor(Math.random() * 30)
    
    const isWin = userPower >= monsterPower || Math.random() > 0.3
    
    let txt = ``
    
    if (isWin) {
        const expReward = 150 * dungeon.difficulty + Math.floor(Math.random() * 100)
        const goldReward = Math.floor(Math.random() * (dungeon.maxReward - dungeon.minReward)) + dungeon.minReward
        
        const droppedItems = []
        for (const loot of LOOT_TABLE) {
            // La dificultad aumenta un poco la chance de mejor loot
            if (Math.random() * 100 < loot.chance * (1 + dungeon.difficulty * 0.1)) {
                const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0]
                user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty
                droppedItems.push(`${loot.item} x${qty}`)
            }
        }
        
        user.koin = (user.koin || 0) + goldReward
        await addExpWithLevelCheck(sock, m, db, user, expReward)
        
        txt = `🎉 *¡VICTORIA EN LA MAZMORRA!*\n\n`
        txt += `> Derrotaste al ${monster} en el ${dungeon.name}.\n\n`
        txt += `╭┈┈⬡「 🎁 *RECOMPENSAS* 」\n`
        txt += `┃ ✨ EXP: *+${expReward}*\n`
        txt += `┃ 💰 Monedas: *+$${goldReward.toLocaleString('es-AR')}*\n`
        if (droppedItems.length > 0) {
            txt += `┃ 📦 Loot: *${droppedItems.join(', ')}*\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡`
        
        await m.react('🏆')
    } else {
        const goldLoss = Math.floor((user.koin || 0) * 0.1)
        user.koin = Math.max(0, (user.koin || 0) - goldLoss)
        user.rpg.health = Math.max(10, (user.rpg.health || 100) - 30)
        
        txt = `💀 *¡FUISTE DERROTADO!*\n\n`
        txt += `> El ${monster} te dio una paliza en el ${dungeon.name}...\n\n`
        txt += `╭┈┈⬡「 💔 *PENALIZACIÓN* 」\n`
        txt += `┃ 💸 Pérdida: *-$${goldLoss.toLocaleString('es-AR')}*\n`
        txt += `┃ ❤️ Salud: *-30 HP*\n`
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        txt += `💡 *Tips:* Subí de nivel o mejorá tu equipo antes de volver.`
        
        await m.react('💀')
    }
    
    db.save()
    return m.reply(txt)
}

export { pluginConfig as config, handler }
