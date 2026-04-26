const pluginConfig = {
    name: 'chequetacaño',
    alias: ['tacaño', 'rata', 'amarrado', 'pelit'],
    category: 'cek',
    description: 'Verifica qué tan tacaño/a sos',
    usage: '.chequetacaño <nombre>',
    example: '.chequetacaño @usuario',
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
        desc = '¡SÚPER TACAÑO! ¡No soltás un peso ni loco! 💸'
    } else if (percent >= 70) {
        desc = '¡Re rata! 🙊'
    } else if (percent >= 50) {
        desc = 'Bastante tacaño 😅'
    } else if (percent >= 30) {
        desc = 'Un poco ahorrativo 😊'
    } else {
        desc = '¡Sos re generoso! 🎁'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de tacaño es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan tacaño es @${mentioned.split('@')[0]}? 
    
Su nivel de tacaño es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
