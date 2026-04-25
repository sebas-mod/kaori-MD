import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'tooilpainting',
    alias: ['oilpainting', 'tooil', 'oleo', 'pinturaoleo'],
    category: 'ai',
    description: 'Convierte fotos al estilo de pintura al óleo',
    usage: '.tooilpainting (responde/envía una imagen)',
    example: '.tooilpainting',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transforma esta imagen en un estilo de pintura al óleo clásica. 
Aplica pinceladas gruesas, colores intensos y la textura de la pintura al óleo tradicional sobre lienzo. 
Mantén la composición original pero haz que parezca una obra maestra con pinceladas visibles, 
mezclas de colores artísticas y esa estética atemporal de calidad de galería.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🖼️ *ᴀ ᴘɪɴᴛᴜʀᴀ ᴀʟ ᴏ́ʟᴇᴏ*\n\n` +
            `> Envía o responde a una imagen para convertirla a estilo pintura al óleo\n\n` +
            `\`${m.prefix}tooilpainting\``
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
        
        const result = await nanoBanana(buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result, null, m, {
            type: 'image',
        })
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
