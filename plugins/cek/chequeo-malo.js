const pluginConfig = {
    name: 'chequeomalo',
    alias: ['malo', 'malvado', 'evil', 'maldad'],
    category: 'cek',
    description: 'Verifica qué tan malo/a sos',
    usage: '.malo <nombre/tag>',
    example: '.malo @usuario',
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
        desc = '¡NIVEL VILLANO SUPREMO! 😈👿'
    } else if (percent >= 70) {
        desc = '¡Sos re malo/a! 💀'
    } else if (percent >= 50) {
        desc = 'Bastante malvado 😏'
    } else if (percent >= 30) {
        desc = 'Un poquito travieso 😊'
    } else {
        desc = '¡Sos un ángel, nada de maldad! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de maldad es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan malo es @${mentioned.split('@')[0]}? 
    
Su nivel de maldad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
