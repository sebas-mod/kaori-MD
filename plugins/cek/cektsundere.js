const pluginConfig = {
    name: 'cektsundere',
    alias: ['tsundere'],
    category: 'cek',
    description: 'Comprueba tu nivel de tsundere',
    usage: '.cektsundere <nombre>',
    example: '.cektsundere Budi',
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
    if (percent >= 90) desc = '¡BAKA! ¡N-NO ES QUE ME GUSTES NI NADA! 😤💢'
    else if (percent >= 70) desc = '¡Hmph! ¡No te confundas, eh! 😳'
    else if (percent >= 50) desc = 'B-bueno, como quieras... 👉👈'
    else if (percent >= 30) desc = 'Un poquito tsundere~ 😊'
    else desc = 'Nada de tsundere, eres muy honesto/a 💕'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de tsundere es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de tsundere de @${mentioned.split('@')[0]}? 
    
Su nivel de tsundere es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
