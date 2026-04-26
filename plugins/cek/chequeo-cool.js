const pluginConfig = {
    name: 'cekkece',
    alias: ['onda', 'cool', 'estilo'],
    category: 'cek',
    description: 'Verifica qué tanta onda tenés',
    usage: '.cool <nombre/tag>',
    example: '.cool @usuario',
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
        desc = '¡TENÉS UNA ONDA TERRIBLE! 😎🔥'
    } else if (percent >= 70) {
        desc = '¡Mucha onda! ✨'
    } else if (percent >= 50) {
        desc = 'Bastante bien, tenés estilo~ 👍'
    } else if (percent >= 30) {
        desc = 'Un poquito de onda tenés 😊'
    } else {
        desc = 'Normal, ¡pero le ponés ganas! 🙂'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de onda es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tanta onda tiene @${mentioned.split('@')[0]}? 
    
Su nivel de onda es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
