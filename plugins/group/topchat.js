import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'topchat',
    alias: ['chatstat', 'chatstats', 'totalchat', 'leaderboard', 'ranking'],
    category: 'group',
    description: 'Mira las estadísticas de mensajes de los miembros del grupo',
    usage: '.topchat',
    example: '.topchat',
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
    const group = db.getGroup(m.chat) || {}
    const chatStats = group.chatStats || {}
    
    const sorted = Object.entries(chatStats)
        .map(([jid, data]) => ({
            jid,
            count: data.count || 0,
            lastChat: data.lastChat || 0
        }))
        .sort((a, b) => b.count - a.count)

    if (sorted.length === 0) {
        return m.reply(
            `📊 *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs ᴅᴇ ᴄʜᴀᴛ*\n\n` +
            `> Aún no hay datos de mensajes en este grupo.\n` +
            `> Los datos se registrarán automáticamente a medida que los miembros escriban.`
        )
    }

    let txt = `📊 *RANKING DE CHAT*\n\nEsta es la cantidad de mensajes enviados por los miembros en este grupo:\n\n`
    
    for (let i = 0; i < sorted.length; i++) {
        const { jid, count } = sorted[i]
        const name = jid.split('@')[0]
        // Se usa formato de número estándar (punto para miles)
        txt += `${i + 1}. @${name} — 💬 *${count.toLocaleString('es-ES')}* mensajes\n`
    }

    const totalGlobal = sorted.reduce((a, b) => a + b.count, 0).toLocaleString('es-ES')
    txt += `\n*Total de mensajes: ${totalGlobal}*\n\n*KAORI MD — Estadísticas*`

    const mentions = sorted.map(u => u.jid)
    await m.reply(txt, { mentions })
}

function incrementChatCount(chatId, senderJid, db) {
    if (!chatId || !senderJid) return
    const group = db.getGroup(chatId) || {}
    if (!group.chatStats) group.chatStats = {}
    if (!group.chatStats[senderJid]) {
        group.chatStats[senderJid] = { count: 0, lastChat: 0 }
    }
    
    group.chatStats[senderJid].count++
    group.chatStats[senderJid].lastChat = Date.now()
    
    db.setGroup(chatId, group)
}

export { pluginConfig as config, handler, incrementChatCount }
