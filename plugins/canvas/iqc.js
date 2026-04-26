import axios from 'axios'
import te from '../../src/lib/ourin-error.js'
import moment from 'moment-timezone'

const pluginConfig = {
    name: 'iqc',
    alias: ['iqchat', 'iphonechat', 'chatig'],
    category: 'canvas',
    description: 'Crea una imagen de chat con estilo de iPhone',
    usage: '.iqc <texto>',
    example: '.iqc Hola, ¿cómo estás?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`📱 *ɪǫᴄ ᴄʜᴀᴛ*\n\n> Ingresa un texto para el chat\n\n\`Ejemplo: ${m.prefix}iqc Hola, ¿cómo estás?\``)
    }
    
    m.react('🕕')
    
    try {
        const now = new Date()
        // Ajustado a la zona horaria de Buenos Aires
        const time = moment(now).tz("America/Argentina/Buenos_Aires").format("HH:mm")

        await sock.sendMedia(m.chat, `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(time)}&messageText=${encodeURIComponent(text)}`, null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
