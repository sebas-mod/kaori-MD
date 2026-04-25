import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'tocartoon',
    alias: ['cartoon', 'cartoonify', 'caricatura'],
    category: 'ai',
    description: 'Convierte fotos al estilo dibujo animado',
    usage: '.tocartoon (responde/envía una imagen)',
    example: '.tocartoon',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transforma esta imagen en un estilo de dibujo animado vibrante como la animación de Disney o Pixar. 
Aplica colores intensos, sombreado suave, rasgos exagerados y esa estética juguetona de caricatura. 
Mantén la composición original pero haz que parezca un fotograma de una película animada con 
líneas limpias, rostros expresivos y colores alegres y brillantes.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🎬 *ᴀ ᴄᴀʀɪᴄᴀᴛᴜʀᴀ*\n\n` +
            `> Envía o responde a una imagen para convertirla a estilo dibujo animado\n\n` +
            `\`${m.prefix}tocartoon\``
        )
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
