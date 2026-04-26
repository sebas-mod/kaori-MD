const pluginConfig = {
    name: 'chequeosuerte',
    alias: ['suerte', 'suertudo', 'lucky'],
    category: 'cek',
    description: 'Verifica qué tanta suerte tenés',
    usage: '.suerte <nombre/tag>',
    example: '.shuerte @usuario',
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
        desc = '¡SUERTE DE DIOSES! ¡Si jugás al gacha ganás seguro! 🍀✨'
    } else if (percent >= 70) {
        desc = '¡Estás re suertudo! 🎰'
    } else if (percent >= 50) {
        desc = 'Bastante suerte 🍀'
    } else if (percent >= 30) {
        desc = 'Un poquito de suerte 😊'
    } else {
        desc = 'Paciencia, hoy estás con la mala 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de suerte es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tanta suerte tiene @${mentioned.split('@')[0]}? 
    
Su nivel de suerte es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
