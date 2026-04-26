const pluginConfig = {
    name: 'gamer',
    alias: ['gamer', 'progamer', 'pro'],
    category: 'cek',
    description: 'Verifica qué tan pro gamer sos',
    usage: '.gamer <nombre/tag>',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡PRO PLAYER! ¡Nivel Esports! 🏆'
    } else if (percent >= 70) {
        desc = '¡Sos un viciado total! 🎮'
    } else if (percent >= 50) {
        desc = 'Bastante pro 👍'
    } else if (percent >= 30) {
        desc = 'Todavía sos medio noob 😅'
    } else {
        desc = 'Mejor dedicate a los juegos de cocina 🍳'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de gamer es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan gamer es @${mentioned.split('@')[0]}? 
    
Su nivel de gamer es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
