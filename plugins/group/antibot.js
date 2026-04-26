import { getDatabase } from '../../src/lib/ourin-database.js'
import { findParticipantByNumber, getParticipantJid } from '../../src/lib/ourin-lid.js'
import config from '../../config.js'

const pluginConfig = {
    name: ['antibot', 'botdetect'],
    alias: ['detectarbot', 'nobots'],
    category: 'group',
    description: 'Detecta y expulsa bots externos (Baileys) del grupo',
    usage: '.antibot <on/off>',
    example: '.antibot on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true, // Solo admins pueden configurar
    isBotAdmin: true, // El bot debe ser admin para rajar a otros
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

// Función para localizar los mensajes de protección
function gpMsg(key, replacements = {}) {
    const defaults = {
        antibot: '🤖 *AntiBot* — @%user% fue detectado como bot y se fue expulsado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}
    const current = groupData.antibot || false

    if (!args || args === 'status') {
        return m.reply(
            `🤖 *SISTEMA ANTIBOT*\n\n` +
            `> Estado: ${current ? '✅ Activado' : '❌ Desactivado'}\n\n` +
            `> Usá: \`${m.prefix}antibot on/off\``
        )
    }

    if (args === 'on') {
        db.setGroup(m.chat, { ...groupData, antibot: true })
        db.save()
        m.react('✅')
        return m.reply(`✅ *AntiBot activado en este grupo.*`)
    }

    if (args === 'off') {
        db.setGroup(m.chat, { ...groupData, antibot: false })
        db.save()
        m.react('❌')
        return m.reply(`❌ *AntiBot desactivado.*`)
    }

    return m.reply(`❌ Comando incorrecto. Usá \`${m.prefix}antibot on\` o \`${m.prefix}antibot off\``)
}

// Lógica de detección basada en IDs de mensaje y flags de Baileys
function isBotMessage(m) {
    const messageId = m.key?.id || m.id || ''

    // Patrones comunes de librerías como Baileys
    if (messageId.startsWith('3EB0')) return { isBot: true, reason: 'baileys-3EB0' }
    if (/^3A[A-F0-9]{14,}/i.test(messageId)) return { isBot: true, reason: 'baileys-3A' }
    if (messageId.startsWith('BAE5') && messageId.length === 16) return { isBot: true, reason: 'baileys-BAE5' }
    if (messageId.length === 32 && /^[A-F0-9]+$/i.test(messageId)) return { isBot: true, reason: 'hex-32-pattern' }
    if (/^[A-F0-9]{12,}$/i.test(messageId) && !messageId.includes('.')) return { isBot: true, reason: 'hex-id' }
    if (messageId.startsWith('WAMID.') || messageId.startsWith('false_')) return { isBot: true, reason: 'wamid-debug' }
    if (m.isBaileys) return { isBot: true, reason: 'isBaileys-flag' }

    const msg = m.message || {}
    if (msg.deviceSentMessage) return { isBot: true, reason: 'deviceSentMessage' }
    // Detectar mensajes interactivos que no suelen venir de usuarios reales en web/mobile
    if (msg.buttonsMessage || msg.templateMessage || msg.listMessage || msg.buttonsResponseMessage || msg.listResponseMessage) {
        return { isBot: true, reason: 'interactiveMessage' }
    }

    const senderDevice = m.key?.participant?.split(':')[1]?.split('@')[0] || ''
    if (senderDevice && parseInt(senderDevice) > 10) return { isBot: true, reason: 'multi-device-web' }

    return { isBot: false, reason: null }
}

async function detectBot(m, sock) {
    if (!m.isGroup) return false

    const db = getDatabase()
    const groupData = db.getGroup(m.chat)
    if (!groupData?.antibot) return false

    const result = isBotMessage(m)
    if (!result.isBot) return false

    const botJid = m.sender
    if (!botJid) return false

    const groupMeta = m.groupMetadata
    if (!groupMeta) return false

    const myNumber = sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0]
    const myJid = myNumber + '@s.whatsapp.net'

    // El bot propio debe ser admin para ejecutar la sanción
    const botParticipant = findParticipantByNumber(groupMeta.participants, myJid)
    if (!botParticipant?.admin) return false

    // No patear a otros admins aunque parezcan bots (prevención de errores)
    const targetParticipant = findParticipantByNumber(groupMeta.participants, botJid)
    if (targetParticipant?.admin) return false

    const targetJidToKick = targetParticipant ? getParticipantJid(targetParticipant) : botJid

    try {
        // Borramos el mensaje del bot intruso y lo rajamos
        await sock.sendMessage(m.chat, { delete: m.key })
        await sock.groupParticipantsUpdate(m.chat, [targetJidToKick], 'remove')

        await sock.sendMessage(m.chat, {
            text: gpMsg('antibot', { user: botJid.split('@')[0] }),
            mentions: [botJid]
        })

        return true
    } catch (err) {
        console.error('[ANTIBOT ERROR]', err)
        return false
    }
}

export { pluginConfig as config, handler, detectBot, isBotMessage }
