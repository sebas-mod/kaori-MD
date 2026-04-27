import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-video-kei',
    alias: ['setkeivideo', 'cambiarvideokei', 'setvideo'],
    category: 'owner',
    description: 'Cambia el archivo de video principal (ourin.mp4) de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-video-kei (responder/enviar video)',
    example: '.cambiar-video-kei',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isVideo = m.type === 'videoMessage' || (m.quoted && m.quoted.type === 'videoMessage')
    
    if (!isVideo) {
        return m.reply(
            `🎬 *CAMBIAR VIDEO PRINCIPAL*\n\n` +
            `> Envía o responde a un video para reemplazar el archivo principal.\n` +
            `> Archivo: assets/video/ourin.mp4`
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
            return m.reply(`❌ No se pudo descargar el video.`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'video', 'ourin.mp4')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> El video principal para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizado correctamente.`
        )
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
