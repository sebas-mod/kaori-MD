const pluginConfig = {
    name: 'chequeprocras',
    alias: ['procrastinador', 'vueltas', 'nunda', 'luego'],
    category: 'cek',
    description: 'Verifica qué tanto dejás las cosas para después',
    usage: '.chequeprocras <nombre>',
    example: '.chequeprocras @usuario',
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
    if (percent >= 90) desc = '¿Fecha límite? Mañana lo hago... mejor pasado~ 😴'
    else if (percent >= 70) desc = '¡Maestro de la procrastinación! 🦥'
    else if (percent >= 50) desc = 'A veces das vueltas, a veces le metés pila 😅'
    else if (percent >= 30) desc = '¡Bastante productivo! 💪'
    else desc = '¡Disciplina de acero! ¡Impresionante! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de procrastinación es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tanto posterga las cosas @${mentioned.split('@')[0]}? 
    
Su nivel de procrastinación es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
