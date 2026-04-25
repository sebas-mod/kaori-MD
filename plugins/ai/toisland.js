import { live3d } from '../../src/scraper/seaart.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'toisland',
    alias: ['island', 'tropical', 'isla'],
    category: 'ai',
    description: 'Convierte la foto a una atmósfera de isla tropical',
    usage: '.toisland (responde/envía una imagen)',
    example: '.toisland',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transforma esta imagen en una escena de isla tropical. 
Coloca al sujeto en un hermoso entorno de isla con un océano azul cristalino, palmeras y luz solar cálida. 
Añade iluminación realista, sombras y colores tropicales vibrantes. 
Mantén la identidad original, con alto detalle, cinemático y fotorrealista.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🏝️ *ᴀ ɪsʟᴀ*\n\n` +
            `> Envía o responde a una imagen para el efecto de isla\n\n` +
            `\`${m.prefix}toisland\``
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
            type: 'image',
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
