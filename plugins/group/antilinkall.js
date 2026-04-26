import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'antilinkall',
    alias: ['antilinktotal', 'antiflink', 'linkall'],
    category: 'group',
    description: 'Bloquea absolutamente todos los tipos de links',
    usage: '.antilinkall <on/off/metodo> [kick/remove]',
    example: '.antilinkall on',
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

    // Si no hay argumentos, mostramos el estado actual y la ayuda
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkall || 'off'
        const mode = groupData.antilinkallMode || 'remove'

        return m.reply(
            `🔗 *CONFIGURACIÓN ANTILINK TOTAL*\n\n` +
            `╭┈┈⬡「 📋 *ESTADO* 」\n` +
            `┃ ◦ Estado: *${status.toUpperCase()}*\n` +
            `┃ ◦ Modo: *${mode === 'kick' ? 'EXPULSAR' : 'SOLO BORRAR'}*\n` +
            `╰┈┈⬡\n\n` +
            `> Detecta cualquier link (http, https, www).\n\n` +
            `*MODO DE USO:*\n` +
            `> \`${m.prefix}antilinkall on\` - Activar\n` +
            `> \`${m.prefix}antilinkall off\` - Desactivar\n` +
            `> \`${m.prefix}antilinkall metodo kick\` - Rajar al usuario\n` +
            `> \`${m.prefix}antilinkall metodo remove\` - Solo borrar el mensaje`
        )
    }

    if (option === 'on') {
        db.setGroup(m.chat, { antilinkall: 'on' })
        return m.reply(`✅ *AntiLink Total* activado.\n\n> Se eliminarán todos los links automáticamente.`)
    }

    if (option === 'off') {
        db.setGroup(m.chat, { antilinkall: 'off' })
        return m.reply(`❌ *AntiLink Total* desactivado.`)
    }

    // Configuración del método de castigo
    if (option.startsWith('metodo')) {
        const method = m.args?.[1]?.toLowerCase()
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
            return m.reply(`✅ *Modo EXPULSIÓN activado.*\n\n> El que mande cualquier link será rajado del grupo.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
            return m.reply(`✅ *Modo ELIMINAR activado.*\n\n> Los mensajes con links se borrarán sin expulsar al usuario.`)
        } else {
            return m.reply(`❌ ¡Método no válido! Usá: \`kick\` o \`remove\`\n\n> Ejemplo: \`${m.prefix}antilinkall metodo kick\``)
        }
    }

    // Atajos directos para cambiar el modo
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'kick' })
        return m.reply(`✅ *Modo EXPULSIÓN activado.*`)
    }

    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkall: 'on', antilinkallMode: 'remove' })
        return m.reply(`✅ *Modo ELIMINAR activado.*`)
    }

    return m.reply(`❌ Opción no válida. Usá: \`on\`, \`off\`, \`metodo kick\`, \`metodo remove\``)
}

export { pluginConfig as config, handler }
