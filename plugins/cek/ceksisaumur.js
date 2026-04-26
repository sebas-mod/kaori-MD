const pluginConfig = {
    name: 'ceksisaumur',
    alias: ['vida-restante', 'cuanto-me-queda'],
    category: 'cek',
    description: 'Comprueba cuánto tiempo de vida te queda',
    usage: '.ceksisaumur <nombre>',
    example: '.ceksisaumur Budi',
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

    const tahun = Math.floor(Math.random() * 80) + 20
    const bulan = Math.floor(Math.random() * 12)
    const hari = Math.floor(Math.random() * 30)

    let desc = ''
    if (tahun > 80) {
        desc = '¡Vas a vivir muchísimos años! 🎉'
    } else if (tahun > 60) {
        desc = '¡Es una vida bastante larga! ✨'
    } else if (tahun > 40) {
        desc = 'Está bastante bien 😊'
    } else {
        desc = '¡Cuida mucho tu salud! 🙏'
    }

    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tiempo de vida restante es de *${tahun} Años, ${bulan} Meses y ${hari} Días*
\`\`\`${desc}\`\`\`` : `¿Quieres comprobar cuánto le queda de vida a @${mentioned.split('@')[0]}? 
    
Su tiempo de vida restante es de *${tahun} Años, ${bulan} Meses y ${hari} Días*
\`\`\`${desc}\`\`\``

    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
