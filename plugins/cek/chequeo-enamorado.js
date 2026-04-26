const pluginConfig = {
    name: 'chequeoenamorado',
    alias: ['pollerudo', 'enamorado', 'bucin'],
    category: 'cek',
    description: 'Verifica qué tan pollerudo/enamorado sos',
    usage: '.chequeo enamorado <nombre/tag>',
    example: '.chequeo enamorado @usuario',
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
        desc = '¡POLLERUDO TOTAL! Ya no tenés salvación 😭💔'
    } else if (percent >= 70) {
        desc = 'Estás re enamorado, bajá un cambio~ 🥺'
    } else if (percent >= 50) {
        desc = 'Bastante pollerudo 💕'
    } else if (percent >= 30) {
        desc = 'Un poquito enamorado 😊'
    } else {
        desc = 'Estás tranqui, no sos pollerudo 😎'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de pollerudez es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan pollerudo es @${mentioned.split('@')[0]}? 
    
Su nivel de pollerudez es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
