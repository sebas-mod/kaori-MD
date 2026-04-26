const pluginConfig = {
    name: 'chequepoder',
    alias: ['poder', 'overpower', 'op', 'fuerte'],
    category: 'cek',
    description: 'Verifica qué tan poderoso/a sos',
    usage: '.chequepoder <nombre>',
    example: '.chequepoder @usuario',
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
    if (percent >= 90) desc = '¡ESTÁS RE ROTO! ¡SOS UNA LEYENDA! 👑🔥'
    else if (percent >= 70) desc = '¡Muy fuerte, nivel Dios! 💪'
    else if (percent >= 50) desc = 'Bastante potente~ 😎'
    else if (percent >= 30) desc = 'Normalito, nada del otro mundo 🤔'
    else desc = 'Todavía te falta entrenamiento 📝'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de poder es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear el nivel de poder de @${mentioned.split('@')[0]}? 
    
Su nivel de poder es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
