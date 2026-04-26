import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'proponer',
    alias: ['tembak', 'nembak', 'declararse', 'propose'],
    category: 'fun',
    description: 'Declara tu amor a alguien para ser pareja',
    usage: '.proponer @tag',
    example: '.proponer @user',
    isGroup: true,
    isEnabled: true
}

if (!global.tembakSessions) global.tembakSessions = {}

const SESSION_TIMEOUT = 3600000 // 1 hora
const romanticQuotes = [
    'No soy piloto, pero puedo hacer que tu corazón vuele conmigo 💕',
    '¿Sabés por qué me gusta la lluvia? Porque es como vos, refresca mi corazón 🌧️',
    'Sos la razón por la que sonrío sin motivo alguno 😊',
    'Si fueras una estrella, yo sería el cielo para acompañarte siempre ✨',
    'No necesito GPS, porque mi corazón ya marca tu dirección 💘',
    '¿Sabés la diferencia entre vos y el café? El café me quita el sueño, vos me hacés soñar despierto ☕',
    '¿Me prestás tu corazón? Prometo cuidarlo para siempre 💖',
    'Si el amor fuera una canción, vos serías mi melodía favorita 🎵',
    'Necesito 3 cosas: el Sol, la Luna y a Vos. El Sol para el día, la Luna para la noche y a Vos para siempre 🌙',
    'Sos la última pieza del puzzle que necesitaba para completar mi vida 🧩'
]

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let targetJid = null

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.length > 5 && num.length < 20) {
            targetJid = num + '@s.whatsapp.net'
        }
    }

    if (!targetJid) {
        return m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> \`${m.prefix}proponer @tag\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}proponer @user\`\n` +
            `> O respondé a un mensaje con \`${m.prefix}proponer\``
        )
    }

    if (targetJid === m.sender) return m.reply(`¡No podés declararte a vos mismo!`)
    if (targetJid === m.botNumber) return m.reply(`¡El bot no puede tener novix!`)

    let senderData = db.getUser(m.sender) || {}
    let targetData = db.getUser(targetJid) || {}

    if (!senderData.fun) senderData.fun = {}
    if (!targetData.fun) targetData.fun = {}

    // Verificar si el emisor ya tiene pareja
    if (senderData.fun.pasangan) {
        return m.reply(
            `❌ *ʏᴀ ᴛɪᴇɴᴇs ᴘᴀʀᴇᴊᴀ*\n\n` +
            `Tu pareja es: @${senderData.fun.pasangan.split('@')[0]}\n` +
            `Tenés que terminar primero con \`${m.prefix}terminar\``,
            { mentions: [senderData.fun.pasangan] }
        )
    }

    // Verificar si el objetivo ya tiene pareja
    if (targetData.fun.pasangan) {
        return m.reply(
            `💔 *ᴇsᴀ ᴘᴇʀsᴏɴᴀ ʏᴀ ᴛɪᴇɴᴇ ᴘᴀʀᴇᴊᴀ*\n\n` +
            `Su pareja es: @${targetData.fun.pasangan.split('@')[0]}`,
            { mentions: [targetData.fun.pasangan] }
        )
    }

    global.tembakSessions[`${m.chat}_${targetJid}`] = {
        shooter: m.sender,
        target: targetJid,
        chat: m.chat,
        timestamp: Date.now()
    }

    await m.react('💘')
    const quote = romanticQuotes[Math.floor(Math.random() * romanticQuotes.length)]

    await m.reply(
        `💘 *¡ATENCIÓN! ALGUIEN SE ESTÁ DECLARANDO*\n\n` +
        `Ey @${targetJid.split('@')[0]}, @${m.sender.split('@')[0]} te acaba de proponer ser su pareja.\n\n` +
        `_"${quote}"_\n\n` +
        `⏱️ Tenés *1 hora* para responder.\n` +
        `Escribí: *aceptar* o *rechazar* respondiendo a este mensaje.`,
        { mentions: [targetJid, m.sender] }
    )
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    const text = m.body.trim().toLowerCase()
    
    // Traducción de comandos de respuesta
    const isAccept = ['aceptar', 'terima', 'si', 'acepto'].includes(text)
    const isReject = ['rechazar', 'tolak', 'no'].includes(text)
    
    if (!isAccept && !isReject) return false
    if (!m.quoted) return false

    const db = getDatabase()
    const allSessions = Object.entries(global.tembakSessions || {}).filter(
        ([key, val]) => val.target === m.sender && val.chat === m.chat
    )

    if (allSessions.length === 0) return false
    const validSession = allSessions.find(([key, val]) => Date.now() - val.timestamp < SESSION_TIMEOUT)
    if (!validSession) return false

    const [sessKey, sessData] = validSession

    if (isAccept) {
        let shooterData = db.getUser(sessData.shooter) || {}
        let targetData = db.getUser(m.sender) || {}

        if (!shooterData.fun) shooterData.fun = {}
        if (!targetData.fun) targetData.fun = {}

        shooterData.fun.pasangan = m.sender
        targetData.fun.pasangan = sessData.shooter

        db.setUser(sessData.shooter, shooterData)
        db.setUser(m.sender, targetData)
        delete global.tembakSessions[sessKey]

        await m.react('💕')
        await m.reply(
            `💕 *¡WIIIIII, DIJO QUE SÍ!* @${sessData.shooter.split('@')[0]}\n\n` +
            `@${m.sender.split('@')[0]} y @${sessData.shooter.split('@')[0]} son oficialmente pareja.\n\n` +
            `¡Que vivan los novios! 💍`, 
            { mentions: [m.sender, sessData.shooter] }
        )
        return true
    }

    if (isReject) {
        delete global.tembakSessions[sessKey]
        await m.react('💔')
        await m.reply(
            `💔 *UFFF, SOLDADO CAÍDO...* @${sessData.shooter.split('@')[0]}\n\n` +
            `@${m.sender.split('@')[0]} rechazó la propuesta de @${sessData.shooter.split('@')[0]}.\n\n` +
            `No te preocupes, ¡hay muchos peces en el mar! 😢`, 
            { mentions: [m.sender, sessData.shooter] }
        )
        return true
    }

    return false
}

export { pluginConfig as config, handler, answerHandler }
