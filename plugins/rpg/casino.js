import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'casino',
    alias: ['apostar', 'judi', 'gamble', 'suerte'],
    category: 'rpg',
    description: 'Jugá al casino para ganar (o perder) monedas',
    usage: '.casino <cantidad>',
    example: '.casino 10000',
    isOwner: false,
    isPremium: false,
    isGroup: false, // Cambiá a true si querés que solo sea en grupos
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

let thumbRpg = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-rpg.jpg')
    if (fs.existsSync(thumbPath)) thumbRpg = fs.readFileSync(thumbPath)
} catch (e) {}

function getContextInfo(title = '🎰 *CASINO*', body = 'Suerte o Verdad') {
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

async function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    
    let bet = args[0]
    
    if (!bet) {
        return m.reply(
            `⚠️ *CÓMO APOSTAR*\n\n` +
            `> Usá: \`${m.prefix}casino <cantidad>\`\n\n` +
            `> Ejemplos:\n` +
            `> • \`${m.prefix}casino 10000\`\n` +
            `> • \`${m.prefix}casino all\` (Jugás todo tu sueldo)`
        )
    }
    
    if (/^all$/i.test(bet)) {
        bet = user.koin || 0
    } else {
        bet = parseInt(bet)
    }
    
    if (isNaN(bet) || bet < 1000) {
        return m.reply(`❌ *MÍNIMO DE APUESTA*\n\n> La apuesta mínima es de $1.000 monedas. ¡No seas rata!`)
    }
    
    if (bet > (user.koin || 0)) {
        return m.reply(
            `❌ *NO TENÉS UN MANGO*\n\n` +
            `> Tu saldo: $${(user.koin || 0).toLocaleString('es-AR')}\n` +
            `> Querés apostar: $${bet.toLocaleString('es-AR')}`
        )
    }
    
    await m.react('🎰')
    await m.reply(`🎰 *GIRANDO LA RULETA... CRUZÁ LOS DEDOS.*`)
    await new Promise(r => setTimeout(r, 2000))
    
    const playerScore = Math.floor(Math.random() * 100)
    const botScore = Math.floor(Math.random() * 100)
    
    let result, emoji, moneyChange
    
    if (playerScore > botScore) {
        result = '¡GANASTE!'
        emoji = '🎉'
        moneyChange = bet
        user.koin = (user.koin || 0) + bet
    } else if (playerScore < botScore) {
        result = 'PERDISTE'
        emoji = '💔'
        moneyChange = -bet
        user.koin = (user.koin || 0) - bet
    } else {
        result = 'EMPATE'
        emoji = '🤝'
        moneyChange = 0
    }
    
    db.save()
    
    await m.react(emoji)
    
    let txt = `🎰 *RESULTADO DEL CASINO*\n\n`
    txt += `╭┈┈⬡「 🎲 *PUNTAJE* 」\n`
    txt += `┃ 👤 Vos: *${playerScore}* pts\n`
    txt += `┃ 🤖 Kei: *${botScore}* pts\n`
    txt += `┃ ─────────\n`
    txt += `┃ ${emoji} Resultado: *${result}*\n`
    if (moneyChange !== 0) {
        txt += `┃ 💰 ${moneyChange > 0 ? 'Ganaste' : 'Perdiste'}: *$${Math.abs(moneyChange).toLocaleString('es-AR')}*\n`
    } else {
        txt += `┃ 💰 No pasó nada, recuperás tu apuesta.\n`
    }
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> Tu saldo actual: $${(user.koin || 0).toLocaleString('es-AR')}`
    
    await sock.sendMessage(m.chat, {
        text: txt,
        contextInfo: getContextInfo(`🎰 ${result}`, `${moneyChange >= 0 ? '+' : '-'}$${Math.abs(moneyChange).toLocaleString('es-AR')}`)
    }, { quoted: m })
}

export { pluginConfig as config, handler }
