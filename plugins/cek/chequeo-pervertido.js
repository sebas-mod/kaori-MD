const pluginConfig = {
    name: 'chequepervertido',
    alias: ['pajin', 'pervertido', 'pervert', 'hentai'],
    category: 'cek',
    description: 'Verifica qué tan pervertido/a sos',
    usage: '.chequepervertido <nombre>',
    example: '.chequepervertido @usuario',
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
        desc = '¡PERVERTIDO AGUDO! ¡Andá a confesarte! 😳🔞'
    } else if (percent >= 70) {
        desc = '¡Re pervertido! 👀'
    } else if (percent >= 50) {
        desc = 'Bastante picante 😏'
    } else if (percent >= 30) {
        desc = 'Un poquito pervertido 🙈'
    } else {
        desc = '¡Puro y casto! 😇'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de pervertido es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear qué tan pervertido es @${mentioned.split('@')[0]}? 
    
Su nivel de pervertido es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
