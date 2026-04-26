import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'chequepremium',
    alias: ['infopremium', 'preminfo', 'serpremium'],
    category: 'cek',
    description: 'Verifica el detalle del estado premium de un usuario',
    usage: '.chequepremium @usuario',
    example: '.chequepremium',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(ts) {
    // Formato de fecha en español (ej: 26 de abril de 2026)
    return new Date(ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handler(m) {
    const db = getDatabase()
    let targetNumber = ''

    if (m.quoted) {
        targetNumber = m.quoted.sender?.replace(/[^0-9]/g, '') || ''
    } else if (m.mentionedJid?.length) {
        targetNumber = m.mentionedJid[0]?.replace(/[^0-9]/g, '') || ''
    } else if (m.args?.length) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
    } else {
        targetNumber = m.sender?.replace(/[^0-9]/g, '') || ''
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)
    if (!db.data.premium) db.data.premium = []

    const premData = db.data.premium.find(p =>
        typeof p === 'string' ? p === targetNumber : p.id === targetNumber
    )
    const jid = targetNumber + '@s.whatsapp.net'
    const isConfigPrem = config.isPremium(targetNumber)
    const isConfigOwner = config.isOwner(targetNumber)

    if (!premData && !isConfigPrem && !isConfigOwner) {
        return m.reply(`❌ @${targetNumber} no es usuario premium`, { mentions: [jid] })
    }

    const user = db.getUser(jid)
    const now = Date.now()

    let txt = `💎 *DETALLE PREMIUM*\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`

    if (isConfigOwner) {
        txt += `🏷️ Rango: *👑 Dueño (Permanente)*\n`
    } else if (typeof premData === 'string' || !premData?.expired) {
        txt += `🏷️ Rango: *💎 Premium (Permanente)*\n`
    } else {
        const remaining = Math.ceil((premData.expired - now) / (1000 * 60 * 60 * 24))
        const totalDays = premData.addedAt ? Math.ceil((premData.expired - premData.addedAt) / (1000 * 60 * 60 * 24)) : '?'
        txt += `📛 Nombre: *${premData.name || 'Desconocido'}*\n`
        txt += `📅 Inicio: *${premData.addedAt ? formatDate(premData.addedAt) : 'Desconocido'}*\n`
        txt += `⏳ Vencimiento: *${formatDate(premData.expired)}*\n`
        txt += `🗓️ Duración: *${totalDays} días*\n`
        txt += `📊 Restante: *${remaining > 0 ? remaining + ' días' : '⚠️ Expirado'}*\n`
    }

    if (user) {
        txt += `⚡ Energía: *${user.energi === -1 ? '∞' : (user.energi ?? 0)}*\n`
        txt += `💰 Monedas: *${user.koin === -1 ? '∞' : (user.koin ?? 0).toLocaleString('es-AR')}*\n`
        txt += `⭐ Exp: *${(user.exp ?? 0).toLocaleString('es-AR')}*\n`
        txt += `📊 Nivel: *${user.level ?? 1}*\n`
    }

    await m.reply(txt, { mentions: [jid] })
}

export { pluginConfig as config, handler }
