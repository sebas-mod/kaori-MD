const pluginConfig = {
    name: 'facha',
    alias: ['facha', 'fachero', 'handsome'],
    category: 'cek',
    description: 'Verifica qué tan fachero sos',
    usage: '.facha <nombre/tag>',
    example: '.facha @usuario',
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
        desc = '¡Facha nivel máximo! 😍🔥'
    } else if (percent >= 70) {
        desc = '¡Re fachero! 😎'
    } else if (percent >= 50) {
        desc = 'Zafás bastante bien~ 👍'
    } else if (percent >= 30) {
        desc = 'Un tipo normalito 😅'
    } else {
        desc = '¿Será que tenés belleza interior? 🤭'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de facha es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan fachero es @${mentioned.split('@')[0]}? 
    
Su nivel de facha es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
