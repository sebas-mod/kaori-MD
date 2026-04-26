const pluginConfig = {
    name: 'aburrido',
    alias: ['aburrido', 'alpedo', 'bored'],
    category: 'cek',
    description: 'Verifica qué tan al pedo estás',
    usage: '.aburrido <nombre/tag>',
    example: '.aburrido @usuario',
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
    if (percent >= 90) desc = '¡NIVEL MÁXIMO DE ABURRIMIENTO! Estás re al pedo~ 🥱'
    else if (percent >= 70) desc = '¡Qué embole tenés! 😴'
    else if (percent >= 50) desc = 'Bastante al pedo 😅'
    else if (percent >= 30) desc = 'Un poquito ocupado 📝'
    else desc = '¡Re ocupado! ¡Qué productividad! 💼'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de aburrimiento es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan al pedo está @${mentioned.split('@')[0]}? 
    
Su nivel de aburrimiento es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
