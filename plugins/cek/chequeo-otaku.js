const pluginConfig = {
    name: 'chequeotaku',
    alias: ['otaku', 'animelover', 'weeb'],
    category: 'cek',
    description: 'Verifica qué tan otaku sos',
    usage: '.chequeotaku <nombre>',
    example: '.chequeotaku @usuario',
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
    if (percent >= 90) desc = '¡SUGOI! ¡Sos un verdadero otaku desu! 🎌✨'
    else if (percent >= 70) desc = 'Nivel de weeb bastante alto~ 🇯🇵'
    else if (percent >= 50) desc = 'Disfrutás del anime casualmente 📺'
    else if (percent >= 30) desc = 'Conocés un par de animes nada más 🤔'
    else desc = '¡Normie detectado! 😂'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de otaku es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan otaku es @${mentioned.split('@')[0]}? 
    
Su nivel de otaku es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
