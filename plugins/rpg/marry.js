import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'casarse',
    alias: ['marry', 'nikah', 'wedding', 'proponer', 'casamiento'],
    category: 'rpg',
    description: 'Casate con otro usuario del bot',
    usage: '.casarse @user',
    example: '.casarse @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const target = m.mentionedJid?.[0] || m.quoted?.sender
    
    if (!target) {
        return m.reply(
            `💒 *¡𝐂𝐀𝐒𝐀𝐌𝐈𝐄𝐍𝐓𝐎!*\n\n` +
            `╭┈┈⬡「 📋 *𝐌𝐎𝐃𝐎 𝐃𝐄 𝐔𝐒𝐎* 」\n` +
            `┃ > Etiquetá a tu pareja para casarte\n` +
            `┃ > \`.casarse @user\`\n` +
            `┃ > Costo: $50.000\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    if (target === m.sender) {
        return m.reply(`❌ *¡𝐄𝐑𝐑𝐎𝐑!*\n\n> No seas tan egocéntrico, ¡no podés casarte con vos mismo!`)
    }
    
    const partner = db.getUser(target) || db.setUser(target)
    if (!partner.rpg) partner.rpg = {}
    
    if (user.rpg.spouse) {
        return m.reply(
            `❌ *𝐘𝐀 𝐄𝐒𝐓𝐀́𝐒 𝐂𝐀𝐒𝐀𝐃𝐎*\n\n` +
            `> Ya estás en una relación con @${user.rpg.spouse.split('@')[0]}.\n` +
            `> Divorciate primero con \`.divorcio\``,
            { mentions: [user.rpg.spouse] }
        )
    }
    
    if (partner.rpg.spouse) {
        return m.reply(
            `❌ *𝐎𝐁𝐉𝐄𝐓𝐈𝐕𝐎 𝐎𝐂𝐔𝐏𝐀𝐃𝐎*\n\n` +
            `> ¡Ojo! @${target.split('@')[0]} ya tiene dueño/a en el bot.`,
            { mentions: [target] }
        )
    }
    
    const marriageCost = 50000
    if ((user.koin || 0) < marriageCost) {
        return m.reply(
            `❌ *𝐒𝐈𝐍 𝐆𝐔𝐈𝐓𝐀*\n\n` +
            `> Tenés: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> Para la boda necesitás: $${marriageCost.toLocaleString('es-AR')}`
        )
    }
    
    user.koin -= marriageCost
    user.rpg.spouse = target
    user.rpg.marriedAt = Date.now()
    partner.rpg.spouse = m.sender
    partner.rpg.marriedAt = Date.now()
    
    db.save()
    
    let txt = `💒 *¡𝐍𝐔𝐄𝐕𝐎 𝐌𝐀𝐓𝐑𝐈𝐌𝐎𝐍𝐈𝐎! - 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃*\n\n`
    txt += `> 💑 @${m.sender.split('@')[0]} & @${target.split('@')[0]}\n`
    txt += `> 💍 ¡Oficialmente casados!\n`
    txt += `> 💸 Costo de la ceremonia: $${marriageCost.toLocaleString('es-AR')}\n\n`
    txt += `> _¡Que vivan los novios! 💕_`
    
    await m.reply(txt, { mentions: [m.sender, target] })
}

export { pluginConfig as config, handler }
