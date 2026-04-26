const pluginConfig = {
    name: 'chequesueño',
    alias: ['sueño', 'dormido', 'sleepy', 'ngantuk'],
    category: 'cek',
    description: 'Verifica qué tanto sueño tenés',
    usage: '.chequesueño <nombre>',
    example: '.chequesueño @usuario',
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
    if (percent >= 90) desc = '¡ZZZZZ... Andá a dormir ya! 😴💤'
    else if (percent >= 70) desc = 'Tenés los ojos en 5 watts~ 😪'
    else if (percent >= 50) desc = 'Un poco de sueño tenés 🥱'
    else if (percent >= 30) desc = '¡Todavía estás fresco! ☕'
    else desc = '¡Estás re despierto! ¿Insomnio? 👀'
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de sueño es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tanto sueño tiene @${mentioned.split('@')[0]}? 
    
Su nivel de sueño es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
