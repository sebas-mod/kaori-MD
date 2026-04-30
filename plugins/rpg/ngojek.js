import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'delivery',
    alias: ['uber', 'rappi', 'pedidosya', 'moto', 'laburar'],
    category: 'rpg',
    description: 'Hacé repartos o viajes para ganar plata',
    usage: '.delivery',
    example: '.delivery',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 120, // 2 minutos
    energi: 1,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🏍️ *𝐃𝐄𝐋𝐈𝐕𝐄𝐑𝐘*', body = 'Kei Karuizawa Express') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃'
    
    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }
    
    if (thumbRpg) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbRpg,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: config.saluran?.link || ''
        }
    }
    
    return contextInfo
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    
    if (!user.rpg) user.rpg = {}
    
    const staminaCost = 15
    user.rpg.stamina = user.rpg.stamina ?? 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐈𝐍 𝐍𝐀𝐅𝐓𝐀*\n\n` +
            `> Necesitás ${staminaCost} de stamina para salir a laburar.\n` +
            `> Tu stamina: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.react('🏍️')
    
    const orders = [
        { type: '🍔 Hamburguesas', distance: '2.5km', min: 5000, max: 15000 },
        { type: '👤 Viaje Corto', distance: '4km', min: 10000, max: 25000 },
        { type: '📦 Paquete', distance: '3.2km', min: 8000, max: 20000 },
        { type: '🛒 Supermercado', distance: '5km', min: 12000, max: 30000 },
        { type: '👥 Viaje Largo', distance: '12km', min: 25000, max: 55000 }
    ]
    
    const order = orders[Math.floor(Math.random() * orders.length)]
    const earning = Math.floor(Math.random() * (order.max - order.min + 1)) + order.min
    const tips = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : 0
    const totalEarning = earning + tips
    
    await m.reply(`🏍️ *𝐋𝐀𝐁𝐔𝐑𝐀𝐍𝐃𝐎...*\n\n> Pedido: ${order.type}\n> Distancia: ${order.distance}`)
    await new Promise(r => setTimeout(r, 2500))
    
    user.koin = (user.koin || 0) + totalEarning
    
    const expGain = Math.floor(totalEarning / 20)
    await addExpWithLevelCheck(sock, m, db, user, expGain)
    
    db.save()
    
    await m.react('✅')
    
    let txt = `🏍️ *𝐕𝐈𝐀𝐉𝐄 𝐅𝐈𝐍𝐀𝐋𝐈Ɀ𝐀𝐃𝐎*\n\n`
    txt += `╭┈┈⬡「 📋 *𝐎𝐑𝐃𝐄𝐑* 」\n`
    txt += `┃ 📱 Tipo: ${order.type}\n`
    txt += `┃ 📍 Distancia: ${order.distance}\n`
    txt += `┃ ─────────\n`
    txt += `┃ 💵 Ganancia: *+$${earning.toLocaleString('es-AR')}*\n`
    if (tips > 0) {
        txt += `┃ 🎁 Propina: *+$${tips.toLocaleString('es-AR')}*\n`
    }
    txt += `┃ 🚄 Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Buen laburo para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo('🏍️ *𝐃𝐄𝐋𝐈𝐕𝐄𝐑𝐘*', `+$${totalEarning.toLocaleString('es-AR')}`)
    }, { quoted: m })
}

export { pluginConfig as config, handler }
