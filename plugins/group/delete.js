const pluginConfig = {
    name: 'delete',
    alias: ['del', 'borrar', 'eliminar', 'd'],
    category: 'group',
    description: 'Elimina un mensaje respondiendo a él (reply)',
    usage: '.delete (respondiendo a un mensaje)',
    example: '.delete',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    isBotAdmin: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply('⚠️ *¡Responde al mensaje que deseas eliminar!*')
    }
    
    const quotedSender = m.quoted.sender || m.quoted.key?.participant
    const botJid = sock.user?.id?.split(':')[0] + '@s.whatsapp.net'
    
    // Verificaciones de propiedad
    const isOwnMessage = m.quoted.key?.fromMe || quotedSender === m.sender
    const isBotMessage = quotedSender === botJid || m.quoted.key?.fromMe
    
    // Si no es un mensaje propio ni del bot, se requiere ser admin
    if (!isOwnMessage && !isBotMessage) {
        if (!m.isBotAdmin) {
            return m.reply('⚠️ *¡El bot debe ser admin para eliminar mensajes de otros!*')
        }
        if (!m.isAdmin && !m.isOwner) {
            return m.reply('⚠️ *¡Solo los administradores pueden eliminar mensajes de otros!*')
        }
    }
    
    try {
        const key = {
            remoteJid: m.chat,
            id: m.quoted.key.id,
            fromMe: m.quoted.key.fromMe,
            participant: quotedSender
        }
        
        await sock.sendMessage(m.chat, { delete: key })
        await m.react('✅')
        
    } catch (err) {
        if (err.message?.includes('not found') || err.message?.includes('forbidden')) {
            await m.reply('❌ *¡Error al eliminar!*\n> El mensaje puede ser muy antiguo o ya fue borrado.')
        } else {
            await m.react('❌')
        }
    }
}

export { pluginConfig as config, handler }
