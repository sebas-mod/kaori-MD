const pluginConfig = {
    name: 'cekkaya',
    alias: ['rico', 'riqueza', 'millonario', 'rich'],
    category: 'cek',
    description: 'Verifica qué tan rico/a sos',
    usage: '.millonario <nombre/tag>',
    example: '.millonario @usuario',
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
    let emoji = ''
    if (percent >= 90) {
        desc = '¡MULTIMILLONARIO! ¡Nivel Elon Musk! 💎'
        emoji = '👑'
    } else if (percent >= 70) {
        desc = '¡Tenés la billetera explotada! 💰'
        emoji = '💎'
    } else if (percent >= 50) {
        desc = 'Bastante bien, te sobra para los gustitos 💵'
        emoji = '💰'
    } else if (percent >= 30) {
        desc = 'Lo justo para llegar a fin de mes 😊'
        emoji = '💵'
    } else {
        desc = '¡A seguir ahorrando, que no queda otra! 🙏'
        emoji = '🪙'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de riqueza es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan rico es @${mentioned.split('@')[0]}? 
    
Su nivel de riqueza es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
