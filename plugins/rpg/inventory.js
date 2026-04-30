import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'inventario',
    alias: ['inv', 'mochila', 'bag', 'tas'],
    category: 'rpg',
    description: 'Mira qué tenés guardado en tu inventario RPG',
    usage: '.inventario',
    example: '.inventario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const ITEMS = {
    common: { emote: '📦', name: 'Caja Común' },
    uncommon: { emote: '🛍️', name: 'Caja Poco Común' },
    mythic: { emote: '🎁', name: 'Caja Mítica' },
    legendary: { emote: '💎', name: 'Caja Legendaria' },
    
    rock: { emote: '🪨', name: 'Piedra' },
    coal: { emote: '⚫', name: 'Carbón' },
    iron: { emote: '⛓️', name: 'Hierro' },
    gold: { emote: '🥇', name: 'Oro' },
    diamond: { emote: '💠', name: 'Diamante' },
    emerald: { emote: '💚', name: 'Esmeralda' },
    
    trash: { emote: '🗑️', name: 'Basura' },
    fish: { emote: '🐟', name: 'Pescado' },
    prawn: { emote: '🦐', name: 'Camarón' },
    octopus: { emote: '🐙', name: 'Pulpo' },
    shark: { emote: '🦈', name: 'Tiburón' },
    whale: { emote: '🐳', name: 'Ballena' },
    
    potion: { emote: '🥤', name: 'Poción de Vida' },
    mpotion: { emote: '🧪', name: 'Poción de Maná' },
    stamina: { emote: '⚡', name: 'Poción de Stamina' },

    // Agregados de la caza
    conejo: { emote: '🐰', name: 'Conejo' },
    ciervo: { emote: '🦌', name: 'Ciervo' },
    jabali: { emote: '🐗', name: 'Jabalí' },
    oso: { emote: '🐻', name: 'Oso' },
    leon: { emote: '🦁', name: 'León' },
    dragon: { emote: '🐉', name: 'Dragón' }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    if (!user.inventory) user.inventory = {}
    
    let invText = `╭━━━━━━━━━━━━━━━━━╮\n`
    invText += `┃ 🎒 *𝐈𝐍𝐕𝐄𝐍𝐓𝐀𝐑𝐈𝐎 𝐃𝐄 𝐔𝐒𝐔𝐀𝐑𝐈𝐎*\n`
    invText += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    
    let hasItem = false
    const categories = {
        '📦 *𝐂𝐀𝐉𝐀𝐒*': ['common', 'uncommon', 'mythic', 'legendary'],
        '⛏️ *𝐌𝐈𝐍𝐄𝐑𝐈́𝐀*': ['rock', 'coal', 'iron', 'gold', 'diamond', 'emerald'],
        '🎣 *𝐏𝐄𝐒𝐂𝐀*': ['trash', 'fish', 'prawn', 'octopus', 'shark', 'whale'],
        '🏹 *𝐂𝐀𝐙𝐀*': ['conejo', 'ciervo', 'jabali', 'oso', 'leon', 'dragon'],
        '🧪 *𝐏𝐎𝐂𝐈𝐎𝐍𝐄𝐒*': ['potion', 'mpotion', 'stamina']
    }
    
    for (const [catName, items] of Object.entries(categories)) {
        let catText = ''
        for (const itemKey of items) {
            const count = user.inventory[itemKey] || 0
            if (count > 0) {
                const item = ITEMS[itemKey]
                catText += `┃ ${item.emote} ${item.name}: *${count}*\n`
                hasItem = true
            }
        }
        if (catText) {
            invText += `╭┈┈⬡「 ${catName} 」\n`
            invText += catText
            invText += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        }
    }
    
    if (!hasItem) {
        invText += `> *¡Tu mochila está vacía! 💨*\n`
        invText += `> Salí a trabajar o a cazar para conseguir items.`
    } else {
        invText += `> Usá \`.use <ítem>\` para utilizar algo del inventario.`
    }
    
    await m.reply(invText)
}

export { pluginConfig as config, handler }
