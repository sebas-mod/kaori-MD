import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'unban',
    alias: ['desbanear', 'quitarban', 'desbloquear'],
    category: 'owner',
    description: 'Elimina a un usuario de la lista de baneados',
    usage: '.unban <número/@tag>',
    example: '.unban 34612345678',
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
    
    // Adaptación opcional: Si el número empieza con 0, podrías añadir el prefijo de tu país
    // Por defecto mantendremos la limpieza de caracteres no numéricos
    return num
}

async function handler(m, { sock }) {
    const targetNumber = resolveTarget(m)

    if (!targetNumber || targetNumber.length < 8 || targetNumber.length > 15) {
        return m.reply(
            `✅ *ᴜɴʙᴀɴ ᴜsᴜᴀʀɪᴏ*\n\n` +
            `> Por favor, ingresa el número o etiqueta al usuario\n\n` +
            `\`Ejemplo: ${m.prefix}unban 34612345678\``
        )
    }

    const db = getDatabase()
    const bannedList = db.setting('bannedUsers') || []

    const index = bannedList.findIndex(b => {
        const c = String(b).replace(/[^0-9]/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> El número \`${targetNumber}\` no se encuentra en la lista de baneados.`)
    }

    bannedList.splice(index, 1)
    db.setting('bannedUsers', bannedList)
    config.bannedUsers = bannedList

    await m.react('✅')

    await m.reply(
        `✅ *ᴜsᴜᴀʀɪᴏ ᴅᴇsʙᴀɴᴇᴀᴅᴏ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇs* 」\n` +
        `┃ 📱 ɴᴜ́ᴍᴇʀᴏ: \`${targetNumber}\`\n` +
        `┃ ✅ ᴇsᴛᴀᴅᴏ: \`Desbaneado\`\n` +
        `┃ 📊 ʀᴇsᴛᴀɴᴛᴇs: \`${bannedList.length}\` ᴜsᴜᴀʀɪᴏs\n` +
        `╰┈┈⬡`
    )
}

export { pluginConfig as config, handler }
