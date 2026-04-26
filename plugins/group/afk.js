const afkStorage = global.afkStorage || (global.afkStorage = new Map())

const pluginConfig = {
    name: 'afk',
    alias: ['ocupado, 'brb', 'mimir'],
    category: 'group',
    description: 'Establece tu estado como AFK con un motivo',
    usage: '.afk <motivo>',
    example: '.afk a comer',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function getAfkUser(jid) {
    return afkStorage.get(jid) || null
}

function setAfkUser(jid, reason) {
    afkStorage.set(jid, {
        reason: reason || 'Sin motivo',
        time: Date.now()
    })
}

function removeAfkUser(jid) {
    afkStorage.delete(jid)
}

function isUserAfk(jid) {
    return afkStorage.has(jid)
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
        return `${hours} hs ${minutes % 60} min`
    } else if (minutes > 0) {
        return `${minutes} min ${seconds % 60} seg`
    } else {
        return `${seconds} seg`
    }
}

async function handler(m, { sock }) {
    const reason = m.text || 'Sin motivo'
    setAfkUser(m.sender, reason)
    await m.reply(
        `💤 *MODO AFK ACTIVADO*\n\n` +
        `\`\`\`@${m.sender.split('@')[0]} ahora está AFK\`\`\`\n` +
        `🍀 \`Motivo:\` *${reason}*\n\n` +
        `_Mandá cualquier mensaje para desactivarlo._`,
        { mentions: [m.sender] }
    )
}

async function checkAfk(m, sock) {
    const afkData = getAfkUser(m.sender)
    
    // Si el usuario que escribe estaba AFK, lo sacamos
    if (afkData) {
        if (m.isCommand && m.command?.toLowerCase() === 'afk') return
        removeAfkUser(m.sender)
        const duration = formatDuration(Date.now() - afkData.time)
        await m.reply(`👋 *AFK FINALIZADO*\n\n` +
                `\`\`\`@${m.sender.split('@')[0]} volvió!\`\`\`\n` +
                `🍀 \`Duración:\` *${duration}*`, { mentions: [m.sender] })
    }
    
    // Si alguien menciona a un usuario que está AFK
    if (m.isGroup && m.mentionedJid && m.mentionedJid.length > 0) {
        for (const mentioned of m.mentionedJid) {
            const mentionedAfk = getAfkUser(mentioned)
            if (mentionedAfk) {
                const duration = formatDuration(Date.now() - mentionedAfk.time)
                await m.reply(`💤 *USUARIO OCUPADO*\n\n` +
                        `No lo molestes a \`@${mentioned.split('@')[0]}\`, está AFK.\n\n` +
                        `🍀 \`Motivo:\` *${mentionedAfk.reason}*\n` +
                        `🍀 \`Hace:\` *${duration}*`, { mentions: [mentioned] })
            }
        }
    }
}

export { pluginConfig as config, handler, checkAfk, getAfkUser, setAfkUser, removeAfkUser, isUserAfk }
