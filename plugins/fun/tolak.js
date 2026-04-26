import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'rechazar',
    alias: ['reject', 'no', 'tolak', 'noup'],
    category: 'fun',
    description: 'Rechaza la propuesta de alguien para ser pareja',
    usage: '.rechazar @tag',
    example: '.rechazar @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

let thumbFun = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-games.jpg')
    if (fs.existsSync(thumbPath)) thumbFun = fs.readFileSync(thumbPath)
} catch (e) {}

const rejectionQuotes = [
    '¡Tranqui, alguien mejor vendrá pronto! 🌟',
    'Que no sea hoy no significa que no sea nunca 💪',
    '¡A otra cosa! ¡Hay muchos peces en el mar! 🐟',
    'Paciencia, el amor verdadero golpea cuando menos lo esperas 💕',
    '¡No bajes los brazos, a seguir intentando! 🔥',
    'Un rechazo es solo el comienzo de algo mejor 💪',
    '¡Todavía quedan muchísimas oportunidades afuera! ✨',
    '¡Seguro hay alguien que encaja mucho mejor con vos! 🌈'
]

function getContextInfo(title = '💔 *ʀᴇᴄʜᴀᴢᴀʀ*', body = '¡Rechazado!') {
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'

    const contextInfo = {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }

    if (thumbFun) {
        contextInfo.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbFun,
            mediaType: 1,
            renderLargerThumbnail: true,
            sourceUrl: config.saluran?.link || ''
        }
    }

    return contextInfo
}

async function handler(m, { sock }) {
    const db = getDatabase()

    let shooterJid = null

    if (m.quoted) {
        shooterJid = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        shooterJid = m.mentionedJid[0]
    }

    if (!shooterJid) {
        const sessions = global.tembakSessions || {}
        const mySession = Object.entries(sessions).find(
            ([key, val]) => val.target === m.sender && val.chat === m.chat
        )

        if (mySession) {
            shooterJid = mySession[1].shooter
        }
    }

    if (!shooterJid) {
        return m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> Respondé al mensaje de propuesta con \`${m.prefix}rechazar\`\n` +
            `> O usá \`${m.prefix}rechazar @tag\``
        )
    }

    if (shooterJid === m.sender) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡No podés rechazarte a vos mismo!`)
    }

    if (shooterJid === m.botNumber) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ¡El bot no tiene sentimientos para ser rechazado!`)
    }

    let shooterData = db.getUser(shooterJid) || {}
    let myData = db.getUser(m.sender) || {}

    if (!shooterData.fun) shooterData.fun = {}
    if (!myData.fun) myData.fun = {}

    if (shooterData.fun.pasangan !== m.sender && shooterData.fun.tembakTarget !== m.sender) {
        return m.reply(
            `❌ *sɪɴ ᴘʀᴏᴘᴜᴇsᴛᴀ*\n\n` +
            `> @${shooterJid.split('@')[0]} no se te declaró recientemente.`,
            { mentions: [shooterJid] }
        )
    }

    // Limpiar estados de relación/propuesta
    delete shooterData.fun.pasangan
    delete shooterData.fun.tembakTarget
    delete myData.fun.pasangan

    if (!shooterData.fun.ditolakCount) shooterData.fun.ditolakCount = 0
    shooterData.fun.ditolakCount++

    db.setUser(shooterJid, shooterData)
    db.setUser(m.sender, myData)

    const sessionKey = `${m.chat}_${m.sender}`
    if (global.tembakSessions?.[sessionKey]) {
        delete global.tembakSessions[sessionKey]
    }

    const quote = rejectionQuotes[Math.floor(Math.random() * rejectionQuotes.length)]

    await m.react('💔')
    
    await m.reply(`💔 *UFFF, SOLDADO CAÍDO...* @${shooterJid.split('@')[0]}\n\n` +
                `@${m.sender.split('@')[0]} rechazó la propuesta de @${shooterJid.split('@')[0]}.\n\n` +
                `_"${quote}"_\n\n` +
                `¡Ánimo, que todavía hay mucho por delante! 😢`, { mentions: [m.sender, shooterJid] })
}

export { pluginConfig as config, handler }
