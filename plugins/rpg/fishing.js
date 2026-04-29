import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'pesca',
    alias: ['fish', 'pescar', 'pancart'],
    category: 'rpg',
    description: 'Pesca algo para obtener alimento o recursos',
    usage: '.pesca',
    example: '.pesca',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const staminaCost = 15
    user.rpg.stamina = user.rpg.stamina || 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *STAMINA AGOTADA*\n\n` +
            `> Necesitás ${staminaCost} de stamina para tirar la caña.\n` +
            `> Tu stamina actual: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.reply('🎣 *TIRANDO LA CAÑA... ESPERÁ QUE PIQUE.*')
    await new Promise(r => setTimeout(r, 2000))
    
    const drops = [
        { item: 'basura', chance: 20, name: '🗑️ Bota Vieja', exp: 10 },
        { item: 'pescado', chance: 50, name: '🐟 Pescado Fresco', exp: 100 },
        { item: 'camaron', chance: 30, name: '🦐 Camarón', exp: 150 },
        { item: 'pulpo', chance: 15, name: '🐙 Pulpo', exp: 300 },
        { item: 'tiburon', chance: 5, name: '🦈 Tiburón Blanco', exp: 800 },
        { item: 'ballena', chance: 1, name: '🐳 Ballena Azul', exp: 2000 }
    ]
    
    const rand = Math.random() * 100
    let caught = drops[0]
    
    // Ordenar por probabilidad para que la lógica de selección funcione correctamente
    for (const drop of drops.sort((a, b) => a.chance - b.chance)) {
        if (rand <= drop.chance) {
            caught = drop
            break
        }
    }
    
    const qty = 1
    user.inventory[caught.item] = (user.inventory[caught.item] || 0) + qty
    
    const expReward = caught.exp
    await addExpWithLevelCheck(sock, m, db, user, expReward)
    
    db.save()
    
    let txt = `🎣 *¡PESCA FINALIZADA!*\n\n`
    txt += `> Has tenido suerte en las aguas de **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃**.\n\n`
    txt += `╭┈┈⬡「 📦 *BOTÍN* 」\n`
    txt += `┃ Obtenido: *${caught.name}*\n`
    txt += `┃ ✨ Exp: *+${expReward}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡`
    
    await m.react('🎣')
    await m.reply(txt)
}

export { pluginConfig as config, handler }
