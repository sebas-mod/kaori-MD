import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Convierte automáticamente stickers recibidos en imágenes/videos',
    usage: '.automedia on/off',
    example: '.automedia on',
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
    const args = m.args || []
    const groupData = db.getGroup(m.chat) || {}
    const current = groupData.automedia ?? false
    const arg = args[0]?.toLowerCase()
    
    if (!arg) {
        const status = current ? '✅ Activo' : '❌ Desactivado'
        return m.reply(
            `🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Estado: ${status}\n\n` +
            `> Uso:\n` +
            `> \`${m.prefix}automedia on\` - Activar\n` +
            `> \`${m.prefix}automedia off\` - Desactivar\n\n` +
            `> _Convierte automáticamente stickers a imagen_\n` +
            `> _Nota: No aplica para stickers animados_`
        )
    }
    
    if (arg === 'on' || arg === '1' || arg === 'activar') {
        if (current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ¡Ya está activo!`)
        }
        db.setGroup(m.chat, { ...groupData, automedia: true })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ✅ ¡Se ha activado correctamente!\n> Los stickers se convertirán automáticamente en imagen/video.`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'desactivar') {
        if (!current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ¡Ya está desactivado!`)
        }
        db.setGroup(m.chat, { ...groupData, automedia: false })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ❌ Se ha desactivado correctamente.`)
    }
    
    return m.reply(`❌ Uso incorrecto. Usa: \`${m.prefix}automedia on/off\``)
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = getDatabase()
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.automedia) return false
        
        const msg = m.message
        if (!msg) return false
        
        const hasSticker = msg.stickerMessage
        if (!hasSticker) return false
        
        // No procesar stickers animados para evitar errores de buffer pesado
        if (hasSticker.isAnimated) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        await sock.sendMedia(m.chat, buffer, null, m, { 
            type: 'image',
        })
        
        return true
    } catch (err) {
        return false
    }
}

export { pluginConfig as config, handler, autoMediaHandler }
