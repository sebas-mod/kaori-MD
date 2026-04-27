import config from '../../config.js'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'
const soundCommands = ['sound']
for (let i = 1; i <= 250; i++) {
    soundCommands.push(`sound${i}`)
}

const pluginConfig = {
    name: soundCommands,
    alias: [],
    category: 'media',
    description: 'Enviar efectos de sonido (sound1 - sound250)',
    usage: '.sound1 o .sound250',
    example: '.sound1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const command = m.command?.toLowerCase()
    
    if (command === 'sound' || !command.startsWith('sound')) {
        return m.reply(
            `🔊 *EFECTOS DE SONIDO*\n\n` +
            `> Disponible: sound1 - sound250\n` +
            `> Ejemplo: \`${m.prefix}sound1\``
        )
    }
    
    const num = parseInt(command.replace('sound', ''))
    if (isNaN(num) || num < 1 || num > 250) {
        return m.reply(`❌ Selección no válida. Usa desde sound1 hasta sound250.`)
    }
    
    m.react('🕕')
    try {
        const link = `https://raw.githubusercontent.com/Leoo7z/Music/main/${command}.mp3`
        
        await sock.sendMedia(m.chat, link, null, m, {
            type: 'audio',
            mimetype: 'audio/mpeg',
            ptt: false
        })
        
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
