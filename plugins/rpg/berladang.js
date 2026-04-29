import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'cultivar',
    alias: ['farm', 'quinta', 'cosechar', 'berladang'],
    category: 'rpg',
    description: 'Laburá en la quinta para sacar algo de cosecha',
    usage: '.cultivar',
    example: '.cultivar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 180,
    energi: 1,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🌾 *LABURANDO EN LA QUINTA*', body = 'Cosecha del día') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'KAORI MD'
    
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
    
    const staminaCost = 20
    user.rpg.stamina = user.rpg.stamina ?? 100
    
    if (user.rpg.stamina < staminaCost) {
        return m.reply(
            `⚡ *ESTÁS RENDIDO*\n\n` +
            `> Necesitás ${staminaCost} de stamina para laburar la tierra.\n` +
            `> Stamina actual: ${user.rpg.stamina}`
        )
    }
    
    user.rpg.stamina -= staminaCost
    
    await m.react('🌾')
    await m.reply(`🌾 *SEMBRANDO Y REGANDO LA QUINTA...*`)
    await new Promise(r => setTimeout(r, 2500))
    
    const crops = [
        { item: 'trigo', name: '🌾 Trigo', chance: 90, min: 2, max: 8, price: 100 },
        { item: 'maiz', name: '🌽 Maíz', chance: 70, min: 1, max: 5, price: 150 },
        { item: 'tomate', name: '🍅 Tomate', chance: 50, min: 1, max: 4, price: 200 },
        { item: 'zanahoria', name: '🥕 Zanahoria', chance: 40, min: 1, max: 3, price: 250 },
        { item: 'frutilla', name: '🍓 Frutilla', chance: 20, min: 1, max: 2, price: 500 },
        { item: 'zapallo', name: '🎃 Zapallo', chance: 10, min: 1, max: 1, price: 1000 }
    ]
    
    let results = []
    let totalValue = 0
    
    for (const crop of crops) {
        if (Math.random() * 100 <= crop.chance) {
            const qty = Math.floor(Math.random() * (crop.max - crop.min + 1)) + crop.min
            user.inventory[crop.item] = (user.inventory[crop.item] || 0) + qty
            const value = qty * crop.price
            totalValue += value
            results.push({ name: crop.name, qty, value })
        }
    }
    
    if (results.length === 0) {
        user.inventory['trigo'] = (user.inventory['trigo'] || 0) + 1
        results.push({ name: '🌾 Trigo', qty: 1, value: 100 })
        totalValue = 100
    }
    
    const expGain = Math.floor(totalValue / 10) + Math.floor(Math.random() * 100)
    await addExpWithLevelCheck(sock, m, db, user, expGain)
    
    db.save()
    
    await m.react('✅')
    
    let txt = `🌾 *COSECHA TERMINADA*\n\n`
    txt += `╭┈┈⬡「 🧺 *LO QUE SACASTE* 」\n`
    for (const r of results) {
        txt += `┃ ${r.name}: *+${r.qty}* ($${r.value.toLocaleString('es-AR')})\n`
    }
    txt += `┃ ─────────\n`
    txt += `┃ 💰 Valor total: *$${totalValue.toLocaleString('es-AR')}*\n`
    txt += `┃ ✨ Exp: *+${expGain}*\n`
    txt += `┃ ⚡ Stamina: *-${staminaCost}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Vendé todo con \`${m.prefix}sellall\``
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo()
    }, { quoted: m })
}

export { pluginConfig as config, handler }
