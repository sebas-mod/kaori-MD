import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'totag',
    alias: ['tagall2', 'mentionall', 'citartodos', 'reenviartag'],
    category: 'group',
    description: 'Menciona a todos los miembros reenviando un mensaje',
    usage: '.totag (responde a un mensaje)',
    example: '.totag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    if (!m.quoted) {
        return m.reply(
            `📢 *ᴛᴏᴛᴀɢ*\n\n` +
            `> Responde al mensaje que deseas reenviar a todos los miembros.\n\n` +
            `> Ejemplo: Responde a un mensaje y escribe \`${m.prefix}totag\``
        )
    }
    
    m.react('📢')
    
    try {
        const participants = m.groupMembers || []
        
        if (!participants || participants.length === 0) {
            return m.reply(`❌ Error al obtener la lista de miembros del grupo.`)
        }
        
        const users = participants
            .map(u => u.id || u.jid || u)
            .filter(v => v && v !== sock.user?.jid && v !== sock.user?.id)
        
        await sock.sendMessage(m.chat, {
            forward: m.quoted.fakeObj || m.quoted,
            mentions: users
        })
        
        m.react('✅')
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
