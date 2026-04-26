const pluginConfig = {
    name: 'chequeolindo',
    alias: ['tierno', 'lindo', 'cute'],
    category: 'cek',
    description: 'Verifica qué tan tierno/a sos',
    usage: '.lindo <nombre/tag>',
    example: '.lindo @usuario',
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
        desc = '¡RE TIERNO! ¡Kawaii~~! 🥺💕'
    } else if (percent >= 70) {
        desc = '¡Sos demasiado tierno/a! 😍'
    } else if (percent >= 50) {
        desc = 'Bastante tierno~ 🌸'
    } else if (percent >= 30) {
        desc = 'Tenés un toque tierno 😊'
    } else {
        desc = '¿Capaz sos más del estilo "cool" que tierno? 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de ternura es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan tierno es @${mentioned.split('@')[0]}? 
    
Su nivel de ternura es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
