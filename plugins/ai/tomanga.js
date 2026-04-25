import nanoBanana from '../../src/scraper/nanobanana.js'
import te from '../../src/lib/ourin-error.js'
import { live3d } from '../../src/scraper/seaart.js'

const pluginConfig = {
    name: 'tomanga',
    alias: ['manga', 'mangafy', 'estilomanga'],
    category: 'ai',
    description: 'Convierte fotos al estilo de manga japonés',
    usage: '.tomanga (responde/envía una imagen)',
    example: '.tomanga',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transforma esta imagen en una ilustración de estilo manga japonés. 
Aplica la estética del manga en blanco y negro con sombreado dramático, líneas de velocidad, 
ojos expresivos y tramas detalladas. Mantén la composición original pero conviértela para 
que parezca una página de un manga japonés con líneas de tinta gruesas, poses dinámicas 
y ese estilo artístico distintivo del manga.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `📖 *ᴀ ᴍᴀɴɢᴀ*\n\n` +
            `> Envía o responde a una imagen para convertirla a estilo manga\n\n` +
            `\`${m.prefix}tomanga\``
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
