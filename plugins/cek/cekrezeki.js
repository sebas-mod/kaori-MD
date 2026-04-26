const pluginConfig = {
    name: 'cekrezeki',
    alias: ['fortuna', 'suerte'],
    category: 'cek',
    description: 'Comprueba tu nivel de fortuna hoy',
    usage: '.cekrezeki <nombre>',
    example: '.cekrezeki Budi',
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
    if (percent >= 90) desc = '¡Fortuna abundante! ¡Jackpot! 💰🎉'
    else if (percent >= 70) desc = 'La suerte fluye bien hoy~ 💵'
    else if (percent >= 50) desc = 'Fortuna suficiente, ¡sé agradecido! 🙏'
    else if (percent >= 30) desc = 'Fortuna algo ajustada 😅'
    else desc = 'Ten paciencia, la suerte ya llegará~ 🫂'

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de fortuna es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de fortuna de @${mentioned.split('@')[0]}? 
    
Su nivel de fortuna es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
