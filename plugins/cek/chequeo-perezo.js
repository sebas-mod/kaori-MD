const pluginConfig = {
    name: 'chequeperezo',
    alias: ['pajeroso', 'pereza', 'flojera', 'lazy'],
    category: 'cek',
    description: 'Verifica qué tan vago/a sos',
    usage: '.chequeperezo <nombre>',
    example: '.chequeperezo @usuario',
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
        desc = '¡SÚPER VAGO! ¡El rey de la cama! 🛏️'
    } else if (percent >= 70) {
        desc = '¡Re flojo! 😴'
    } else if (percent >= 50) {
        desc = 'Bastante perezoso 🥱'
    } else if (percent >= 30) {
        desc = 'Un poquito de flojera nada más 😊'
    } else {
        desc = '¡Re laburante y activo! 💪'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de pereza es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear qué tan vago es @${mentioned.split('@')[0]}? 
    
Su nivel de pereza es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
