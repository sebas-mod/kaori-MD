import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-ourin-winner.jpg',
    alias: ['cambiarourinwinner', 'setourinwinner'],
    category: 'owner',
    description: 'Cambiar la imagen ourin-winner.jpg (miniatura de ganador de juego)',
    usage: '.cambiar-ourin-winner.jpg (responder/enviar imagen)',
    example: '.cambiar-ourin-winner.jpg',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🏆 *ᴄᴀᴍʙɪᴀʀ ᴏᴜʀɪɴ-ᴡɪɴɴᴇʀ.ᴊᴘɢ*\n\n> Envía o responde a una imagen para cambiarla\n> Archivo: assets/images/ourin-winner.jpg`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ Error al descargar la imagen`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-winner.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(`✅ *ᴇ́xɪᴛᴏ*\n\n> La imagen ourin-winner.jpg ha sido reemplazada`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
