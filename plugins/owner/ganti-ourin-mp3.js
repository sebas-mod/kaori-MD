import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-audio-kei',
    alias: ['setkeiaudio', 'cambiaraudiokei', 'setaudio'],
    category: 'owner',
    description: 'Cambia el archivo de audio principal (ourin.mp3) de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃',
    usage: '.cambiar-audio-kei (responder/enviar audio)',
    example: '.cambiar-audio-kei',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(
            `🎵 *CAMBIAR AUDIO PRINCIPAL*\n\n` +
            `> Envía o responde a un audio para reemplazar el archivo principal.\n` +
            `> Archivo: assets/audio/ourin.mp3`
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
            return m.reply(`❌ No se pudo descargar el audio.`)
        }
        
        const targetPath = path.join(process.cwd(), 'assets', 'audio', 'ourin.mp3')
        
        const dir = path.dirname(targetPath)
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(targetPath, buffer)
        
        m.reply(
            `✅ *ÉXITO*\n\n` +
            `> El audio principal para **𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃** ha sido actualizado correctamente.`
        )
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
