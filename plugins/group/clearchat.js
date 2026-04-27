import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: ['clearchat', 'cc', 'limpiarchat', 'borrarchat', 'delchat'],
    alias: [],
    category: 'group',
    description: 'Limpia el historial de chat del bot en el grupo',
    usage: '.clearchat',
    example: '.clearchat',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    m.react('🗑️')
    
    try {
        const now = Math.floor(Date.now() / 1000)
        
        await sock.chatModify({ 
            delete: true, 
            lastMessages: [{ 
                key: m.key, 
                messageTimestamp: m.messageTimestamp || now
            }] 
        }, m.chat)
        
        await m.reply(`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\n> El historial del grupo ha sido vaciado por @${m.sender.split('@')[0]}`, { mentions: [m.sender] })
        
    } catch (error) {
        try {
            await sock.chatModify({ 
                clear: { 
                    messages: [{ 
                        id: m.key.id, 
                        fromMe: m.key.fromMe,
                        timestamp: Math.floor(Date.now() / 1000)
                    }] 
                } 
            }, m.chat)
            
            await m.reply(`✅ *ᴄʜᴀᴛ ʟɪᴍᴘɪᴀᴅᴏ*\n\n> Se ha vaciado el historial de mensajes en el bot por @${m.sender.split('@')[0]}.\n> Puedes verificarlo en el chat del bot.`, { mentions: [m.sender] })
        } catch (e) {
            m.react('☢')
            m.reply(te(m.prefix, m.command, m.pushName))
        }
    }
}

export { pluginConfig as config, handler }
