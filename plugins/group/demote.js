import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'demote',
    alias: ['quitaradmin', 'bajar', 'unadmin'],
    category: 'group',
    description: 'Quita el rango de administrador a un usuario',
    usage: '.demote @user',
    example: '.demote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        await m.reply(
            `❌ *ᴏʙᴊᴇᴛɪᴠᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> ¡Responde al mensaje de alguien o menciónalo!\n` +
            `> Ejemplo: \`${m.prefix}demote @user\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === target)

        if (!participant) {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> ¡El usuario no se encuentra en este grupo!`)
            return
        }

        if (!participant.admin) {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> ¡El usuario ya es un miembro común!`)
            return
        }

        if (participant.admin === 'superadmin') {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> No se puede quitar el rango al Creador (Owner) del grupo.`)
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'demote')

        await m.reply(
            `✅ @${target.split('@')[0]} ahora es un miembro común.`,
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
