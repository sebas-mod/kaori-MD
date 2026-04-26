const pluginConfig = {
    name: 'cekpsikopat',
    alias: ['psicopata', 'psycho'],
    category: 'cek',
    description: 'Comprueba qué tan psicópata eres',
    usage: '.cekpsikopat <nombre>',
    example: '.cekpsikopat Budi',
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
        desc = '¡PSICÓPATA AGUDO! ¡Aléjense! 😈'
    } else if (percent >= 70) {
        desc = 'Tengan cuidado con esta persona 👀'
    } else if (percent >= 50) {
        desc = 'Tiene un lado oscuro 🌑'
    } else if (percent >= 30) {
        desc = 'Un poco misterioso 🤔'
    } else {
        desc = 'Normal y de buen corazón 😇'
    }

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de psicopatía es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de psicopatía de @${mentioned.split('@')[0]}? 
    
Su nivel de psicopatía es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
