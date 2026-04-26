import cekfemboy from '../../src/scraper/lufemboy.js'
import { fetchBuffer } from '../../src/lib/ourin-utils.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'chequeofemboy',
    alias: ['femboy', 'femtest'],
    category: 'cek',
    description: 'Verifica qué tan femboy sos',
    usage: '.femboy <nombre/tag>',
    example: '.femboy @usuario',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const percent = Math.floor(Math.random() * 101)
    const mentioned = m.mentionedJid[0] || m.sender
    const name = m.pushName || 'Usuario'

    try {
        // Lógica de descripción según el porcentaje
        let desc = ''
        if (percent >= 90) desc = '¡FEMBOY SUPREMO! Ya tenés las medias largas puestas 👗✨'
        else if (percent >= 70) desc = 'Re femboy, ¡te queda bien el outfit! ✨'
        else if (percent >= 50) desc = 'Mitad y mitad, vas por buen camino 😊'
        else if (percent >= 30) desc = 'Un poquito, apenas empezando 🤔'
        else desc = 'Nada de femboy por acá, ¡puro músculo! 😎'

        // Intentar obtener el gif del scraper si es necesario
        let buffer = null
        try {
            const result = cekfemboy(name)
            if (result && result.gif) {
                buffer = await fetchBuffer(result.gif)
            }
        } catch (e) {
            console.error('Error al obtener gif de femboy:', e)
        }

        let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu nivel de femboy es del *${percent}%*
\`\`\`${desc}\`\`\`` : `¿Querés ver qué tan femboy es @${mentioned.split('@')[0]}? 
    
Su nivel de femboy es del *${percent}%*
\`\`\`${desc}\`\`\``

        // Si hay buffer de gif se podría enviar, pero para mantener 
        // consistencia con tus otros plugins de "cek", enviamos el texto.
        await m.reply(txt, { mentions: [mentioned] })
        
    } catch (err) {
        return m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
