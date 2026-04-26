const pluginConfig = {
    name: 'cekumur',
    alias: ['edad', 'age'],
    category: 'cek',
    description: 'Comprueba tu edad mental',
    usage: '.cekumur <nombre>',
    example: '.cekumur Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const percent = Math.floor(Math.random() * 80) + 5
    const mentioned = m.mentionedJid[0] || m.sender

    let desc = ''
    if (percent >= 60) desc = '¡Sabio como un anciano! 🧓'
    else if (percent >= 40) desc = 'Adulto y maduro~ 🧑'
    else if (percent >= 20) desc = '¡Alma joven! 🧒'
    else desc = 'Todavía como un niño pequeño~ 👶'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de edad mental es *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de edad mental de @${mentioned.split('@')[0]}? 
    
Su nivel de edad mental es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
