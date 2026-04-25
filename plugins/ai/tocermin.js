import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'tocermin',
    alias: ['mirror', 'espejo', 'reflejo'],
    category: 'ai',
    description: 'Añade un efecto de reflejo de espejo a la imagen',
    usage: '.tocermin (responde/envía una imagen)',
    example: '.tocermin',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Crea un efecto de reflejo de espejo en esta imagen. 
Añade un reflejo realista como si el sujeto estuviera frente a un espejo o una superficie reflectante. 
Asegura la simetría, una mezcla suave del reflejo, así como luces y sombras realistas. 
Mantén la identidad y los detalles originales, alta calidad, fotorrealista.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🪞 *ᴀ ᴇsᴘᴇᴊᴏ*\n\n` +
            `> Envía o responde a una imagen para aplicar el efecto de espejo\n\n` +
            `\`${m.prefix}tocermin\``
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
