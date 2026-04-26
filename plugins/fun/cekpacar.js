import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'mipareja',
    alias: ['pareja', 'novio', 'novia', 'estado'],
    category: 'fun',
    description: 'Consulta el estado civil o la pareja de alguien',
    usage: '.mipareja o .mipareja @tag',
    example: '.mipareja',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    let targetJid = m.sender
    let isOther = false

    // Lógica para determinar el objetivo (reply, tag o número)
    if (m.quoted) {
        targetJid = m.quoted.sender
        isOther = true
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        isOther = true
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.length > 5 && num.length < 20) {
            targetJid = num + '@s.whatsapp.net'
            isOther = true
        }
    }

    const userData = db.getUser(targetJid) || {}

    // Si no tiene a nadie registrado en la base de datos
    if (!userData.fun?.pasangan) {
        const nombre = isOther ? `@${targetJid.split('@')[0]}` : 'Vos'
        await m.react('💔')
        return m.reply(
            `💔 *ᴇsᴛᴀᴅᴏ sᴇɴᴛɪᴍᴇɴᴛᴀʟ*\n\n` +
            `*${nombre}* no tiene pareja.\n` +
            `TIP: ¡Buscá a alguien y usá \`${m.prefix}proponer @tag\`!`,
            { mentions: isOther ? [targetJid] : [] }
        )
    }

    const partnerJid = userData.fun.pasangan
    const partnerData = db.getUser(partnerJid) || {}
    
    // Verificación de reciprocidad
    const isMutual = partnerData.fun?.pasangan === targetJid
    const nombre = isOther ? `@${targetJid.split('@')[0]}` : 'Vos'

    if (isMutual) {
        await m.react('💕')
        await m.reply(
            `💕 *ᴇsᴛᴀᴅᴏ sᴇɴᴛɪᴍᴇɴᴛᴀʟ*\n\n` +
            `¡*${nombre}* está en una relación con @${partnerJid.split('@')[0]}! 🥳`,
            { mentions: [targetJid, partnerJid] }
        )
    } else {
        await m.react('💭')
        await m.reply(
            `💭 *ᴇsᴛᴀᴅᴏ sᴇɴᴛɪᴍᴇɴᴛᴀʟ*\n\n` +
            `*${nombre}* le tiene ganas a @${partnerJid.split('@')[0]}\n` +
            `Estado: *En la Friendzone* 😅\n\n` +
            `Esperando una respuesta...`,
            { mentions: [targetJid, partnerJid] }
        )
    }
}

export { pluginConfig as config, handler }
