const pluginConfig = {
    name: 'chequeosoltero',
    alias: ['soltero', 'soltería', 'single'],
    category: 'cek',
    description: 'Verifica qué tan soltero/a estás',
    usage: '.soltero <nombre/tag>',
    example: '.soltero @usuario',
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
    if (percent >= 90) desc = '¡Soltero de por vida! La soledad es felicidad~ 💔😎'
    else if (percent >= 70) desc = '¡Persona fuerte e independiente! 💪'
    else if (percent >= 50) desc = 'En modo "estamos hablando" 😍'
    else if (percent >= 30) desc = 'Parece que alguien te tiene ganas~ 👀'
    else desc = '¡Casi fuera del mercado! 💕'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de soltería es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan soltero está @${mentioned.split('@')[0]}? 
    
Su nivel de soltería es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
