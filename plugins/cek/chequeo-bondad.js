const pluginConfig = {
    name: 'chequeobondad',
    alias: ['bueno', 'bondad', 'kind'],
    category: 'cek',
    description: 'Verifica qué tan buena persona eres',
    usage: '.bondad <nombre/tag>',
    example: '.bondad @usuario',
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
        desc = '¡Increíble! ¡Eres la persona más buena de este mundo! 😇✨'
    } else if (percent >= 70) {
        desc = '¡De buen corazón y para nada presumido! 💝'
    } else if (percent >= 50) {
        desc = 'Bastante bien 😊'
    } else if (percent >= 30) {
        desc = 'Un poquito bueno 🙂'
    } else {
        desc = 'Mmm, ¿será hora de una introspección? 🤔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de bondad es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear el nivel de bondad de @${mentioned.split('@')[0]}? 
    
Su nivel de bondad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
