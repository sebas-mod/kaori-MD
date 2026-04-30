import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'cirujear',
    alias: ['scavenge', 'mulung', 'recolectar', 'juntar'],
    category: 'rpg',
    description: 'Buscá entre la basura para encontrar cosas y ganar unos mangos',
    usage: '.cirujear',
    example: '.cirujear',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 300, // 5 minutos
    energi: 1,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🗑️ *𝐂𝐈𝐑𝐔𝐉𝐄𝐎*', body = 'Buscando algo de valor...') {
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
    if (!user.inventory) user.inventory = {}
    
    const staminaCost = 15
    user.rpg.stamina = user.rpg.stamina ?? 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *𝐒𝐈𝐍 𝐒𝐓𝐀𝐌𝐈𝐍𝐀*\n\n` +
            `> Necesitás ${staminaCost} de energía para ir a cirujear.\n` +
            `> Tu stamina: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.react('🕕')
    await m.reply(`🗑️ *𝐑𝐄𝐂𝐎𝐋𝐄𝐂𝐓𝐀𝐍𝐃𝐎...*\n\n> Revisando los tachos de la zona...`)
    await new Promise(r => setTimeout(r, 2000))
    
    const drops = [
        { item: 'botella', name: '🍶 Botella', min: 1, max: 10 },
        { item: 'lata', name: '🥫 Lata', min: 1, max: 8 },
        { item: 'carton', name: '📦 Cartón', min: 1, max: 5 },
        { item: 'basura', name: '🗑️ Chatarra', min: 1, max: 15 },
        { item: 'diario', name: '📰 Diario viejo', min: 0, max: 3 }
    ]
    
    let results = []
    let moneyEarned = 0
    
    for (const drop of drops) {
        const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
        if (qty > 0) {
            user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty
            results.push({ name: drop.name, qty })
            // Pago por lo recolectado
            moneyEarned += qty * Math.floor(Math.random() * 50 + 10)
        }
    }
    
    user.koin = (user.koin || 0) + moneyEarned
    
    const expGain = Math.floor(Math.random() * 200) + 50
    await addExpWithLevelCheck(sock, m, db, user, expGain)
    
    db.save()
    
    await m.react('✅')
    
    let txt = `🗑️ *𝐑𝐄𝐂𝐎𝐋𝐄𝐂𝐓𝐀 𝐅𝐈𝐍𝐀𝐋𝐈Ɀ𝐀𝐃𝐀*\n\n`
    txt += `╭┈┈⬡「 📦 *𝐎𝐁𝐓𝐄𝐍𝐈𝐃𝐎* 」\n`
    for (const r of results) {
        txt += `┃ ${r.name}: *+${r.qty}*\n`
    }
    txt += `┃ ─────────\n`
    txt += `┃ 💵 Venta: *+$${moneyEarned.toLocaleString('es-AR')}*\n`
    txt += `┃ 🚄 Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡Todo suma en **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈Ɀ𝐀𝐖𝐀 𝐌𝐃**!`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo()
    }, { quoted: m })
}

export { pluginConfig as config, handler }
