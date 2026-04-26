import axios from 'axios'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'balogo',
    alias: ['bluearchivelogo', 'ba', 'logoba'],
    category: 'canvas',
    description: 'Crea un logo al estilo de Blue Archive',
    usage: '.balogo <textoI> & <textoD>',
    example: '.balogo Blue & Archive',
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
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
    
    if (parts.length < 2) {
        return m.reply(`🎮 *ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ʟᴏɢᴏ*\n\n> Ingresa 2 textos para el logo\n\n> Ejemplo: ${m.prefix}balogo Blue & Archive`)
    }
    
    const textL = parts[0]
    const textR = parts[1]
    
    m.react('🕕')
    
    try {
        const apiUrl = `https://api.nexray.web.id/maker/balogo?text=${encodeURIComponent(textL)} ${encodeURIComponent(textR)}`
        const response = await f(apiUrl, 'arrayBuffer')
        
        await sock.sendMedia(m.chat, Buffer.from(response), null, m, {
            type: 'image',
        })
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
