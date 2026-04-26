const pluginConfig = {
    name: 'chequekarma',
    alias: ['karma', 'destino'],
    category: 'cek',
    description: 'Verifica tu nivel de karma actual',
    usage: '.karma <nombre/tag>',
    example: '.karma @usuario',
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
    if (percent >= 80) desc = '¡Buen karma! ¡El cielo te espera! ✨'
    else if (percent >= 60) desc = 'Bastante bien, ¡seguí así! 🙏'
    else if (percent >= 40) desc = 'Neutral, te vendría bien hacer un par de buenas acciones~ ⚖️'
    else if (percent >= 20) desc = '¡Ojo con el mal karma! Portate bien ⚠️'
    else desc = 'Uff... me parece que alguien necesita ir a confesarse 😱'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de karma es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear el nivel de karma de @${mentioned.split('@')[0]}? 
    
Su nivel de karma es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
