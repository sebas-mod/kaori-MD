import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'daily',
    alias: ['diario', 'harian', 'claim', 'recompensa'],
    category: 'rpg',
    description: 'Reclama tu regalo diario',
    usage: '.daily',
    example: '.daily',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🎁 *RECOLECTA DIARIA*', body = 'Sistema RPG') {
    const botName = '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'
    
    const contextInfo = {
        forwardingScore: 999,
        isForwarded: true,
    }
    
    if (thumbRpg) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbRpg,
            mediaType: 1,
            renderLargerThumbnail: false,
            sourceUrl: '' // Se deja vacío para no redirigir a ningún canal
        }
    }
    
    return contextInfo
}

function msToTime(duration) {
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const seconds = Math.floor((duration / 1000) % 60)
    return `${hours}h ${minutes}m ${seconds}s`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const isPremium = config.isPremium?.(m.sender) || false
    
    if (!user.rpg) user.rpg = {}
    
    const COOLDOWN = 86400000 
    const lastClaim = user.rpg.lastDaily || 0
    const now = Date.now()
    
    if (now - lastClaim < COOLDOWN) {
        const remaining = COOLDOWN - (now - lastClaim)
        return m.reply(
            `⏰ *YA RECLAMASTE*\n\n` +
            `> Ya retiraste tu regalo del día de hoy.\n` +
            `> Volvé en: *${msToTime(remaining)}*`
        )
    }
    
    const expReward = isPremium ? 5000 : 1000
    const moneyReward = isPremium ? 25000 : 5000
    const energiReward = isPremium ? 10 : 3
    
    user.rpg.lastDaily = now
    user.koin = (user.koin || 0) + moneyReward
    user.energi = (user.energi || 0) + energiReward
    
    await addExpWithLevelCheck(sock, m, db, user, expReward)
    db.save()
    
    await m.react('🎁')
    
    let txt = `🎁 *RECOMPENSA DIARIA*\n\n`
    txt += `╭┈┈⬡「 🎊 *¡TE LLEVÁS!* 」\n`
    txt += `┃ 💵 Plata: *+$${moneyReward.toLocaleString('es-AR')}*\n`
    txt += `┃ 🚄 Exp: *+${expReward}*\n`
    txt += `┃ ⚡ Energía: *+${energiReward}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ${isPremium ? '✨ ¡Bonus Premium aplicado!' : 'Pasate a Premium para obtener mejores recompensas.'}`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo('🎁 *RECOLECTA DIARIA*', '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃')
    }, { quoted: m })
}

export { pluginConfig as config, handler }
