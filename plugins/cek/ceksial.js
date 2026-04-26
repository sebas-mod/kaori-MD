const pluginConfig = {
    name: 'ceksial',
    alias: ['mala-suerte', 'sial', 'salado'],
    category: 'cek',
    description: 'Comprueba qué tan mala suerte tienes',
    usage: '.ceksial <nombre>',
    example: '.ceksial Budi',
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
        desc = '¡QUÉ MALA SUERTE! ¡Mejor quédate en casa! 😭'
    } else if (percent >= 70) {
        desc = 'Estás de mala racha hoy~ 😢'
    } else if (percent >= 50) {
        desc = 'Bastante salado 😓'
    } else if (percent >= 30) {
        desc = 'Un poco de mala suerte 😕'
    } else {
        desc = '¡Nada de mala suerte, hoy tienes estrella! 🍀'
    }

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de mala suerte es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar el nivel de mala suerte de @${mentioned.split('@')[0]}? 
    
Su nivel de mala suerte es del *${percent}%*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
