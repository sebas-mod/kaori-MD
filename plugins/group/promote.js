import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'promote',
    alias: ['daradmin', 'haceradmin', 'ascender'],
    category: 'group',
    description: 'Convierte a un miembro en administrador del grupo',
    usage: '.promote @user',
    example: '.promote @user',
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
            `❌ *ᴛᴀʀɢᴇᴛ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `> ¡Responde al mensaje de alguien o menciónalo!\n` +
            `> Ejemplo: \`${m.prefix}promote @user\``
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

        if (participant.admin) {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> ¡El usuario ya es un administrador!`)
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'promote')

        await m.reply(
            `✅ @${target.split('@')[0]} ¡ahora es administrador!\n\n*KAORI MD — Gestión*`,
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
