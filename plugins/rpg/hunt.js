import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'cazar',
    alias: ['hunt', 'caza', 'hunting', 'berburu'],
    category: 'rpg',
    description: 'Caza animales salvajes para obtener recursos',
    usage: '.cazar',
    example: '.cazar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 90,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    if (!user.inventory) user.inventory = {}
    
    const staminaCost = 25
    user.rpg.stamina = user.rpg.stamina || 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐓𝐀𝐌𝐈𝐍𝐀 𝐈𝐍𝐒𝐔𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄*\n\n` +
            `> Necesitás ${staminaCost} de stamina para salir a cazar.\n` +
            `> Tu stamina actual: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.reply('🏹 *Buscando presas en el bosque...*')
    await new Promise(r => setTimeout(r, 2500))
    
    const animals = [
        { name: '🐰 Conejo', item: 'conejo', chance: 50, exp: 100 },
        { name: '🦌 Ciervo', item: 'ciervo', chance: 30, exp: 200 },
        { name: '🐗 Jabalí', item: 'jabali', chance: 20, exp: 300 },
        { name: '🐻 Oso', item: 'oso', chance: 10, exp: 500 },
        { name: '🦁 León', item: 'leon', chance: 5, exp: 800 },
        { name: '🐉 Dragón', item: 'dragon', chance: 1, exp: 2000 }
    ]
    
    const rand = Math.random() * 100
    let caught = null
    
    // Ordenar por probabilidad para la lógica de captura
    for (const animal of animals.sort((a, b) => a.chance - b.chance)) {
        if (rand <= animal.chance) {
            caught = animal
            break
        }
    }
    
    // Si la suerte fue muy mala, al menos un conejo
    if (!caught) {
        caught = animals.find(a => a.item === 'conejo')
    }
    
    user.inventory[caught.item] = (user.inventory[caught.item] || 0) + 1
    await addExpWithLevelCheck(sock, m, db, user, caught.exp)
    
    db.save()
    
    let txt = `🏹 *¡𝐂𝐀𝐙𝐀 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐀! - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐖𝐀𝐙𝐀 𝐌𝐃*\n\n`
    txt += `╭┈┈⬡「 🎯 *𝐁𝐎𝐓𝐈́𝐍* 」\n`
    txt += `┃ Animal: *${caught.name}*\n`
    txt += `┃ Cantidad: *+1*\n`
    txt += `┃ 🚄 Exp: *+${caught.exp}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Seguí así para subir de nivel!`
    
    await m.reply(txt)
}

export { pluginConfig as config, handler }
