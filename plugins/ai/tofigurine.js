import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'tofigure3',
    alias: ['figurine3', 'tofigure3', 'bandai3', 'actionfigure3', 'figura3'],
    category: 'ai',
    description: 'Convierte una foto en una figura de acción o estatuilla de colección',
    usage: '.tofigure3 (responde/envía una imagen)',
    example: '.tofigure3',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Utilizando el modelo, crea una figura comercializada a escala 1/7 de los personajes de la imagen, 
en un estilo realista y en un entorno real. La figura está colocada sobre un escritorio de computadora. 
La estatuilla tiene una base redonda de acrílico transparente, sin texto en la base. 
El contenido de la pantalla de la computadora es el proceso de modelado de esta figura. 
Junto a la pantalla hay una caja de empaque de juguete estilo BANDAI impresa con el arte original. 
El empaque presenta ilustraciones planas bidimensionales.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🎭 *ᴀ ғɪɢᴜʀᴀ 3*\n\n` +
            `> Envía o responde a una imagen para convertirla en figura de acción\n\n` +
            `\`${m.prefix}tofigure3\``
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
