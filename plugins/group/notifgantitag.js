import fs from 'fs'
import { isToxic, handleToxicMessage, DEFAULT_TOXIC_WORDS } from './antitoxic.js'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'notiftag',
    alias: ['notiflabel', 'notifgantitag', 'labeltag'],
    category: 'group',
    description: 'Configura las notificaciones de cambio de etiqueta/label de los miembros',
    usage: '.notiftag <on/off>',
    example: '.notiftag on',
    isGroup: true,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    const sub2 = args[1]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}
    const currentStatus = groupData.notifLabelChange === true

    if (sub === 'on' && sub2 === 'all') {
        if (!m.isOwner) {
            return m.reply(`❌ ¡Solo el propietario puede usar esta función global!`)
        }
        m.react('🕕')
        try {
            const groups = await sock.groupFetchAllParticipating()
            const groupIds = Object.keys(groups)
            let count = 0
            for (const groupId of groupIds) {
                db.setGroup(groupId, { notifLabelChange: true })
                count++
            }
            m.react('✅')
            return m.reply(
                `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `> ¡Notificación de cambio de etiqueta activada en *${count}* grupos!`
            )
        } catch (err) {
            m.react('☢')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }

    if (sub === 'off' && sub2 === 'all') {
        if (!m.isOwner) {
            return m.reply(`❌ ¡Solo el propietario puede usar esta función global!`)
        }
        m.react('🕕')
        try {
            const groups = await sock.groupFetchAllParticipating()
            const groupIds = Object.keys(groups)
            let count = 0
            for (const groupId of groupIds) {
                db.setGroup(groupId, { notifLabelChange: false })
                count++
            }
            m.react('✅')
            return m.reply(
                `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `> ¡Notificación de cambio de etiqueta desactivada en *${count}* grupos!`
            )
        } catch (err) {
            m.react('☢')
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    }

    if (sub === 'on') {
        if (currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ʏᴀ ᴀᴄᴛɪᴠᴀ*\n\n` +
                `> Estado: *✅ ON*\n` +
                `> Las notificaciones de cambio de etiqueta ya están activas en este grupo.\n\n` +
                `_Usa \`${m.prefix}notiftag off\` para desactivar._`
            )
        }
        db.setGroup(m.chat, { notifLabelChange: true })
        return m.reply(
            `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀᴋᴛɪᴠᴀ*\n\n` +
            `> ¡Notificación de cambio de etiqueta activada con éxito!\n` +
            `> **KAORI MD** te avisará cuando un miembro cambie su etiqueta.\n\n` +
            `_Ejemplo: Un administrador añade la etiqueta "VIP" a un miembro._`
        )
    }

    if (sub === 'off') {
        if (!currentStatus) {
            return m.reply(
                `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ʏᴀ ɪɴᴀᴄᴛɪᴠᴀ*\n\n` +
                `> Estado: *❌ OFF*\n` +
                `> Las notificaciones ya están desactivadas en este grupo.\n\n` +
                `_Usa \`${m.prefix}notiftag on\` para activar._`
            )
        }
        db.setGroup(m.chat, { notifLabelChange: false })
        return m.reply(
            `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴀ*\n\n` +
            `> Se han desactivado las notificaciones de cambio de etiqueta.`
        )
    }

    m.reply(
        `🏷️ *ɴᴏᴛɪꜰɪᴄᴀᴄɪᴏ́ɴ ᴅᴇ ᴇᴛɪǫᴜᴇᴛᴀ/ʟᴀʙᴇʟ*\n\n` +
        `> Estado actual: *${currentStatus ? '✅ ON' : '❌ OFF'}*\n\n` +
        `\`\`\`━━━ ᴏᴘᴄɪᴏɴᴇs ━━━\`\`\`\n` +
        `> \`${m.prefix}notiftag on\` → Activar\n` +
        `> \`${m.prefix}notiftag off\` → Desactivar\n` +
        `> \`${m.prefix}notiftag on all\` → Global ON (Owner)\n` +
        `> \`${m.prefix}notiftag off all\` → Global OFF (Owner)\n\n` +
        `> 📋 *Esta función avisará cuando:*\n` +
        `> • Un admin añade una etiqueta a un miembro.\n` +
        `> • Un admin elimina la etiqueta de un miembro.\n` +
        `> • El texto de la etiqueta cambia.`
    )
}

async function handleLabelChange(msg, sock) {
    try {
        const db = getDatabase()
        const protocolMessage = msg.message?.protocolMessage
        if (!protocolMessage) return false
        if (protocolMessage.type !== 30) return false
        const memberLabel = protocolMessage.memberLabel
        if (!memberLabel) return false
        const groupJid = msg.key.remoteJid
        if (!groupJid?.endsWith('@g.us')) return false
        const groupData = db.getGroup(groupJid) || {}
        const participant = msg.key.participant || msg.participant || 'Unknown'
        const label = memberLabel.label || ''

        // Chequeo de Toxicidad en la etiqueta
        if (groupData.antitoxic && label && label.trim()) {
            try {
                const toxicWords = groupData.toxicWords || DEFAULT_TOXIC_WORDS
                const toxicCheck = isToxic(label, toxicWords)
                if (toxicCheck.toxic) {
                    await sock.sendText(groupJid, `¡Hey @${participant.split('@')[0]}, tu etiqueta contiene palabras prohibidas!`, null, {
                        mentions: [participant],
                        contextInfo: {
                            mentionedJid: [participant],
                            forwardingScore: 99,
                            isForwarded: true,
                            externalAdReply: {
                                mediaType: 1,
                                mediaUrl: null,
                                sourceUrl: null,
                                title: "ADVERTENCIA DE ETIQUETA",
                                body: "KAORI MD - SISTEMA ANTI-TOXIC",
                                thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                                renderLargerThumbnail: true,
                            }
                        },
                    })
                    return true
                }
            } catch {}
        }

        if (groupData.notifLabelChange !== true) return false
        
        let notifText = ''
        if (label && label.trim()) {
            notifText = `🎉 @${participant.split('@')[0]} ahora tiene la etiqueta: *${label}*`
        } else {
            notifText = `🥗 @${participant.split('@')[0]} ya no tiene etiqueta (removida)`
        }

        await sock.sendText(groupJid, notifText, null, {
            mentions: [participant],
            contextInfo: {
                mentionedJid: [participant],
                forwardingScore: 99,
                isForwarded: true,
                externalAdReply: {
                    mediaType: 1,
                    mediaUrl: null,
                    sourceUrl: null,
                    title: "AVISO DE ETIQUETA",
                    body: "KAORI MD - GESTIÓN DE GRUPO",
                    thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                    renderLargerThumbnail: true,
                }
            },
        })
        return true
    } catch (error) {
        console.error('[NotifLabelChange] Error:', error.message)
        return false
    }
}

export { pluginConfig as config, handler, handleLabelChange }
