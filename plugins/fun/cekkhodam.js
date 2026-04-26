import fs from 'fs'
import path from 'path'
import gtts from 'gtts'

const pluginConfig = {
    name: 'tuangel',
    alias: ['khodam', 'guardián', 'espíritu'],
    category: 'fun',
    description: 'Descubre qué espíritu guardián te acompaña a ti o a otra persona',
    usage: '.tuangel o responde al mensaje de alguien',
    example: '.tuangel',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const KHODAMS = [
    { name: "Tigre Blanco", meaning: "Eres fuerte y valiente, tus antepasados te han heredado una gran fuerza." },
    { name: "Lámpara Dormida", meaning: "Pareces cansado pero siempre emites una luz cálida." },
    { name: "Panda sin Dientes", meaning: "Eres adorable y siempre logras hacer reír a los demás con tus ocurrencias." },
    { name: "Patito de Goma", meaning: "Eres tranquilo y alegre, capaz de flotar sobre los problemas con una sonrisa." },
    { name: "Tortuga Ninja", meaning: "Eres ágil y resistente, listo para proteger a los débiles con tu fuerza." },
    { name: "Gato de Heladera", meaning: "Eres misterioso y siempre apareces en los lugares menos pensados." },
    { name: "Jabón Perfumado", meaning: "Siempre traes frescura y buen aroma a donde sea que vayas." },
    { name: "Hormiga Obrera", meaning: "Eres muy trabajador y siempre se puede confiar en ti en cualquier situación." },
    { name: "Cupcake de Arcoíris", meaning: "Eres dulce y lleno de color, siempre traes felicidad y alegría." },
    { name: "Robot Mini", meaning: "Eres avanzado y siempre estás listo para ayudar con tu inteligencia tecnológica." },
    { name: "Pez Volador", meaning: "Eres único y lleno de sorpresas, siempre superas los límites establecidos." },
    { name: "Pollo Frito", meaning: "Todo el mundo te quiere y te espera, llenas de sabor cada paso que das." },
    { name: "Cucaracha Voladora", meaning: "Siempre sorprendes a todos y causas un caos total cuando apareces." },
    { name: "Cabra Loca", meaning: "Eres único y haces reír a todos con tus comportamientos extraños." },
    { name: "Papas Fritas Crujientes", meaning: "Haces que cualquier ambiente sea más divertido y placentero." },
    { name: "Chanchito Alcancía", meaning: "Siempre guardas sorpresas valiosas dentro de ti." },
    { name: "Ropero Antiguo", meaning: "Estás lleno de historias y recuerdos del pasado." },
    { name: "Café con Leche", meaning: "Eres dulce y siempre le das energía a los que te rodean." },
    { name: "Escoba de Paja", meaning: "Eres fuerte y siempre se puede contar contigo para limpiar los problemas." },
    { name: "Pizza de Ayer", meaning: "Siempre caés bien y sos la salvación de muchos." },
    { name: "Helado Derritiéndose", meaning: "Siempre suavizás el ambiente con tu dulzura." },
    { name: "Pegamento Extra Fuerte", meaning: "Siempre te mantenés unido incluso en las situaciones más complicadas." },
    { name: "Dulce de Leche", meaning: "Le das ese toque dulce y argentino a la vida de los demás." },
    { name: "Gato Callejero", meaning: "Sos independiente, astuto y lleno de aventuras." },
    { name: "Té de Hierbas", meaning: "Dás calma y alivio incluso cuando las cosas se ponen amargas." },
    { name: "Mate Caliente", meaning: "Sos el mejor compañero y siempre estás ahí para una charla." },
    { name: "Auto Clásico", meaning: "Sos fiel, tenés estilo y nunca fallás." },
    { name: "Empanada de Carne", meaning: "Sos sustancioso y siempre caés bien en cualquier reunión." },
    { name: "León Coronado", meaning: "Naciste para ser líder, tenés la fuerza y sabiduría de un rey." },
    { name: "Pantera Negra", meaning: "Sos misterioso y poderoso, siempre alerta aunque no te vean." },
    { name: "Caballo de Oro", meaning: "Sos valioso y fuerte, listo para correr hacia el éxito." },
    { name: "Águila Azul", meaning: "Tenés una visión aguda y podés ver oportunidades desde muy lejos." },
    { name: "Dragón de Colores", meaning: "Sos imponente y tenés el poder de proteger y atacar con estilo." },
    { name: "Elefante Blanco", meaning: "Sos sabio y tenés una gran presencia, símbolo de coraje y determinación." },
    { name: "Toro Bravo", meaning: "Sos fuerte y lleno de energía, no te dan miedo los obstáculos." },
    { name: "Ventilador de Techo", meaning: "Siempre traes un aire fresco cuando las cosas se ponen pesadas." },
    { name: "Ojotas de Goma", meaning: "Sos relajado, humilde y muy cómodo de tener cerca." },
    { name: "Almohada Suave", meaning: "Sos el refugio perfecto y siempre das tranquilidad." },
    { name: "Perro Rastreador", meaning: "Sos leal y dedicado, siempre encontrás el camino hacia tus metas." }
]

function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}

function handler(m, { sock }) {
    let targetJid = m.sender
    let targetName = m.pushName || m.sender.split('@')[0]

    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (m.mentionedJid?.[0]) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    } else if (m.text) {
        targetName = m.text
    }

    const khodam = getRandomKhodam()
    let txt = `Hola ${targetName || ""}, tu espíritu guardián es: ${khodam.name}. Significa: ${khodam.meaning}`

    // Usamos 'es' para español en el TTS
    const tts = new gtts(txt, 'es')
    const id = Date.now()
    const tempPath = path.join(process.cwd(), 'temp', `khodam-${id}.mp3`)

    tts.save(tempPath, async function (err) {
        if (err) return console.log(err)
        await sock.sendMedia(m.chat, fs.readFileSync(tempPath), null, m, { type: 'audio' })
        try {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
        } catch (error) {
            console.error(error)
        }
    })
}

export { pluginConfig as config, handler }
