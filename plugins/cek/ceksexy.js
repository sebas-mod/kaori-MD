const pluginConfig = {
    name: 'ceksexy',
    alias: ['sexy', 'hot'],
    category: 'cek',
    description: 'Comprueba qué tan sexy eres',
    usage: '.ceksexy <nombre>',
    example: '.ceksexy Budi',
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
        desc = '¡DEMASIADO SEXY! 🔥🔥🔥'
    } else if (percent >= 70) {
        desc = '¡Muy hot! 😏'
    } else if (percent >= 50) {
        desc = 'Bastante tentador~ 😊'
    } else if (percent >= 30) {
        desc = 'Normalito, la verdad 🙂'
    } else {
        desc = 'Quizás eres más cute que sexy 😅'
    }

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de sexapil es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar qué tan sexy es @${mentioned.split('@')[0]}? 
    
Su nivel de sexapil es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
