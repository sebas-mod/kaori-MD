const pluginConfig = {
    name: 'ceksocmed',
    alias: ['redes', 'sosmed'],
    category: 'cek',
    description: 'Comprueba tu nivel de adicción a las redes sociales',
    usage: '.ceksocmed <nombre>',
    example: '.ceksocmed Budi',
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
    if (percent >= 90) desc = '¡Adicción severa! ¡Necesitas un detox! 📱💀'
    else if (percent >= 70) desc = 'Haciendo scroll sin parar~ 📲'
    else if (percent >= 50) desc = 'Uso normal 👍'
    else if (percent >= 30) desc = 'Bastante saludable 🌿'
    else desc = '¡Maestro del detox digital! 🧘'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de adicción a las redes es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de adicción de @${mentioned.split('@')[0]}? 
    
Su nivel de adicción es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
