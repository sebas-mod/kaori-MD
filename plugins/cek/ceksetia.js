const pluginConfig = {
    name: 'ceksetia',
    alias: ['fiel', 'leal', 'setia'],
    category: 'cek',
    description: 'Comprueba tu nivel de fidelidad',
    usage: '.ceksetia <nombre>',
    example: '.ceksetia Budi',
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
    if (percent >= 90) desc = '¡Fiel hasta la muerte! 💍💕'
    else if (percent >= 70) desc = '¡Muy fiel y sincero! ❤️'
    else if (percent >= 50) desc = 'Bastante fiel~ 😊'
    else if (percent >= 30) desc = 'Hmm... a veces dudas 😅'
    else desc = '¿Modo Playboy/Playgirl activado? 😏'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de fidelidad es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de fidelidad de @${mentioned.split('@')[0]}? 
    
Su nivel de fidelidad es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
