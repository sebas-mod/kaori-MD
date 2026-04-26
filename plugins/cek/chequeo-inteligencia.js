const pluginConfig = {
    name: 'chequeinteligente',
    alias: ['inteligencia', 'iq', 'cerebro', 'smart'],
    category: 'cek',
    description: 'Verifica qué tan inteligente sos',
    usage: '.chequeinteligente <nombre>',
    example: '.chequeinteligente @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const mentioned = m.mentionedJid[0] || m.sender

    const iq = Math.floor(Math.random() * 100) + 70
    
    let desc = ''
    if (iq >= 150) {
        desc = '¡GENIO! ¡Nivel Einstein! 🧠✨'
    } else if (iq >= 130) {
        desc = '¡Muy inteligente! 🎓'
    } else if (iq >= 110) {
        desc = '¡Por encima del promedio! 👍'
    } else if (iq >= 90) {
        desc = 'Normal, promedio 😊'
    } else {
        desc = '¡A no aflojarle al estudio! 📚'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu inteligencia (IQ) es de *${iq}*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan inteligente es @${mentioned.split('@')[0]}? 
    
Su inteligencia (IQ) es de *${iq}*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
