import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-img-juegos',
    alias: ['setimgjuegos', 'cambiarjuegosimg', 'setkeigames'],
    category: 'owner',
    description: 'Cambia la imagen de miniatura para la sección de juegos de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-img-juegos (responder o enviar imagen)',
    example: '.cambiar-img-juegos',
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
        return m.reply(
            `🖼️ *CAMBIAR IMAGEN DE JUEGOS*\n\n` +
            `> Envía o responde a una imagen para actualizar la miniatura de juegos.\n` +
            `> Archivo: assets/images/ourin-games.jpg`
        )
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌ No se pudo descargar la imagen.`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-games.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> La imagen para la sección de juegos de **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizada.`
        )
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
