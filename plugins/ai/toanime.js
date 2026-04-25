import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'toanime',
    alias: ['anime', 'animefy', 'ghibli'],
    category: 'ai',
    description: 'Convierte fotos al estilo anime/Estudio Ghibli',
    usage: '.toanime (responde/envía una imagen)',
    example: '.toanime',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transforma esta imagen al estilo de anime de Studio Ghibli. 
Haz que los personajes parezcan pertenecer a una película de Ghibli con colores suaves, 
fondos detallados, ojos expresivos y esa atmósfera cálida y mágica característica. 
Mantén la composición original pero aplica el estilo artístico distintivo de Ghibli con 
texturas tipo acuarela e iluminación de ensueño.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🎨 *ᴀ ᴀɴɪᴍᴇ*\n\n` +
            `> Envía o responde a una imagen para convertirla a estilo anime\n\n` +
            `\`${m.prefix}toanime\``
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
            m.react('❌')
            return m.reply(`❌ Error al descargar la imagen`)
        }
        
        await m.react('🕕')
        
        const result = await live3d(buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result.image, null, m, {
            type: 'image'
        })
        
    } catch (error) {
        console.log(error)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
