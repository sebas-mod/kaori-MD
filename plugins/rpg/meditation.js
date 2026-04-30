import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'meditar',
    alias: ['rest', 'istirahat', 'tidur', 'sleep', 'descansar', 'dormir'],
    category: 'rpg',
    description: 'Descansá para recuperar HP, Stamina y Maná',
    usage: '.meditar',
    example: '.meditar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 600, // 10 minutos
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const currentStamina = user.rpg.stamina ?? 100
    const currentHealth = user.rpg.health || 100
    const currentMana = user.rpg.mana || 50
    
    const maxStamina = 100
    const maxHealth = 100 + ((user.level || 1) * 5)
    const maxMana = 50 + ((user.level || 1) * 3)
    
    if (currentStamina >= maxStamina && currentHealth >= maxHealth && currentMana >= maxMana) {
        return m.reply(
            `💤 *𝐄𝐒𝐓𝐀́𝐒 𝐀 𝐅𝐔𝐋𝐋*\n\n` +
            `> ⚡ Stamina: ${currentStamina}/${maxStamina}\n` +
            `> ❤️ Vida: ${currentHealth}/${maxHealth}\n` +
            `> 💙 Maná: ${currentMana}/${maxMana}\n\n` +
            `💡 ¡Ya estás en condiciones óptimas, no necesitás dormir!`
        )
    }
    
    await m.react('💤')
    await m.reply(`💤 *𝐃𝐄𝐒𝐂𝐀𝐍𝐒𝐀𝐍𝐃𝐎...*\n\n> Recuperando energías para seguir la aventura...`)
    await new Promise(r => setTimeout(r, 3000))
    
    const staminaRecovered = Math.min(maxStamina - currentStamina, 40 + Math.floor(Math.random() * 20))
    const healthRecovered = Math.min(maxHealth - currentHealth, 30 + Math.floor(Math.random() * 20))
    const manaRecovered = Math.min(maxMana - currentMana, 25 + Math.floor(Math.random() * 15))
    
    user.rpg.stamina = Math.min(maxStamina, currentStamina + staminaRecovered)
    user.rpg.health = Math.min(maxHealth, currentHealth + healthRecovered)
    user.rpg.mana = Math.min(maxMana, currentMana + manaRecovered)
    
    db.save()
    
    await m.react('✨')
    return m.reply(
        `✨ *¡𝐃𝐄𝐒𝐂𝐀𝐍𝐒𝐎 𝐅𝐈𝐍𝐀𝐋𝐈𝐙𝐀𝐃𝐎!*\n\n` +
        `╭┈┈⬡「 💖 *𝐑𝐄𝐂𝐔𝐏𝐄𝐑𝐀𝐂𝐈𝐎́𝐍* 」\n` +
        `┃ ⚡ Stamina: *+${staminaRecovered}* (${user.rpg.stamina}/${maxStamina})\n` +
        `┃ ❤️ Vida: *+${healthRecovered}* (${user.rpg.health}/${maxHealth})\n` +
        `┃ 💙 Maná: *+${manaRecovered}* (${user.rpg.mana}/${maxMana})\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Te sentís como nuevo para seguir con **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃**! 🌟`
    )
}

export { pluginConfig as config, handler }
