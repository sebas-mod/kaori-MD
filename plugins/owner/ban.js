import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid, resolveAnyLidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'ban',
    alias: ['addban', 'block', 'banear'],
    category: 'owner',
    description: 'Bloquea a un usuario para que no pueda usar el bot',
    usage: '.ban <número/@tag>',
    example: '.ban 34612345678',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    let num = raw.replace(/[^0-9]/g, '')
    
    // Mantiene compatibilidad con prefijos automáticos si es necesario
    if (num.startsWith('0')) num = num.slice(1) 

    return num
}

async function handler(m, { sock }) {
    const targetNumber = resolveTarget(m)

    if (!targetNumber || targetNumber.length < 8 || targetNumber.length > 15) {
        return m.reply(
            `🚫 *BANEAR USUARIO*\n\n` +
            `> Ingresa el número o etiqueta a un usuario\n\n` +
            `\`Ejemplo: ${m.prefix}ban 34612345678\``
        )
    }

    if (config.isOwner(targetNumber)) {
        return m.reply(`❌ *ERROR*\n\n> No se puede banear al propietario (Owner)`)
    }

    const db = getDatabase()
    const bannedList = db.setting('bannedUsers') || []

    const alreadyBanned = bannedList.some(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (alreadyBanned) {
        return m.reply(`❌ *ERROR*\n\n> El número \`${targetNumber}\` ya está en la lista negra`)
    }

    bannedList.push(targetNumber)
    db.setting('bannedUsers', bannedList)
    config.bannedUsers = bannedList

    await m.react('🚫')

    await m.reply(
        `🚫 *USUARIO BANEADO*\n\n` +
        `╭┈┈⬡「 📋 *DETALLES* 」\n` +
        `┃ 📱 Número: \`${targetNumber}\`\n` +
        `┃ 🚫 Estado: \`Baneado\`\n` +
        `┃ 📊 Total: \`${bannedList.length}\` usuarios\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
