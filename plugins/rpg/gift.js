import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'regalo',
    alias: ['regalar', 'gift', 'obsequio'],
    category: 'rpg',
    description: 'Dale un regalo a tu pareja para aumentar el nivel de amor',
    usage: '.regalo <item> <cantidad>',
    example: '.regalo diamante 1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    if (!user.rpg.spouse) {
        return m.reply(
            `❌ *SIN PAREJA*\n\n` +
            `> ¡Todavía no te has casado con nadie!\n` +
            `> Primero casate con alguien usando \`.marry @user\``
        )
    }
    
    const args = m.args || []
    const itemKey = args[0]?.toLowerCase()
    const amount = parseInt(args[1]) || 1
    
    if (!itemKey) {
        return m.reply(
            `🎁 *𝐒𝐈𝐒𝐓𝐄𝐌𝐀 𝐃𝐄 𝐑𝐄𝐆𝐀𝐋𝐎𝐒*\n\n` +
            `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
            `┃ > Elegí un item de tu inventario\n` +
            `┃ > Ejemplo: \`.regalo diamante 1\`\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    user.inventory = user.inventory || {}
    
    if ((user.inventory[itemKey] || 0) < amount) {
        return m.reply(
            `❌ *RECURSOS INSUFICIENTES*\n\n` +
            `> No tenés suficiente *${itemKey}*.\n` +
            `> En tu inventario: ${user.inventory[itemKey] || 0}\n` +
            `> Cantidad necesaria: ${amount}`
        )
    }
    
    const spouseJid = user.rpg.spouse
    const partner = db.getUser(spouseJid)
    
    if (!partner) {
        return m.reply(`❌ *ERROR DE BASE DE DATOS*\n\n> Tu pareja no figura en nuestros registros.`)
    }
    
    partner.inventory = partner.inventory || {}
    
    // Transferencia de items
    user.inventory[itemKey] -= amount
    partner.inventory[itemKey] = (partner.inventory[itemKey] || 0) + amount
    
    // Aumento de puntos de amor (Love)
    const loveGain = amount * 10
    user.rpg.love = (user.rpg.love || 0) + loveGain
    if (partner.rpg) partner.rpg.love = (partner.rpg.love || 0) + loveGain
    
    db.save()
    
    let txt = `🎁 *¡𝐑𝐄𝐆𝐀𝐋𝐎 𝐄𝐍𝐕𝐈𝐀𝐃𝐎!*\n\n`
    txt += `> 💝 Le has dado ${amount}x ${itemKey} a tu pareja.\n`
    txt += `> 👤 Para: @${spouseJid.split('@')[0]}\n`
    txt += `> 💕 Amor: +${loveGain}\n\n`
    txt += `> _¡Qué romántico! 💖_`
    
    await m.reply(txt, { mentions: [spouseJid] })
}

export { pluginConfig as config, handler }
