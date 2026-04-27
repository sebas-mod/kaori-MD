import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'

const pluginConfig = {
    name: 'checksewa',
    alias: ['ceksewa', 'sisasewa', 'tiempobot', 'rentado'],
    category: 'group',
    description: 'Consulta el tiempo restante de alquiler del bot en este grupo',
    usage: '.checksewa',
    example: '.checksewa',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatCountdown(expiredAt) {
    const diff = expiredAt - Date.now()
    if (diff <= 0) return { text: 'EXPIRADO', expired: true }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    
    let text = ''
    if (days > 0) text += `${days} día${days > 1 ? 's' : ''} `
    if (hours > 0) text += `${hours} hora${hours > 1 ? 's' : ''} `
    if (minutes > 0 && days === 0) text += `${minutes} minuto${minutes > 1 ? 's' : ''}`
    
    return { text: text.trim(), expired: false }
}

function handler(m) {
    const db = getDatabase()
    
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    if (!db.db.data.sewa.enabled) {
        return m.reply(`ℹ️ El sistema de alquiler no está activo.\n\nEste bot puede usarse libremente en todos los grupos.`)
    }

    const sewaData = db.db.data.sewa.groups[m.chat]

    if (!sewaData) {
        return m.reply(`❌ Este grupo no está registrado en el sistema de alquiler.\n\nContacta al Owner del bot para más información.`)
    }

    const groupName = sewaData.name || m.chat.split('@')[0]
    const addedDate = sewaData.addedAt ? timeHelper.fromTimestamp(sewaData.addedAt, 'D [de] MMMM YYYY') : '-'

    if (sewaData.isLifetime) {
        m.react('♾️')
        return m.reply(
            `♾️ *ᴇsᴛᴀᴅᴏ ᴅᴇ ᴀʟǫᴜɪʟᴇʀ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Estado: *Permanente* ♾️\n` +
            `Registrado desde: *${addedDate}*\n\n` +
            `El bot estará activo para siempre en este grupo.`
        )
    }

    const countdown = formatCountdown(sewaData.expiredAt)
    const expiredStr = timeHelper.fromTimestamp(sewaData.expiredAt, 'D [de] MMMM YYYY HH:mm')

    if (countdown.expired) {
        return m.reply(
            `❌ *ᴀʟǫᴜɪʟᴇʀ ᴇxᴘɪʀᴀᴅᴏ*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Venció el: *${expiredStr}*\n\n` +
            `Contacta al Owner del bot para renovar el servicio.`
        )
    }

    const diff = sewaData.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000 // Menos de 3 días

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `⏱️ *ᴇsᴛᴀᴅᴏ ᴅᴇ ᴀʟǫᴜɪʟᴇʀ*\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `Tiempo restante: *${countdown.text}*\n`
    text += `Vence el: *${expiredStr}*\n`
    text += `Registrado desde: *${addedDate}*`

    if (isAlmostExpired) {
        text += `\n\n⚠️ ¡El alquiler está por terminar! Contacta al Owner para renovar.`
    }

    return m.reply(text)
}

export { pluginConfig as config, handler }
