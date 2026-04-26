import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'preguntauztad',
    alias: ['pakustad', 'tanyaustad', 'consejos'],
    category: 'fun',
    description: 'Hazle una pregunta al Ustad (genera imagen)',
    usage: '.preguntauztad <pregunta>',
    example: '.preguntauztad ¿por qué soy tan guapo?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.text || m.quoted?.text
    
    if (!text) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}preguntauztad <pregunta>\`\n\n` +
            `> Ejemplo: \`${m.prefix}preguntauztad ¿por qué no tengo novia?\``
        )
    }
    
    await m.react('🕕')
    
    try {
        const apiUrl = `https://api.cuki.biz.id/api/canvas/ustadz?apikey=cuki-x&text=${encodeURIComponent(text)}`
        const { results } = await f(apiUrl)
        
        await sock.sendMedia(m.chat, results.url, text, m, {
            type: 'image'
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
