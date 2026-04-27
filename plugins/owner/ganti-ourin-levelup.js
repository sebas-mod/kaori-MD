import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-img-levelup',
    alias: ['setimglevelup', 'cambiarlevelupimg', 'setkeilevelup'],
    category: 'owner',
    description: 'Cambia la imagen de fondo para los anuncios de nivel (levelup) en 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-img-levelup (responder o enviar imagen)',
    example: '.cambiar-img-levelup',
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
            `🖼️ *CAMBIAR IMAGEN DE SUBIDA DE NIVEL*\n\n` +
            `> Envía o responde a una imagen para actualizar el fondo de levelup.\n` +
            `> Archivo: assets/images/ourin-levelup.jpg`
        )
    }
    
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        
        if (!buffer) {
            return m.reply('❌ No se pudo descargar la imagen.')
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-levelup.jpg')
        
        // Asegurar que el directorio existe
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> La imagen de levelup para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizada.`
        )
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
