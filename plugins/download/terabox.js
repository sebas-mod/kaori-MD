import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'

const pluginConfig = {
    name: 'terabox',
    alias: ['tb','tera'],
    category: 'download',
    description: 'Descargar archivos de TeraBox',
    usage: '.terabox <url | número>',
    example: '.terabox https://1024terabox.com/s/xxxx',
    cooldown: 20,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const input = m.text?.trim()

    if (!input.includes('terabox') && !input.includes('1024terabox')) {
        return m.reply('❌ URL no válida. Asegúrate de que sea un enlace de TeraBox.')
    }

    m.react('🕕')

    try {
        const { data } = await f(`https://api.neoxr.eu/api/terabox?url=${encodeURIComponent(input)}&apikey=${config.APIkey.neoxr}`)
        
        if (!data || data.length === 0) {
            m.react('❌')
            return m.reply('❌ No se encontraron datos para este enlace.')
        }

        const result = data[0]
        
        // Determinamos el tipo de archivo y el mimetype basándonos en la extensión
        const isVideo = result.server_filename.includes('.mp4')
        const isImage = ['.jpg', '.jpeg', '.png'].some(ext => result.server_filename.toLowerCase().includes(ext))

        await sock.sendMedia(m.chat, result.dlink, null, m, {
            type: isVideo ? 'video' : isImage ? 'image' : 'document',
            fileName: result.server_filename,
            mimetype: isVideo ? 'video/mp4' : isImage ? 'image/jpeg' : 'application/octet-stream',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })

        m.react('✅')
    } catch (error) {
        m.react('☢')
        console.error(error)
        m.reply('❌ Ocurrió un error al procesar el enlace de TeraBox.')
    }
}

export { pluginConfig as config, handler }
