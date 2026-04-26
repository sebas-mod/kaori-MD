import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'meme3',
    alias: ['3panel', 'meme-triple'],
    category: 'canvas',
    description: 'Crea un meme de 3 paneles con texto personalizado',
    usage: '.meme3 <texto1>|<texto2>|<texto3>',
    example: '.meme3 ¿Qué pasó ayer?|No sé, estaba durmiendo|Pero si te vi en la fiesta',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const input = m.text?.trim() || ''
    const parts = input.split('|').map(s => s.trim())
    
    if (parts.length < 3 || !parts[0] || !parts[1] || !parts[2]) {
        return m.reply(
            `🎭 *ᴍᴇᴍᴇ 3 ᴘᴀɴᴇʟ*\n\n` +
            `> ¡Ingresa 3 textos separados por el símbolo | !\n\n` +
            `> Ejemplo: \`${m.prefix}meme3 Texto1|Texto2|Texto3\``
        )
    }
    
    const text1 = parts[0]
    const text2 = parts[1]
    const text3 = parts[2]
    
    const apikey = config.APIkey?.lolhuman
    if (!apikey) {
        return m.reply(`❌ ¡La API key de lolhuman no está configurada!`)
    }
    
    m.react('🕕')
    
    try {
        await sock.sendMedia(m.chat, `https://api.lolhuman.xyz/api/meme6?apikey=${apikey}&text1=${encodeURIComponent(text1)}&text2=${encodeURIComponent(text2)}&text3=${encodeURIComponent(text3)}`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
