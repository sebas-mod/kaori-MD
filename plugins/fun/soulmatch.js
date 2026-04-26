const pluginConfig = {
    name: 'almas',
    alias: ['soulmatch', 'compatibilidad', 'almasgemelas'],
    category: 'fun',
    description: 'Comprueba la compatibilidad de almas entre dos personas',
    usage: '.almas nombre1|nombre2',
    example: '.almas Raiden|Mei',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const ELEMENTS = ['Fuego 🔥', 'Agua 💧', 'Tierra 🌍', 'Aire 🌪️', 'Rayo ⚡', 'Hielo ❄️', 'Luz ✨', 'Sombra 🌑']
const ZODIAC = ['♈ Aries', '♉ Taurus', '♊ Gemini', '♋ Cancer', '♌ Leo', '♍ Virgo', 
               '♎ Libra', '♏ Scorpio', '♐ Sagittarius', '♑ Capricorn', '♒ Aquarius', '♓ Pisces']
const SOUL_TYPES = [
    "Líder Valiente", "Equilibrador Sabio", "Creador Expresivo", "Constructor Sólido", 
    "Aventurero Libre", "Protector Fiel", "Pensador Místico", "Conquistador Fuerte", "Humanitario Puro"
]

function generateSoulData(name, seed) {
    const nameVal = Array.from(name.toLowerCase()).reduce((a, c) => a + c.charCodeAt(0), 0)
    return {
        element: ELEMENTS[(nameVal + seed) % ELEMENTS.length],
        zodiac: ZODIAC[(nameVal + seed * 2) % ZODIAC.length],
        soulType: SOUL_TYPES[(nameVal + seed * 3) % SOUL_TYPES.length]
    }
}

function getMatchDescription(score) {
    if (score >= 90) return "💫 Destino Verdadero"
    if (score >= 80) return "✨ Armonía Perfecta"
    if (score >= 70) return "🌟 Conexión Fuerte"
    if (score >= 60) return "⭐ Buen Potencial"
    if (score >= 50) return "🌙 Requiere Esfuerzo"
    return "🌑 Desafío Difícil"
}

function getReading(score) {
    if (score >= 80) {
        return "Sus almas tienen una conexión muy especial y rara. El destino ha planeado este encuentro."
    } else if (score >= 60) {
        return "Hay una química fuerte entre ustedes. Sus diferencias son las que crean armonía."
    } else if (score >= 40) {
        return "Necesitan tiempo para entenderse. Cada desafío fortalecerá su vínculo."
    }
    return "Diferencia significativa en la energía de sus almas. Necesitan mucha adaptación y comprensión."
}

async function handler(m, { sock }) {
    const args = m.args || []
    const text = args.join(' ')

    if (!text || !text.includes('|')) {
        return m.reply(
            `💫 *sᴏᴜʟ ᴍᴀᴛᴄʜ*\n\n` +
            `> ¡Comprobá la compatibilidad de 2 almas!\n\n` +
            `*Formato:*\n` +
            `> \`.almas nombre1|nombre2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`.almas Messi|Antonela\``
        )
    }

    const [nama1, nama2] = text.split('|').map(n => n.trim())

    if (!nama1 || !nama2) {
        return m.reply(`❌ Ingresá 2 nombres con el formato: \`${m.prefix}almas nombre1|nombre2\``)
    }

    await m.react('🕕')

    // Usamos el nombre para generar un seed consistente
    const seed1 = nama1.length + 10
    const seed2 = nama2.length + 20
    const soul1 = generateSoulData(nama1, seed1)
    const soul2 = generateSoulData(nama2, seed2)
    
    const combined = nama1.toLowerCase() + nama2.toLowerCase()
    const baseScore = Array.from(combined).reduce((a, c) => a + c.charCodeAt(0), 0)
    const compatibility = (baseScore % 51) + 50 

    let txt = `╭═══❯ *💫 SOUL MATCH* ❮═══\n`
    txt += `│\n`
    txt += `│ 👤 *${nama1}*\n`
    txt += `│ ├ 🔮 Alma: ${soul1.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul1.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul1.zodiac}\n`
    txt += `│\n`
    txt += `│ 👤 *${nama2}*\n`
    txt += `│ ├ 🔮 Alma: ${soul2.soulType}\n`
    txt += `│ ├ 🌟 Elemento: ${soul2.element}\n`
    txt += `│ └ 🎯 Zodiaco: ${soul2.zodiac}\n`
    txt += `│\n`
    txt += `│ 💕 *COMPATIBILIDAD*\n`
    txt += `│ ├ 📊 Puntaje: *${compatibility}%*\n`
    txt += `│ └ 🎭 Estado: ${getMatchDescription(compatibility)}\n`
    txt += `│\n`
    txt += `│ 🔮 *Lectura:*\n`
    txt += `│ ${getReading(compatibility)}\n`
    txt += `│\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
    m.react('✅')
}

export { pluginConfig as config, handler }
