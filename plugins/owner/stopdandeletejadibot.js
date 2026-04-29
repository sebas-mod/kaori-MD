import { stopJadibot, getAllJadibotSessions } from '../../src/lib/ourin-jadibot-manager.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'stopdandeletejadibot',
    alias: ['eliminarjadibot', 'borrarjadibot', 'removejadibot', 'hapusjadibot'],
    category: 'owner',
    description: 'Detiene y elimina la sesión de un jadibot de forma permanente',
    usage: '.stopdandeletejadibot @usuario',
    example: '.stopdandeletejadibot @628xxx',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    } else if (m.text?.trim()) {
        const num = m.text.trim().replace(/[^0-9]/g, '')
        if (num) target = num + '@s.whatsapp.net'
    }

    if (!target) {
        const sessions = getAllJadibotSessions()

        if (sessions.length === 0) {
            return m.reply(`❌ No hay sesiones de jadibot guardadas.`)
        }

        let txt = `🗑️ *ᴅᴇᴛᴇɴᴇʀ ʏ ᴇʟɪᴍɪɴᴀʀ ᴊᴀᴅɪʙᴏᴛ*\n\n`
        txt += `Selecciona un objetivo mencionándolo o respondiendo a su mensaje:\n\n`

        sessions.forEach((s, i) => {
            const status = s.isActive ? '🟢' : '⚫'
            txt += `${status} *${i + 1}.* @${s.id}\n`
        })

        txt += `\n> Ejemplo: \`${m.prefix}stopdandeletejadibot @628xxx\``

        return sock.sendMessage(m.chat, {
            text: txt,
            mentions: sessions.map(s => s.jid)
        }, { quoted: m })
    }

    const id = target.replace(/@.+/g, '')
    const sessions = getAllJadibotSessions()
    const session = sessions.find(s => s.id === id)

    if (!session) {
        return m.reply(`❌ No se encontró la sesión de jadibot para *@${id}*`, { mentions: [target] })
    }

    await m.react('🕕')

    try {
        // El segundo parámetro 'true' indica eliminación permanente de archivos de sesión
        await stopJadibot(target, true)

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text: `🗑️ *ᴊᴀᴅɪʙᴏᴛ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
                `> 📱 Número: *@${id}*\n` +
                `> 🗑️ Estado: *Eliminado*\n\n` +
                `La sesión ha sido borrada de forma permanente.\n` +
                `El usuario deberá usar \`.jadibot\` nuevamente para crear una nueva sesión.`,
            mentions: [target]
        }, { quoted: m })
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
