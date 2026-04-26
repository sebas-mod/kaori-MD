import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'pareja',
    alias: ['match', 'ship', 'compatibilidad'],
    category: 'fun',
    description: 'Empareja a 2 miembros del grupo al azar y mide su compatibilidad',
    usage: '.pareja',
    example: '.pareja',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

let thumbFun = null
try {
    const thumbPath = path.join(process.cwd(), 'assets', 'images', 'ourin-games.jpg')
    if (fs.existsSync(thumbPath)) thumbFun = fs.readFileSync(thumbPath)
} catch (e) {}

const loveQuotes = [
    '¡El amor verdadero no conoce distancias! 💕',
    'Dos corazones unidos son inseparables 💗',
    'Son como dos piezas de un rompecabezas perfecto 🧩',
    '¡Una pareja hecha en el cielo! ✨',
    '¡Tienen muchísima química! 🔥',
    'Son el ejemplo de pareja ideal 💑',
    'El destino los unió por algo 🌟',
    '¡Pareja perfecta detectada! 💘'
]

const compatibilityEmoji = (percent) => {
    if (percent >= 90) return '💕💕💕💕💕'
    if (percent >= 70) return '💕💕💕💕'
    if (percent >= 50) return '💕💕💕'
    if (percent >= 30) return '💕💕'
    return '💕'
}

const compatibilityText = (percent) => {
    if (percent >= 90) return '¡ALMAS GEMELAS! 💍'
    if (percent >= 70) return '¡Muy Compatibles! 💖'
    if (percent >= 50) return 'Tienen Onda 💗'
    if (percent >= 30) return 'Podrían Intentarlo 💓'
    return 'Necesitan Esforzarse Más 💔'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const botNumber = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'

    let groupMeta
    try {
        groupMeta = m.groupMetadata
    } catch (e) {
        return m.reply('❌ *ᴇʀʀᴏʀ*\n\n> ¡No pude obtener los datos del grupo!')
    }

    const participants = groupMeta.participants || []
    const memberJids = participants
        .map(p => p.jid || p.id)
        .filter(jid => jid && jid !== botNumber)

    if (memberJids.length < 2) {
        return m.reply('❌ *ᴇʀʀᴏʀ*\n\n> ¡Necesito al menos 2 miembros para emparejar!')
    }

    const allUsers = db.getAllUsers()
    const registeredInGroup = memberJids.filter(jid => {
        const cleanJid = jid.replace(/@.+/g, '')
        const user = allUsers[cleanJid]
        return user?.isRegistered && user.regGender
    })

    let person1 = null
    let person2 = null
    let usedRegistration = false

    if (registeredInGroup.length >= 2) {
        const males = registeredInGroup.filter(jid => {
            const cleanJid = jid.replace(/@.+/g, '')
            return allUsers[cleanJid]?.regGender === 'Laki-laki' // "Hombre" en tu DB
        })
        const females = registeredInGroup.filter(jid => {
            const cleanJid = jid.replace(/@.+/g, '')
            return allUsers[cleanJid]?.regGender === 'Perempuan' // "Mujer" en tu DB
        })

        if (males.length > 0 && females.length > 0) {
            person1 = males[Math.floor(Math.random() * males.length)]
            person2 = females[Math.floor(Math.random() * females.length)]
            usedRegistration = true
        } else {
            const shuffled = registeredInGroup.sort(() => Math.random() - 0.5)
            person1 = shuffled[0]
            person2 = shuffled[1]
            usedRegistration = true
        }
    }

    if (!person1 || !person2) {
        const shuffled = memberJids.sort(() => Math.random() - 0.5)
        person1 = shuffled[0]
        person2 = shuffled[1]
    }

    const compatibility = Math.floor(Math.random() * 100) + 1
    const quote = loveQuotes[Math.floor(Math.random() * loveQuotes.length)]

    const user1Data = allUsers[person1.replace(/@.+/g, '')]
    const user2Data = allUsers[person2.replace(/@.+/g, '')]

    let label1 = '👤'
    let label2 = '👤'
    let name1 = `@${person1.split('@')[0]}`
    let name2 = `@${person2.split('@')[0]}`

    // Lógica de iconos de género
    if (user1Data?.regGender === 'Laki-laki') label1 = '👨'
    else if (user1Data?.regGender === 'Perempuan') label1 = '👩'
    
    if (user2Data?.regGender === 'Laki-laki') label2 = '👨'
    else if (user2Data?.regGender === 'Perempuan') label2 = '👩'

    if (user1Data?.regName) name1 = `*${user1Data.regName}* (@${person1.split('@')[0]})`
    if (user2Data?.regName) name2 = `*${user2Data.regName}* (@${person2.split('@')[0]})`

    const progressBar = (() => {
        const filled = Math.floor(compatibility / 10)
        const empty = 10 - filled
        return '█'.repeat(filled) + '░'.repeat(empty)
    })()

    let text = `💘 *ᴘᴀʀᴇᴊᴀ ᴅᴇʟ ᴅɪ́ᴀ*\n\n`
    text += `╭┈┈⬡「 💑 *ᴘᴀʀᴇᴊᴀ* 」\n`
    text += `┃ ${label1} ${name1}\n`
    text += `┃ ❤️\n`
    text += `┃ ${label2} ${name2}\n`
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    text += `╭┈┈⬡「 📊 *ᴄᴏᴍᴘᴀᴛɪʙɪʟɪᴅᴀᴅ* 」\n`
    text += `┃ ${progressBar} *${compatibility}%*\n`
    text += `┃ ${compatibilityEmoji(compatibility)}\n`
    text += `┃ Estado: *${compatibilityText(compatibility)}*\n`
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    if (usedRegistration) {
        text += `> ✨ _Emparejados según datos de registro_\n`
    }
    text += `> _"${quote}"_`

    await m.react('💕')
    await m.reply(text, { mentions: [person1, person2] })
}

export { pluginConfig as config, handler }
