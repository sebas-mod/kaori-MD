import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'autosticker',
    alias: ['autostiker', 'as'],
    category: 'group',
    description: 'Activa o desactiva la creación automática de stickers a partir de imágenes/videos',
    usage: '.autosticker <on/off>',
    example: '.autosticker on',
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
    const current = groupData.autosticker ?? false
    const arg = args[0]?.toLowerCase()
    
    if (!arg) {
        const status = current ? '✅ Activo' : '❌ Desactivado'
        return m.reply(
            `🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
            `> Estado: ${status}\n\n` +
            `> Uso:\n` +
            `> \`${m.prefix}autosticker on\` - Activar\n` +
            `> \`${m.prefix}autosticker off\` - Desactivar\n\n` +
            `> _Las imágenes y videos se convertirán en stickers automáticamente._`
        )
    }
    
    if (arg === 'on' || arg === '1' || arg === 'activar') {
        if (current) {
            return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ¡Ya se encuentra activo!`)
        }
        db.setGroup(m.chat, { ...groupData, autosticker: true })
        await db.save()
        return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ✅ ¡Activado con éxito!\n> Ahora las imágenes/videos se enviarán como stickers.`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'desactivar') {
        if (!current) {
            return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ¡Ya se encuentra desactivado!`)
        }
        db.setGroup(m.chat, { ...groupData, autosticker: false })
        await db.save()
        return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ❌ Se ha desactivado correctamente.`)
    }
    
    return m.reply(`❌ Uso incorrecto. Usa: \`${m.prefix}autosticker on/off\``)
}

async function autoStickerHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = getDatabase()
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.autosticker) return false
        
        const msg = m.message
        if (!msg) return false
        
        const type = Object.keys(msg)[0]
        const content = msg[type]

        const isImage = type === 'imageMessage' || 
                        (type === 'viewOnceMessage' && content?.message?.imageMessage) ||
                        (type === 'viewOnceMessageV2' && content?.message?.imageMessage)
        
        const isVideo = type === 'videoMessage' ||
                        (type === 'viewOnceMessage' && content?.message?.videoMessage) ||
                        (type === 'viewOnceMessageV2' && content?.message?.videoMessage)
        
        if (!isImage && !isVideo) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        // Límite de 10MB para evitar lentitud
        if (buffer.length > 10 * 1024 * 1024) return false
        
        const packname = config.sticker?.packname || 'ᴋᴀᴏʀɪ ᴍᴅ'
        const author = config.sticker?.author || 'ʙᴏᴛ'

        if (isImage) {
            await sock.sendImageAsSticker(m.chat, buffer, m, {
                packname: packname,
                author: author
            })
        } else if (isVideo) {
            const videoMsg = msg.videoMessage || content?.message?.videoMessage
            const duration = videoMsg?.seconds || 0
            if (duration > 10) return false // No convertir videos de más de 10 seg
            
            await sock.sendVideoAsSticker(m.chat, buffer, m, {
                packname: packname,
                author: author
            })
        }
        
        return true
    } catch (err) {
        return false
    }
}

export { pluginConfig as config, handler, autoStickerHandler }
