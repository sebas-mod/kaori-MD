const pluginConfig = {
    name: 'ceksabar',
    alias: ['paciencia', 'sabar'],
    category: 'cek',
    description: 'Comprueba tu nivel de paciencia',
    usage: '.ceksabar <nombre>',
    example: '.ceksabar Budi',
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
    if (percent >= 90) desc = '¡Paciencia nivel de un dios! Maestro Zen~ 🧘'
    else if (percent >= 70) desc = '¡Muy paciente! Admirable 👏'
    else if (percent >= 50) desc = 'Bastante paciente 😊'
    else if (percent >= 30) desc = 'A veces te gana la emoción 😅'
    else desc = 'Te enojas con facilidad... 😤'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de paciencia es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de paciencia de @${mentioned.split('@')[0]}? 
    
Su nivel de paciencia es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
