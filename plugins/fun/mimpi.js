const pluginConfig = {
    name: 'sueño',
    alias: ['dream', 'sueños', 'mundosueño'],
    category: 'fun',
    description: 'Explora tu mundo onírico basado en tu nombre',
    usage: '.sueño <nombre>',
    example: '.sueño Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lúcido ✨', 'Místico 🌟', 'Etéreo 💫', 'Divino 🌙', 'Legendario 🎇']
const DREAM_QUALITIES = ['Pacífico 😌', 'Aventura 🚀', 'Misterioso 🔮', 'Profético 📖', 'Épico 🗺️']

const ELEMENTS = [
    '🌊 Océano de Cristal Brillante',
    '🌈 Arcoíris Flotante',
    '🌺 Jardín Colgante',
    '⭐ Constelación Viviente',
    '🌙 Lunas Gemelas',
    '🏰 Castillo de Nubes',
    '🌋 Montaña de Prisma',
    '🎭 Teatro de Sombras'
]

const EVENTS = [
    '🦋 Mariposas llevando mensajes secretos',
    '🎭 Máscaras que bailan solas',
    '🌊 Lluvia de estrellas cayendo al mar',
    '🎪 Desfile de criaturas mágicas',
    '🌺 Flores cantando canciones antiguas',
    '🎨 Pinturas que cobran vida',
    '🎵 Música que se ve como colores',
    '⚡ Rayos formando una escalera al cielo'
]

const ENCOUNTERS = [
    '🐉 Dragón Arcoíris Sabio',
    '🧙‍♂️ Mago de las Estrellas',
    '🦊 Zorro Espiritual de Nueve Colas',
    '🧝‍♀️ Hada Guardiana de Sueños',
    '🦁 León de Cristal',
    ' Whale Ballena Voladora Mística',
    '🦅 Fénix del Tiempo',
    '🐢 Tortuga Ancestral del Mundo',
    '🦄 Unicornio Dimensional'
]

const POWERS = [
    '✨ Control del Tiempo',
    '🌊 Hablar con los Elementos',
    '🎭 Cambio de Forma',
    '🌈 Manipulación de la Realidad',
    '👁️ Visión del Futuro',
    '🎪 Teletransportación Dimensional',
    '🌙 Sanación Espiritual',
    '⚡ Energía Cósmica'
]

const MESSAGES = [
    'Tu viaje traerá un gran cambio',
    'Un secreto antiguo será revelado pronto',
    'Un poder oculto despertará en ti',
    'Un nuevo destino te espera en el horizonte',
    'Tu conexión espiritual se fortalecerá',
    'Una gran transformación está por ocurrir',
    'La iluminación vendrá de donde menos lo esperas',
    'Una misión importante comenzará pronto'
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)

    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        // Mezclado basado en el seed para que siempre de el mismo resultado para el mismo nombre
        const shuffled = [...arr].sort((a, b) => {
            const valA = a.length + seedNum
            const valB = b.length + seedNum
            return (valA % 7) - (valB % 5)
        })
        return shuffled.slice(0, count)
    }

    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]

    await m.react('🌙')
    await m.reply('🌙 *Entrando al mundo de los sueños...*')
    await new Promise(r => setTimeout(r, 1500))

    const dream = generateDream(name)

    let txt = `╭═══❯ *🌙 MUNDO ONÍRICO* ❮═══\n`
    txt += `│ 👤 *Explorador:* ${name}\n`
    txt += `│ ⭐ *Nivel:* ${dream.level}\n`
    txt += `│ 💫 *Calidad:* ${dream.quality}\n`
    txt += `│ 🌈 *Elementos:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Sucesos:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encuentros:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Poderes:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Mensaje:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`

    await m.reply(txt)
}

export { pluginConfig as config, handler }
