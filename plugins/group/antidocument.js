import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antidocument',
    alias: ['antidoc', 'sinarchivos', 'nodoc'],
    category: 'group',
    description: 'Bloquea el envío de documentos en el grupo',
    usage: '.antidocument <on/off>',
    example: '.antidocument on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

// Localización de los mensajes de advertencia
function gpMsg(key, replacements = {}) {
    const defaults = {
        antidocument: '⚠️ *AntiDocument* — El archivo de @%user% fue eliminado.',
    }
    let text = config.groupProtection?.[key] || defaults[key] || ''
    for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(new RegExp(`%${k}%`, 'g'), v)
    }
    return text
}

// Función que chequea los mensajes en tiempo real
async function checkAntidocument(m, sock, db) {
    if (!m.isGroup) return false
    // Los admins, el dueño y el bot están exentos del bloqueo
    if (m.isAdmin || m.isOwner || m.fromMe) return false

    const groupData = db.getGroup(m.chat) || {}
    if (!groupData.antidocument) return false

    // Detectamos si el mensaje es un documento
    const isDocument = m.isDocument || m.type === 'documentMessage' || m.type === 'documentWithCaptionMessage'
    if (!isDocument) return false

    try {
        // Borramos el archivo
        await sock.sendMessage(m.chat, { delete: m.key })
        
        // Avisamos en el grupo
        await sock.sendMessage(m.chat, {
            text: gpMsg('antidocument', { user: m.sender.split('@')[0] }),
            mentions: [m.sender],
        })
        return true
    } catch (err) {
        console.error('[ANTIDOC ERROR]', err)
        return false
    }
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const action = (m.args || [])[0]?.toLowerCase()
    const groupData = db.getGroup(m.chat) || {}

    // Mostrar estado actual si no hay argumentos
    if (!action) {
        const status = groupData.antidocument ? '✅ ACTIVADO' : '❌ DESACTIVADO'
        await m.reply(`📄 *CONFIGURACIÓN ANTIDOCUMENT*\n\n> Estado: *${status}*\n\n> Usá: \`${m.prefix}antidocument on/off\``)
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...groupData, antidocument: true })
        m.react('✅')
        await m.reply(`✅ *AntiDocument activado.* Los miembros ya no pueden mandar archivos.`)
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...groupData, antidocument: false })
        m.react('❌')
        await m.reply(`❌ *AntiDocument desactivado.*`)
        return
    }

    await m.reply(`❌ Comando incorrecto. Usá \`${m.prefix}antidocument on\` o \`off\``)
}

export { pluginConfig as config, handler, checkAntidocument }
