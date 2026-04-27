import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-img-otp',
    alias: ['setimgotp', 'cambiarotpimg', 'setkeiotp'],
    category: 'owner',
    description: 'Cambia la imagen de fondo para los mensajes de verificación (OTP) en 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-img-otp (responder o enviar imagen)',
    example: '.cambiar-img-otp',
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
            `🖼️ *CAMBIAR IMAGEN DE OTP*\n\n` +
            `> Envía o responde a una imagen para actualizar el fondo de verificación OTP.\n` +
            `> Archivo: assets/images/ourin-otp.jpg`
        )
    }
    
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        
        if (!buffer) {
            return m.reply('❌ No se pudo descargar la imagen.')
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-otp.jpg')
        
        // Asegurar que el directorio existe
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> La imagen de OTP para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizada correctamente.`
        )
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
