const pluginConfig = {
    name: 'magia',
    alias: ['sulap', 'magic', 'desaparecer'],
    category: 'fun',
    description: 'Acto de magia: hace desaparecer (kick) a un miembro de forma dramática',
    usage: '.magia',
    example: '.magia',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

if (!global.sulapSessions) global.sulapSessions = new Map()

const successLines = [
    '💨 *¡POOF!* ¡Y... desapareció!',
    '🌟 ¡Truco exitoso! ¡Hasta la próxima!',
    '✨ ¡Abracadabra! Se fue a otra dimensión.',
    '🎪 ¡El espectáculo ha terminado! 👏'
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function handler(m, { sock }) {
    await m.react('🎩')

    const sent = await m.reply(`🎩✨ *sʜᴏᴡ ᴅᴇ ᴍᴀɢɪᴀ*\n\n` +
            `¿A quién quieren hacer desaparecer?\n\n` +
            `> Respondé a este mensaje mencionando a la persona`)

    global.sulapSessions.set(sent.key.id, {
        admin: m.sender,
        chat: m.chat,
        timestamp: Date.now()
    })

    setTimeout(() => {
        global.sulapSessions.delete(sent.key.id)
    }, 120000)
}

async function replyHandler(m, sock) {
    if (!m.quoted) return false

    const quotedId = m.quoted?.id || m.quoted?.key?.id
    if (!quotedId) return false

    const session = global.sulapSessions.get(quotedId)
    if (!session) return false
    if (session.chat !== m.chat) return false
    if (session.admin !== m.sender) return false

    let targetJid = null
    if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted?.sender && m.quoted.sender !== sock.user?.id) {
        // Opcional: permitir que funcione solo con reply si no hay mención
        targetJid = m.quoted.sender
    }

    if (!targetJid) {
        await sock.sendMessage(m.chat, { text: '❌ ¡Tenés que mencionar a alguien!' }, { quoted: m })
        return true
    }

    global.sulapSessions.delete(quotedId)

    const targetNumber = targetJid.split('@')[0]
    const botNumber = sock.user?.id?.split(':')[0]
    const senderNumber = m.sender.split('@')[0]

    if (targetNumber === botNumber) {
        await sock.sendMessage(m.chat, { text: '🎭 ¡Un mago nunca revela sus secretos ni se desaparece a sí mismo!' })
        return true
    }

    if (targetJid === m.sender) {
        await sock.sendMessage(m.chat, { text: '🎭 ¡No podés desaparecerte a vos mismo!' })
        return true
    }

    try {
        const groupMeta = m.groupMetadata
        const target = groupMeta.participants.find(p =>
            p.jid === targetJid || p.id === targetJid
        )

        if (!target) {
            await sock.sendMessage(m.chat, { text: '👻 ¡Esa persona no está en el grupo!' })
            return true
        }

        if (['admin', 'superadmin'].includes(target.admin)) {
            await sock.sendMessage(m.chat, { text: '🛡️ ¡Los admins son inmunes a la magia!' })
            return true
        }

        await sock.sendMessage(m.chat, {
            text: `🪄 *Prepárate @${targetNumber}...* ✨`,
            mentions: [targetJid]
        })

        await sleep(2000)

        await sock.groupParticipantsUpdate(m.chat, [targetJid], 'remove')

        const line = successLines[Math.floor(Math.random() * successLines.length)]
        await sock.sendMessage(m.chat, {
            text: `${line}\n\n` +
                `🎯 ¡@${targetNumber} se ha esfumado!\n` +
                `🎩 Mago: @${senderNumber}\n\n` +
                `> _Espectáculo finalizado~_ ✨`,
            mentions: [targetJid, m.sender]
        })

    } catch (error) {
        await sock.sendMessage(m.chat, { text: `😅 El truco falló...\n\n> ${error.message}` })
    }

    return true
}

export { pluginConfig as config, handler, replyHandler }
