const pluginConfig = {
    name: 'chequeointrovertido',
    alias: ['introvertido', 'asocial', 'introvert'],
    category: 'cek',
    description: 'Verifica qué tan introvertido sos',
    usage: '.introvertido <nombre/tag>',
    example: '.introvertido @usuario',
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
    if (percent >= 90) desc = '¡Tu casa es tu paraíso! No salgas nunca~ 🏠'
    else if (percent >= 70) desc = 'Batería social muy limitada 🔋'
    else if (percent >= 50) desc = 'Ambivertido, ¡el equilibrio justo! ⚖️'
    else if (percent >= 30) desc = 'Bastante sociable, un alma libre 🦋'
    else desc = '¡Modo Extrovertido ON! ¡Fiesta en todos lados! 🎉'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de introversión es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan introvertido es @${mentioned.split('@')[0]}? 
    
Su nivel de introversión es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
