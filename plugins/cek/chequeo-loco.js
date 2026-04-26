const pluginConfig = {
    name: 'chequeoloco',
    alias: ['loco', 'locura', 'crazy'],
    category: 'cek',
    description: 'Verifica qué tan loco/a estás',
    usage: '.loco <nombre/tag>',
    example: '.loco @usuario',
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
    if (percent >= 90) {
        desc = '¡ESTÁS RE LOCO! ¡Directo al psiquiátrico! 🤪'
    } else if (percent >= 70) {
        desc = 'Te falta un tornillo 😵'
    } else if (percent >= 50) {
        desc = 'Bastante cuerdo todavía 😅'
    } else if (percent >= 30) {
        desc = 'Normalito 🙂'
    } else {
        desc = '¡Súper cuerdo! Un ángel 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de locura es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan loco está @${mentioned.split('@')[0]}? 
    
Su nivel de locura es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
