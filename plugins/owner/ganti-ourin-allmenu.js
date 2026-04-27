import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-menu-img',
    alias: ['setmenuimg', 'cambiarimagenmenu', 'setkeiimg'],
    category: 'owner',
    description: 'Cambia la imagen de miniatura del menú principal de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-menu-img (responde o envía una imagen)',
    example: '.cambiar-menu-img',
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
            `🖼️ *CAMBIAR IMAGEN DEL MENÚ*\n\n` +
            `> Responde o envía una imagen para actualizar la miniatura.\n` +
            `> Archivo: assets/images/ourin-allmenu.jpg`
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
        
        // Mantengo la ruta del archivo original para que el sistema la reconozca
        const targetPath = path.join(process.cwd(), 'assets', 'images', 'ourin-allmenu.jpg')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> La imagen del menú para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizada correctamente.`
        )
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
