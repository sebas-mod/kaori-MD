import { getAllJadibotSessions, getActiveJadibots } from '../../src/lib/ourin-jadibot-manager.js'

const pluginConfig = {
    name: 'listajadibot',
    alias: ['jadibotlist', 'alljadibot', 'listasubbot'],
    category: 'owner',
    description: 'Ver todas las sesiones de jadibot guardadas',
    usage: '.listajadibot',
    example: '.listajadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sessions = getAllJadibotSessions()
    const active = getActiveJadibots()

    if (sessions.length === 0) {
        return m.reply(`❌ No hay sesiones de jadibot guardadas`)
    }

    let txt = `🤖 *ʟɪsᴛᴀ ᴅᴇ ᴊᴀᴅɪʙᴏᴛs*\n\n`
    txt += `> 📊 Total: *${sessions.length}* sesiones\n`
    txt += `> 🟢 Activos: *${active.length}*\n`
    txt += `> ⚫ Offline: *${sessions.length - active.length}*\n\n`

    sessions.forEach((s, i) => {
        const status = s.isActive ? '🟢' : '⚫'
        const label = s.isActive ? 'En línea' : 'Desconectado'
        txt += `${status} *${i + 1}.* @${s.id} — _${label}_\n`
    })

    txt += `\n> \`${m.prefix}listajadibotactivo\` — Detalle de activos\n`
    txt += `> \`${m.prefix}stopalljadibot\` — Detener todos\n`
    txt += `> \`${m.prefix}stopdandeletejadibot @user\` — Borrar sesión`

    const mentions = sessions.map(s => s.jid)

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🟢 Ver Activos',
                    id: `${m.prefix}listajadibotactivo`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🛑 Detener Todos',
                    id: `${m.prefix}stopalljadibot`
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler }
