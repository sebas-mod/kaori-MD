import { uploadImage } from '../../src/lib/ourin-uploader.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'tochibi',
    alias: ['chibi', 'chibistyle'],
    category: 'ai',
    description: 'Convierte la imagen a estilo Chibi',
    usage: '.tochibi (responde a una imagen)',
    example: '.tochibi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🎀 *ᴇsᴛɪʟᴏ ᴄʜɪʙɪ*\n\n> Envía o responde a una imagen para convertirla a estilo Chibi\n\n\`${m.prefix}tochibi\``)
    }
    
    m.react('🕕')

    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            m.react('❌')
            return m.reply(`❌ Error al descargar la imagen`)
        }

        const PROMPT = `Transform into chibi style, big head and small body proportions, cute expression, big sparkling eyes, smooth shading, soft lighting, highly detailed, high quality`
        
        const result = await live3d(buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result.image, null, m, {
            type: 'image'
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
