import { getDatabase } from '../../src/lib/ourin-database.js'
import * as timeHelper from '../../src/lib/ourin-time.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'renovarsewa',
    alias: ['perpanjangsewa', 'extendersewa', 'renewsewa'],
    category: 'owner',
    description: 'Extender la duración del alquiler (sewa) de un grupo',
    usage: '.renovarsewa <link/id grupo> <duración>',
    example: '.renovarsewa https://chat.whatsapp.com/xxx 30d',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function parseDurationMs(str) {
    if (['lifetime', 'permanent', 'forever', 'unlimited', 'permanente'].includes(str.toLowerCase())) return Infinity
    const match = str.match(/^(\d+)([iIdDmMyYhH])$/)
    if (!match) return null
    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()
    // i: minutos, h: horas, d: días, m: meses (30d), y: años (365d)
    const multiplier = { i: 60000, h: 3600000, d: 86400000, m: 2592000000, y: 31536000000 }
    return multiplier[unit] ? value * multiplier[unit] : null
}

function formatDuration(str) {
    if (['lifetime', 'permanent', 'forever', 'unlimited', 'permanente'].includes(str.toLowerCase())) return 'Permanente'
    const match = str.match(/^(\d+)([iIdDmMyYhH])$/)
    if (!match) return str
    const units = { i: 'minutos', h: 'horas', d: 'días', m: 'meses', y: 'años' }
    return `${match[1]} ${units[match[2].toLowerCase()] || match[2]}`
}

async function resolveGroupId(sock, input) {
    if (input.includes('chat.whatsapp.com/')) {
        const inviteCode = input.split('chat.whatsapp.com/')[1]?.split(/[\s?]/)[0]
        if (!inviteCode) return null
        try {
            const metadata = await sock.groupGetInviteInfo(inviteCode)
            if (!metadata?.id) return null
            return { id: metadata.id, name: metadata.subject || 'Desconocido' }
        } catch { return null }
    }
    const groupId = input.includes('@g.us') ? input : input + '@g.us'
    return { id: groupId, name: null }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const args = m.args
    if (args.length < 2) {
        return m.reply(
            `📝 *ʀᴇɴᴏᴠᴀʀ ᴀʟǫᴜɪʟᴇʀ (sᴇᴡᴀ)*\n\n` +
            `Formato: *${m.prefix}renovarsewa <link/id> <duración>*\n\n` +
            `*ғᴏʀᴍᴀᴛᴏ ᴅᴇ ᴅᴜʀᴀᴄɪᴏ́ɴ:*\n` +
            `• 30i = 30 minutos\n` +
            `• 12h = 12 horas\n` +
            `• 7d = 7 días\n` +
            `• 1m = 1 mes\n` +
            `• 1y = 1 año\n` +
            `• permanente = Infinito\n\n` +
            `*ᴇᴊᴇᴍᴘʟᴏs:*\n` +
            `• ${m.prefix}renovarsewa https://chat.whatsapp.com/xxx 30d\n` +
            `• ${m.prefix}renovarsewa 120363xxx 1m\n\n` +
            `💡 La duración se suma al tiempo restante actual.`
        )
    }

    const input = args[0]
    const durationStr = args[1]
    const durationMs = parseDurationMs(durationStr)

    if (!durationMs) return m.reply(`❌ Formato de duración no válido\nEjemplo: 7d, 1m, 1y, permanente`)

    await m.react('🕕')

    try {
        const result = await resolveGroupId(sock, input)
        if (!result) {
            await m.react('❌')
            return m.reply(`❌ Grupo no encontrado`)
        }

        const { id: groupId } = result
        const existing = db.db.data.sewa.groups[groupId]

        if (!existing) {
            await m.react('❌')
            return m.reply(`❌ Este grupo no está registrado.\nUsa *${m.prefix}addsewa* para agregarlo primero.`)
        }

        if (durationMs === Infinity) {
            existing.expiredAt = 0
            existing.isLifetime = true
        } else {
            if (existing.isLifetime) {
                await m.react('❌')
                return m.reply(`❌ Este grupo ya tiene acceso Permanente.`)
            }
            const baseTime = existing.expiredAt > Date.now() ? existing.expiredAt : Date.now()
            existing.expiredAt = baseTime + durationMs
            existing.isLifetime = false
        }

        existing.renewedAt = Date.now()
        existing.renewedBy = m.sender
        if (existing.status) delete existing.status;
        db.db.write()

        const groupName = existing.name || groupId.split('@')[0]
        const expiredStr = existing.isLifetime ? 'Permanente' : timeHelper.fromTimestamp(existing.expiredAt, 'D MMMM YYYY HH:mm')

        await m.react('✅')

        let text = `✅ *ᴀʟǫᴜɪʟᴇʀ ʀᴇɴᴏᴠᴀᴅᴏ*\n\n`
        text += `Grupo: *${groupName}*\n`
        text += `Añadido: *${formatDuration(durationStr)}*\n`
        text += `Nuevo vencimiento: *${expiredStr}*`

        try {
            await sock.sendText(groupId, `📢 ¡El alquiler del bot ha sido renovado!\n\nAñadido: *${formatDuration(durationStr)}*\nNuevo vencimiento: *${expiredStr}*`, null, {
                contextInfo: {
                    forwardingScore: 99,
                    isForwarded: true,
                    externalAdReply: {
                        mediaType: 1,
                        title: 'ALQUILER RENOVADO',
                        body: `Añadido: ${formatDuration(durationStr)}`,
                        thumbnail: fs.readFileSync('./assets/images/ourin.jpg'),
                        renderLargerThumbnail: true
                    }
                }
            })
        } catch {}

        return m.reply(text)
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
