import { f } from '../../src/lib/ourin-http.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'anime-gen',
    alias: ['animegen', 'aianimegen', 'genai-anime'],
    category: 'ai',
    description: 'Genera arte de anime con IA desde un prompt',
    usage: '.anime-gen <prompt>',
    example: '.anime-gen girl, vibrant color, smilling',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const prompt = m.text
    
    if (!prompt) {
        return m.reply(
            `🎨 *ᴀɴɪᴍᴇ ᴀʀᴛ ɢᴇɴᴇʀᴀᴛᴏʀ*\n\n` +
            `> ¡Genera imágenes de anime con IA!\n\n` +
            `*MODO DE USO:*\n` +
            `> \`${m.prefix}anime-gen <descripción>\`\n\n` +
            `*EJEMPLO:*\n` +
            `> \`${m.prefix}anime-gen girl, vibrant color, smilling, yellow pink gradient hair\`\n` +
            `> \`${m.prefix}anime-gen boy, dark aesthetic, silver hair, red eyes\`\n\n` +
            `*TIPS:*\n` +
            `> • Usa de preferencia inglés\n` +
            `> • Entre más detallado el prompt, mejor el resultado\n` +
            `> • Añade estilos: vibrant, dark, pastel, etc`
        )
    }
    
    m.react('🕕')

    try {
        const NEOXR_APIKEY = config.APIkey?.neoxr || 'Milik-Bot-OurinMD'
        const apiUrl = `https://api.neoxr.eu/api/ai-anime?q=${encodeURIComponent(prompt)}&apikey=${NEOXR_APIKEY}`
        
        const data = await f(apiUrl)
        
        if (!data?.status || !data?.data?.url) {
            m.react('❌')
            return m.reply('❌ *ERROR*\n\n> No se pudo generar la imagen. ¡Inténtalo de nuevo más tarde!')
        }
        
        const result = data.data  
        await sock.sendMedia(m.chat, result.url, null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        if (error.code === 'ECONNABORTED') {
            m.reply('⏱️ *TIEMPO AGOTADO*\n\n> La solicitud tardó demasiado. ¡Inténtalo de nuevo!')
        } else {
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }
