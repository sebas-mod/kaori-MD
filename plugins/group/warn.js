import { getDatabase } from '../../src/lib/ourin-database.js'
import { getParticipantJid } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'advertir', 'advertencia', 'admon'],
    category: 'group',
    description: 'Añade una advertencia a un miembro del grupo',
    usage: '.warn @user <motivo>',
    example: '.warn @user spam de mensajes',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠️ *sɪsᴛᴇᴍᴀ ᴅᴇ ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀs*\n\n` +
            `Gestión de infracciones para los miembros del grupo.\n` +
            `Límite actual: *${maxWarns} advertencias* (Expulsión automática)\n\n` +
            `*COMANDOS:* \n` +
            `• *${m.prefix}warn @user <motivo>* — Dar advertencia\n` +
            `• *${m.prefix}warn max <número>* — Cambiar límite máximo\n` +
            `• *${m.prefix}listwarn* — Ver lista de advertidos\n` +
            `• *${m.prefix}resetwarn @user* — Borrar advertencias de un miembro\n\n` +
            `*INSTRUCCIONES:* \n` +
            `1. Si un miembro rompe las reglas, usa: *${m.prefix}warn @user Spam*\n` +
            `2. El bot registrará la infracción y el motivo.\n` +
            `3. Si el usuario alcanza las *${maxWarns}* advertencias, será EXPULSADO (Kick) automáticamente.\n` +
            `4. Puedes ver el historial detallado con *${m.prefix}listwarn @user*.\n\n` +
            `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Gestión de Grupo*`
        )
    }

    if (args[0]?.toLowerCase() === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\nEl límite de advertencias debe ser un número entre 1 y 20.\nEjemplo: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅ *ʟɪ́ᴍɪᴛᴇ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ*\n\nEl máximo de advertencias para este grupo ahora es de *${newMax}*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> Responde a un mensaje + \`${m.prefix}warn motivo\`\n` +
            `> O usa: \`${m.prefix}warn @user motivo\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => getParticipantJid(p) === targetUser)
        if (participant?.admin) {
            await m.reply(`❌ No puedo dar advertencias a los administradores del grupo.`)
            return
        }
    } catch (e) {}
    
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌ No puedo advertirme a mí misma. Soy el bot.`)
        return
    }
    
    const reasonArg = m.quoted ? m.text?.trim() : m.text?.replace(/@\d+/g, '').replace(/^\s*warn\s*/i, '').trim()
    const reason = reasonArg || 'Sin motivo especificado'
    
    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]
    
    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *ʟɪ́ᴍɪᴛᴇ ᴀʟᴄᴀɴᴢᴀᴅᴏ*\n\n` +
                `@${targetName} ha sido expulsado del grupo por acumular demasiadas advertencias.\n\n` +
                `*Detalles:*\n` +
                `> Infracciones: *${warnCount}/${maxWarns}*\n` +
                `> Último motivo: *${reason}*\n\n` +
                `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Seguridad*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ ᴇᴍɪᴛɪᴅᴀ*\n\n` +
            `¡@${targetName} ha recibido una advertencia oficial!\n\n` +
            `*Resumen:*\n` +
            `> Advertencia: *${warnCount}/${maxWarns}*\n` +
            `> Motivo: *${reason}*\n\n` +
            `_Quedan ${maxWarns - warnCount} avisos más antes de la EXPULSIÓN AUTOMÁTICA._`,
            { mentions: [targetUser] }
        )
    }
}

export { pluginConfig as config, handler }
