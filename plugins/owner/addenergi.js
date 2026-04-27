import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
const pluginConfig = {
    name: 'addenergi',
    alias: ['tambahenergi', 'giveenergi', 'addenergy'],
    category: 'owner',
    description: 'Añadir energía a un usuario',
    usage: '.addenergi <cantidad> @user',
    example: '.addenergi 100 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Ilimitado'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []

    let amount = 0
    let isUnlimited = false
    let targetJid = null

    if (m.text?.toLowerCase().includes('--unlimited') || m.text?.toLowerCase().includes('--unli')) {
        isUnlimited = true
    }

    const numArg = args.find(a => !isNaN(a) && !a.includes('@') && !a.startsWith('-'))
    if (numArg) amount = parseInt(numArg)

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        targetJid = m.mentionedJid[0]
    } else {
        const phoneArg = args.find(a => a !== numArg && a.length > 5 && /^\d+$/.test(a.replace(/[^0-9]/g, '')))
        if (phoneArg) {
            targetJid = phoneArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }
    }

    if (!targetJid && (amount > 0 || isUnlimited)) {
        targetJid = m.sender
    }

    if (!targetJid || (!isUnlimited && amount <= 0)) {
        return m.reply(
            `⚡ *AÑADIR ENERGÍA*\n\n` +
            `> \`.addenergi <cantidad>\` - a ti mismo\n` +
            `> \`.addenergi <cantidad> @user\` - a un usuario\n` +
            `> \`.addenergi --unlimited\` - energía ilimitada\n\n` +
            `\`Ejemplo: ${m.prefix}addenergi 100\``
        )
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    const effectiveUnlimited = user.energi === -1 ||
        (config.isOwner(targetJid) && (config.energi?.owner ?? -1) === -1) ||
        (config.isPremium(targetJid) && (config.energi?.premium ?? -1) === -1)

    if (!isUnlimited && effectiveUnlimited) {
        return m.reply(
            `⚡ *INFORMACIÓN*\n` +
            `@${targetJid.split('@')[0]} ya tiene energía *∞ Ilimitada*\n` +
            `No es necesario añadir más energía.`,
            { mentions: [targetJid] }
        )
    }

    if (isUnlimited) {
        db.setUser(targetJid, { energi: -1 })

        await m.react('✅')
        await m.reply(
            `✅ *La energía de @${targetJid.split('@')[0]} ahora es ilimitada*`,
            { mentions: [targetJid] }
        )
    } else {
        const newEnergi = db.updateEnergi(targetJid, amount)

        await m.react('✅')
        await m.reply(
            `✅ ¡Se han añadido *${formatNumber(amount)}* de energía a *@${targetJid.split('@')[0]}*!\nAhora tiene *${formatNumber(newEnergi)}* de energía.`,
            { mentions: [targetJid] }
        )
    }
}

export { pluginConfig as config, handler }
