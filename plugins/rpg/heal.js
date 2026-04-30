import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'curar',
    alias: ['heal', 'recuperar', 'descansar', 'sembuh'],
    category: 'rpg',
    description: 'Recuperá vida y estamina descansando (gratis pero con espera)',
    usage: '.curar',
    example: '.curar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 600,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    user.rpg.health = user.rpg.health || 100
    user.rpg.maxHealth = user.rpg.maxHealth || 100
    user.rpg.stamina = user.rpg.stamina || 100
    user.rpg.maxStamina = user.rpg.maxStamina || 100
    
    if (user.rpg.health >= user.rpg.maxHealth && user.rpg.stamina >= user.rpg.maxStamina) {
        return m.reply(`✅ ¡Tu Vida y Estamina ya están al máximo!`)
    }
    
    await m.reply('💤 *Descansando un rato para recuperar fuerzas...*')
    await new Promise(r => setTimeout(r, 3000))
    
    const healthRecover = 30
    const staminaRecover = 50
    
    const oldHealth = user.rpg.health
    const oldStamina = user.rpg.stamina
    
    user.rpg.health = Math.min(user.rpg.health + healthRecover, user.rpg.maxHealth)
    user.rpg.stamina = Math.min(user.rpg.stamina + staminaRecover, user.rpg.maxStamina)
    
    let txt = `💚 *¡𝐂𝐔𝐑𝐀𝐂𝐈𝐎́𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀! - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
    txt += `╭┈┈⬡「 ✨ *𝐑𝐄𝐂𝐔𝐏𝐄𝐑𝐀𝐂𝐈𝐎́𝐍* 」\n`
    txt += `┃ ❤️ Vida: ${oldHealth} → *${user.rpg.health}*\n`
    txt += `┃ ⚡ Estamina: ${oldStamina} → *${user.rpg.stamina}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Tip: ¡Usá \`.use pocion\` para curarte al instante!`
    
    db.save()
    await m.reply(txt)
}

export { pluginConfig as config, handler }
