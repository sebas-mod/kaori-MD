import axios from 'axios'
import { getParticipantJid, resolveAnyLidToJid } from '../../src/lib/ourin-lid.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'groupinfo',
    alias: ['infogrupo', 'gcinfo', 'infogc', 'gc'],
    category: 'group',
    description: 'Muestra la información detallada del grupo',
    usage: '.groupinfo',
    example: '.groupinfo',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

function featureStatus(val) {
    if (val === true || val === 'on') return '✅'
    return '❌'
}

async function handler(m, { sock, db }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const admins = participants.filter(p => p.admin)

        let ownerJid = null
        if (groupMeta.owner) ownerJid = resolveAnyLidToJid(groupMeta.owner, participants)
        if (!ownerJid || ownerJid.includes('@lid')) {
            const superAdmin = participants.find(p => p.admin === 'superadmin')
            if (superAdmin) ownerJid = getParticipantJid(superAdmin)
        }
        if (!ownerJid || ownerJid.includes('@lid')) {
            const firstAdmin = admins[0]
            if (firstAdmin) ownerJid = getParticipantJid(firstAdmin)
        }

        const group = db.getGroup(m.chat) || {}

        const createdDate = groupMeta.creation
            ? timeHelper.fromTimestamp(groupMeta.creation * 1000, 'D [de] MMMM [de] YYYY')
            : 'Desconocido'

        const ownerNumber = ownerJid ? ownerJid.split('@')[0] : null
        const ownerDisplay = ownerNumber && !ownerNumber.includes(':')
            ? `@${ownerNumber}`
            : 'Desconocido'

        let ppUrl = null
        try {
            ppUrl = await sock.profilePictureUrl(m.chat, 'image')
        } catch {}

        const isOpen = groupMeta.announce === false || !groupMeta.announce

        let text = `👥 *ɪɴꜰᴏʀᴍᴀᴄɪᴏ́ɴ ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n`
        text += `📌 *Nombre:* ${groupMeta.subject}\n`
        text += `🆔 *ID:* ${m.chat}\n`
        text += `👑 *Dueño:* ${ownerDisplay}\n`
        text += `📅 *Creado:* ${createdDate}\n`
        text += `🔓 *Estado:* ${isOpen ? 'Abierto' : 'Cerrado (Solo Admins)'}\n\n`

        text += `📊 *ᴇsᴛᴀᴅɪ́sᴛɪᴄᴀs*\n`
        text += `Total de miembros: *${participants.length}*\n`
        text += `Administradores: *${admins.length}*\n`
        text += `Usuarios: *${participants.length - admins.length}*\n\n`

        text += `🔧 *ꜰᴜɴᴄɪᴏɴᴇs ᴀᴄᴛɪᴠᴀs*\n`
        text += `Welcome: ${featureStatus(group.welcome)} | `
        text += `Goodbye: ${featureStatus(group.goodbye)}\n`
        text += `Autoreply: ${featureStatus(group.autoreply)} | `
        text += `AutoAI: ${featureStatus(group.autoai)}\n`
        text += `AutoDL: ${featureStatus(group.autodl)} | `
        text += `Sticker: ${featureStatus(group.autosticker)}\n\n`

        text += `🛡️ *ᴘʀᴏᴛᴇᴄᴄɪᴏ́ɴ*\n`
        text += `AntiLink: ${featureStatus(group.antilink)} | `
        text += `AntiBot: ${featureStatus(group.antibot)}\n`
        text += `AntiToxic: ${featureStatus(group.antitoxic)} | `
        text += `AntiSpam: ${featureStatus(group.antispam)}\n`
        text += `AntiViewOnce: ${featureStatus(group.antiviewonce)} | `
        text += `AntiDelete: ${featureStatus(group.antidelete)}\n`

        if (groupMeta.desc) {
            text += `\n📝 *ᴅᴇsᴄʀɪᴘᴄɪᴏ́ɴ*\n${groupMeta.desc}`
        }

        text += `\n\n_Powered by KAORI MD_`

        const mentions = ownerJid && !ownerJid.includes(':') ? [ownerJid] : []

        if (ppUrl) {
            try {
                const ppBuffer = Buffer.from((await axios.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 })).data)
                await sock.sendMessage(m.chat, {
                    image: ppBuffer,
                    caption: text,
                    mentions
                }, { quoted: m })
            } catch {
                await m.reply(text, { mentions })
            }
        } else {
            await m.reply(text, { mentions })
        }
    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
