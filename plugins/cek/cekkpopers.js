const pluginConfig = {
    name: 'chequekpop',
    alias: ['kpopers', 'kpop', 'stan'],
    category: 'cek',
    description: 'Verifica qué tan kpopers sos',
    usage: '.chequekpop <nombre>',
    example: '.chechequekpop @usuario',
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
    if (percent >= 90) desc = '¡Nivel ARMY/BLINK máximo! 💜💗'
    else if (percent >= 70) desc = '¡Sos re fan! Stan de pura cepa 🎤'
    else if (percent >= 50) desc = 'Oyente casual~ 🎵'
    else if (percent >= 30) desc = 'Conocés un par de temas nada más 😅'
    else desc = 'No sos kpopers 🤷'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de kpopers es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear el nivel de kpopers de @${mentioned.split('@')[0]}? 
    
Su nivel de kpopers es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
