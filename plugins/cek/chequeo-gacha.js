const pluginConfig = {
    name: 'chequegacha',
    alias: ['suerte', 'gacha', 'luck', 'hoki'],
    category: 'cek',
    description: 'Verifica tu suerte para el gacha',
    usage: '.gacha <nombre/tag>',
    example: '.gacha @usuario',
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
    if (percent >= 90) desc = '¡SUERTE INCREÍBLE! ¡SSR GARANTIZADO! ✨💎'
    else if (percent >= 70) desc = '¡Qué suerte! ¡Seguro te toca algo SR o superior! 🍀'
    else if (percent >= 50) desc = 'Tenés un poquito de suerte 😊'
    else if (percent >= 30) desc = 'Mmm... ¡rezá un poco más fuerte! 🙏'
    else desc = '¡QUÉ MALA SUERTE! ¡Mejor ni tires hoy! 💔'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de suerte en el gacha es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tanta suerte tiene @${mentioned.split('@')[0]}? 
    
Su nivel de suerte en el gacha es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
