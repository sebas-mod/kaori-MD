const pluginConfig = {
    name: 'chequeo peso',
    alias: ['peso', 'pesocorporal', 'weight'],
    category: 'cek',
    description: 'Calcula un peso corporal aleatorio',
    usage: '.cehequeo peso <nombre/tag>',
    example: '.chequeo peso @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const berat = Math.floor(Math.random() * 60) + 40
    const mentioned = m.mentionedJid?.[0] || m.sender
    
    let desc = ''
    if (berat >= 90) {
        desc = '¡Qué presencia! 💪'
    } else if (berat >= 70) {
        desc = '¡Macizo y saludable! 😊'
    } else if (berat >= 55) {
        desc = '¡Estás en tu peso ideal! 👍'
    } else if (berat >= 45) {
        desc = 'Bastante esbelto/a~ 🌸'
    } else {
        desc = '¡Estás muy flaquito/a, comé un poco más! 🍔'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu peso es de *${berat} kg*
\`\`\`${desc}\`\`\`` : `¿Querés saber cuánto pesa @${mentioned.split('@')[0]}? 
    
Su peso es de *${berat} kg*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
