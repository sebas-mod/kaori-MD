const pluginConfig = {
    name: 'chequehambre',
    alias: ['hambre', 'hambriento', 'hungry', 'tengohambre'],
    category: 'cek',
    description: 'Verifica qué tan hambriento/a sos',
    usage: '.chequehambre <nombre>',
    example: '.chequehambre @usuario',
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
    if (percent >= 90) desc = '¡TE MORÍS DE HAMBRE! ¡Andá a comer ya! 🍔🍕🍜'
    else if (percent >= 70) desc = 'Te ruge la panza~ 😋'
    else if (percent >= 50) desc = 'Estás para picar algo 🍿'
    else if (percent >= 30) desc = 'Todavía estás lleno 😊'
    else desc = '¡Estás explotado de comida! 🤰'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de hambre es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear el nivel de hambre de @${mentioned.split('@')[0]}? 
    
Su nivel de hambre es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
