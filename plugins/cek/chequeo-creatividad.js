const pluginConfig = {
    name: 'chequeocreatividad',
    alias: ['creativo', 'creatividad', 'kreatif'],
    category: 'cek',
    description: 'Verifica qué tan creativo sos',
    usage: '.chequeo creatividad <nombre/tag>',
    example: '.chequeo creatividad @usuario',
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
    if (percent >= 90) desc = '¡SUPER CREATIVO! ¡Un verdadero artista! 🎨✨'
    else if (percent >= 70) desc = '¡Tenés una imaginación increíble! 💡'
    else if (percent >= 50) desc = 'Bastante creativo 😊'
    else if (percent >= 30) desc = 'Lo normal, nada del otro mundo 🤔'
    else desc = 'Te falta un poco de imaginación 😅'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de creatividad es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan creativo es @${mentioned.split('@')[0]}? 
    
Su nivel de creatividad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
