import { getRandomItem } from '../../src/lib/ourin-game-data.js'
import { fetchBuffer } from '../../src/lib/ourin-utils.js'

const pluginConfig = {
    name: 'motivacion',
    alias: ['reflexion', 'frases', 'motivasi'],
    category: 'fun',
    description: 'Genera una imagen aleatoria con frases de reflexión o motivación',
    usage: '.motivacion',
    example: '.motivacion',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
};

async function handler(m, { sock }) {
    m.react('🕕')
    try {
        // Se asume que el JSON contiene URLs de imágenes o rutas de archivos
        await sock.sendMedia(m.chat, getRandomItem('renungan.json'), null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('❌')
        await m.reply('❌ ¡Error al obtener la imagen. Intentalo de nuevo!');
    }
}

export { pluginConfig as config, handler }
