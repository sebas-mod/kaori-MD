import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'oh-no',
    alias: ['ohno', 'ohnomeme', 'ayno'],
    category: 'canvas',
    description: 'Crea el meme de "Oh No"',
    usage: '.oh-no <texto>',
    example: '.oh-no Me olvidé de hacer la tarea',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let text = m.text?.trim()
    
    if (!text && m.quoted?.text) {
        text = m.quoted.text.trim()
    }
    
    if (!text) {
        return m.reply(
            `😱 *ᴏʜ ɴᴏ ᴍᴇᴍᴇ*\n\n` +
            `> Ingresa un texto para el meme\n\n` +
            `> Ejemplo: \`${m.prefix}oh-no Me olvidé de guardar los cambios\``
        )
    }
    
    const apikey = config.APIkey?.lolhuman
    if (!apikey) {
        return m.reply(`❌ ¡La API key de lolhuman no está configurada!`)
    }
    
    m.react('🕕')
    
    try {
        await sock.sendMedia(m.chat, `https://api.lolhuman.xyz/api/creator/ohno?apikey=${apikey}&text=${encodeURIComponent(text)}`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
