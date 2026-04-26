const pluginConfig = {
    name: 'chequebot',
    alias: ['noob', 'manco', 'peton'],
    category: 'cek',
    description: 'Verifica qué tan bot/manco sos',
    usage: '.chequeo bot <nombre/tag>',
    example: '.chequeo bot @usuario',
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
    if (percent >= 90) desc = '¡RE MANCO! ¡NOOB DETECTADO! 🤡'
    else if (percent >= 70) desc = 'Todavía sos medio petón~ 😅'
    else if (percent >= 50) desc = 'Zafa, pero le falta 🤔'
    else if (percent >= 30) desc = '¡Bastante pro! 💪'
    else desc = '¡PRO PLAYER! ¡Gente de nivel! 🏆'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de manquez es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan noob es @${mentioned.split('@')[0]}? 
    
Su nivel de manquez es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
