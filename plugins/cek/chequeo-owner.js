import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'chequeowner',
    alias: ['info-usuario', 'serowner', 'ownerinfo'],
    category: 'cek',
    description: 'Verifica si un usuario es owner del bot o sus estadísticas',
    usage: '.chequeowner @usuario',
    example: '.chequeowner',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    let targetNumber = ''
    let targetJid = ''

    if (m.quoted) {
        targetNumber = m.quoted.sender?.replace(/[^0-9]/g, '') || ''
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetNumber = m.mentionedJid[0]?.replace(/[^0-9]/g, '') || ''
        targetJid = m.mentionedJid[0]
    } else if (m.args?.length) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
        targetJid = targetNumber + '@s.whatsapp.net'
    } else {
        targetNumber = m.sender?.replace(/[^0-9]/g, '') || ''
        targetJid = m.sender
    }

    // Nota: Mantuve el prefijo 62 por compatibilidad de lógica, 
    // pero si usás números locales podés ajustarlo.
    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)

    const isOwnerUser = config.isOwner(targetNumber)
    const isPartnerUser = config.isPartner(targetNumber)
    const isPremiumUser = config.isPremium(targetNumber)
    const user = db.getUser(targetJid)

    const roles = []
    if (isOwnerUser) roles.push('👑 Dueño/Owner')
    if (isPartnerUser) roles.push('🤝 Socio/Partner')
    if (isPremiumUser) roles.push('💎 Premium')
    if (roles.length === 0) roles.push('👤 Usuario Free')

    const ownerList = db.data.owner || []
    const isInOwnerDb = ownerList.includes(targetNumber)

    let txt = `📋 *INFO DE USUARIO*\n\n`
    txt += `👤 Usuario: @${targetNumber}\n`
    txt += `🏷️ Rango: *${roles.join(' • ')}*\n`
    txt += `📊 Base de Datos Owner: *${isInOwnerDb ? 'Sí' : 'No'}*\n`
    if (user) {
        txt += `⚡ Energía: *${user.energi === -1 ? '∞' : (user.energi ?? 0)}*\n`
        txt += `💰 Monedas: *${user.koin === -1 ? '∞' : (user.koin ?? 0).toLocaleString('es-AR')}*\n`
        txt += `⭐ Nivel: *${user.level ?? 1}*\n`
    }

    await m.reply(txt, { mentions: [targetJid] })
}

export { pluginConfig as config, handler }
