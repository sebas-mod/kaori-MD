import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antilinkgc',
    alias: ['antilinkwa', 'antigrupos', 'algc'],
    category: 'group',
    description: 'Bloquea links de WhatsApp (grupos, canales y wa.me)',
    usage: '.antilinkgc <on/off/metodo> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const option = m.text?.toLowerCase()?.trim()

    // Si no hay argumentos, mostramos el estado y la ayuda
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'

        return m.reply(
            `🔗 *CONFIGURACIÓN ANTI-LINK WA*\n\n` +
            `╭┈┈⬡「 📋 *ESTADO* 」\n` +
            `┃ ◦ Estado: *${status.toUpperCase()}*\n` +
            `┃ ◦ Modo: *${mode === 'kick' ? 'EXPULSAR' : 'SOLO BORRAR'}*\n` +
            `╰┈┈⬡\n\n` +
            `*DETECTA:* \n` +
            `> • chat.whatsapp.com (Grupos)\n` +
            `> • wa.me (Links a chats)\n` +
            `> • whatsapp.com/channel (Canales)\n\n` +
            `*MODO DE USO:*\n` +
            `> \`${m.prefix}antilinkgc on\` - Activar\n` +
            `> \`${m.prefix}antilinkgc off\` - Desactivar\n` +
            `> \`${m.prefix}antilinkgc metodo kick\` - Rajar al usuario\n` +
            `> \`${m.prefix}antilinkgc metodo remove\` - Solo borrar el mensaje`
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { ...groupData, antilinkgc: 'on' })
        return m.reply(`✅ *Anti-Link WA* activado.\n\n> Los links de grupos y canales serán eliminados.`)
    }

    if (option === 'off') {
        db.setGroup(m.chat, { ...groupData, antilinkgc: 'off' })
        return m.reply(`❌ *Anti-Link WA* desactivado.`)
    }

    // Configuración del método
    if (option.startsWith('metode')) {
        const method = m.args?.[1]?.toLowerCase()
        const groupData = db.getGroup(m.chat) || {}
        
        if (method === 'kick') {
            db.setGroup(m.chat, { ...groupData, antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(`✅ *Modo EXPULSIÓN activado.*\n\n> El que mande invitación a otros grupos será rajado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { ...groupData, antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(`✅ *Modo ELIMINAR activado.*\n\n> Los links se borrarán sin expulsar al usuario.`)
        } else {
            return m.reply(`❌ ¡Método no válido! Usá: \`kick\` o \`remove\``)
        }
    }

    // Atajos rápidos
    if (option === 'kick') {
        const groupData = db.getGroup(m.chat) || {}
        db.setGroup(m.chat, { ...groupData, antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(`✅ *Modo EXPULSIÓN activado.*`)
    }

    if (option === 'remove' || option === 'delete') {
        const groupData = db.getGroup(m.chat) || {}
        db.setGroup(m.chat, { ...groupData, antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(`✅ *Modo ELIMINAR activado.*`)
    }

    return m.reply(`❌ Opción no válida. Usá: \`on\`, \`off\`, \`metodo kick\`, \`metodo remove\``)
}

export { pluginConfig as config, handler }
