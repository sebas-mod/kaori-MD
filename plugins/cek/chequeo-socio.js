import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'chequepartner',
    alias: ['infopartner', 'partnerinfo', 'socio'],
    category: 'cek',
    description: 'Verifica el detalle del estado de socio/partner',
    usage: '.chequepartner <nombre>',
    example: '.chechequepartner @usuario',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(ts) {
    // Ajustado a formato local de Argentina
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
    if (!db.data.partner) db.data.partner = []

    const info = db.data.partner.find(p => p.id === targetNumber)
    const jid = targetNumber + '@s.whatsapp.net'

    if (!info) {
        return m.reply(`❌ @${targetNumber} no es un socio activo`, { mentions: [jid] })
    }

    const now = Date.now()
    const remaining = Math.ceil((info.expired - now) / (1000 * 60 * 60 * 24))
    const totalDays = info.addedAt ? Math.ceil((info.expired - info.addedAt) / (1000 * 60 * 60 * 24)) : '?'
    const user = db.getUser(jid)

    let txt = `🤝 *DETALLE DE SOCIO*\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`
    txt += `📛 Nombre: *${info.name || 'Desconocido'}*\n`
    txt += `📅 Inicio: *${info.addedAt ? formatDate(info.addedAt) : 'Desconocido'}*\n`
    txt += `⏳ Vencimiento: *${formatDate(info.expired)}*\n`
    txt += `🗓️ Duración Total: *${totalDays} días*\n`
    txt += `📊 Restante: *${remaining > 0 ? remaining + ' días' : '⚠️ Expirado'}*\n`
    if (user) {
        txt += `⚡ Energía: *${user.energi === -1 ? '∞' : (user.energi ?? 0)}*\n`
        txt += `💰 Monedas: *${user.koin === -1 ? '∞' : (user.koin ?? 0).toLocaleString('es-AR')}*\n`
    }

    await m.reply(txt, { mentions: [jid] })
}

export { pluginConfig as config, handler }
