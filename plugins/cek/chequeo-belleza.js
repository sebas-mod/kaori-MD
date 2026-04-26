const pluginConfig = {
    name: 'chequeobelleza',
    alias: ['linda', 'belleza', 'beautiful'],
    category: 'cek',
    description: 'Verifica qué tan linda sos',
    usage: '.chequeo belleza <nombre/tag>',
    example: '.chequeo de belleza @usuario',
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
        desc = '¡Hermosa, parecés un ángel! 👸✨'
    } else if (percent >= 70) {
        desc = '¡Sos muy linda! 💕'
    } else if (percent >= 50) {
        desc = 'Muy dulce y bella~ 🌸'
    } else if (percent >= 30) {
        desc = 'Bastante linda 😊'
    } else {
        desc = '¡Igual sos linda! 💖'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de belleza es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan linda es @${mentioned.split('@')[0]}? 
    
Su nivel de belleza es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
