const pluginConfig = {
    name: 'cheuqeocompatible',
    alias: ['compatibilidad', 'pareja', 'match'],
    category: 'cek',
    description: 'Verifica la compatibilidad entre dos personas',
    usage: '.compatible <nombre1> & <nombre2>',
    example: '.compatible Juan & Ana',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const input = m.text?.split(m.command)[1]?.trim() || ''
    const parts = input.split(/[&,]/).map(s => s.trim()).filter(s => s)
    
    if (parts.length < 2) {
        return m.reply(`💕 *ᴄᴇᴋ ᴊᴏᴅᴏʜ (Compatibilidad)*\n\n> ¡Ingresá 2 nombres!\n\n> Ejemplo: ${m.prefix}cekjodoh Juan & Ana`)
    }
    
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
                    
    let desc = ''
    if (percent >= 90) {
        desc = '¡Son tal para cual! ¡Vayan reservando el salón! 💍'
    } else if (percent >= 70) {
        desc = '¡Muy compatibles! 💕'
    } else if (percent >= 50) {
        desc = 'Zafan bastante bien~ 😊'
    } else if (percent >= 30) {
        desc = 'Mmm, les va a hacer falta remarla un poco más 🤔'
    } else {
        desc = '¿Y si prueban con otra persona? 😅'
    }
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de compatibilidad es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés chequear la compatibilidad de @${mentioned.split('@')[0]}? 
    
Su nivel de compatibilidad es del *${percent}%*
\`\`\`${desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

export { pluginConfig as config, handler }
