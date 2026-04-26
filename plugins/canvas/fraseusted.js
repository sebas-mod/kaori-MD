import axios from 'axios'
import config from '../../config.js'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'fraseusted',
    alias: ['usted', 'fraseusted', 'canvasustadz'],
    category: 'canvas',
    description: 'Crea una frase con el estilo de un Ustadz',
    usage: '.usted <texto>',
    example: '.usted No olvides agradecer',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text?.trim()
    
    if (!text) {
        return m.reply(
            `👲 *ᴄᴀɴᴠᴀs ᴜsᴛᴀᴅᴢ*\n\n` +
            `> Ingresa el texto para convertirlo en una frase.\n\n` +
            `> Ejemplo: \`${m.prefix}ustadz No olvides ser agradecido\``
        )
    }
    
    m.react('🕕')
    
    try {
        const baseUrl = 'https://api.cuki.biz.id/api/canvas/ustadz?apikey=cuki-x&text=' + encodeURIComponent(text)
        
        const response = await f(baseUrl)
        
        const imageUrl = response.results.url
        
        await sock.sendMedia(m.chat, imageUrl, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (err) {
        console.error('[Canvas Ustadz]', err)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
