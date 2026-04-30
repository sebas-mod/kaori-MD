import { getDatabase } from '../../src/lib/ourin-database.js'
import { addExpWithLevelCheck } from '../../src/lib/ourin-level.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'horario',
    alias: ['hourly', 'cada-hora', 'hora'],
    category: 'rpg',
    description: 'Reclama tu recompensa horaria',
    usage: '.horario',
    example: '.horario',
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

function getContextInfo(title = '⏰ *𝐇𝐎𝐑𝐀𝐑𝐈𝐎*', body = 'Recompensa cada hora') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'
    
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

function msToTime(duration) {
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const seconds = Math.floor((duration / 1000) % 60)
    return `${minutes} minutos y ${seconds} segundos`
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const isPremium = config.isPremium?.(m.sender) || false
    
    if (!user.rpg) user.rpg = {}
    
    const COOLDOWN = 3600000 // 1 hora
    const lastClaim = user.rpg.lastHourly || 0
    const now = Date.now()
    
    if (now - lastClaim < COOLDOWN) {
        const remaining = COOLDOWN - (now - lastClaim)
        return m.reply(
            `⏰ *𝐘𝐀 𝐑𝐄𝐂𝐋𝐀𝐌𝐀𝐃𝐎*\n\n` +
            `> Ya retiraste tu recompensa de esta hora.\n` +
            `> Volvé en: *${msToTime(remaining)}*`
        )
    }
    
    // Recompensas: más para los usuarios Premium
    const expReward = isPremium ? 1000 : 200
    const moneyReward = isPremium ? 5000 : 1000
    
    user.rpg.lastHourly = now
    user.koin = (user.koin || 0) + moneyReward
    
    await addExpWithLevelCheck(sock, m, db, user, expReward)
    db.save()
    
    await m.react('⏰')
    
    let txt = `⏰ *𝐑𝐄𝐂𝐎𝐌𝐏𝐄𝐍𝐒𝐀 𝐇𝐎𝐑𝐀𝐑𝐈𝐀*\n\n`
    txt += `╭┈┈⬡「 🎊 *𝐁𝐎𝐍𝐎* 」\n`
    txt += `┃ 💵 Plata: *+$${moneyReward.toLocaleString('es-AR')}*\n`
    txt += `┃ 🚄 Exp: *+${expReward}*\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ¡No te olvides de volver en una hora por más!`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo()
    }, { quoted: m })
}

export { pluginConfig as config, handler }
