import fs from 'fs'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'setgoodbyetype',
    alias: ['tipodespedida', 'estilodespedida', 'variantedespedida'],
    category: 'owner',
    description: 'Configura el estilo visual del mensaje de despedida (goodbye)',
    usage: '.setgoodbyetype',
    example: '.setgoodbyetype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Imagen Canvas', desc: 'Imagen generada con la foto de perfil del usuario' },
    2: { name: 'Tarjetas Carousel', desc: 'Tarjetas interactivas con botones (NOTA: setgoodbye no afecta esto)' },
    3: { name: 'Solo Texto', desc: 'Mensaje de texto minimalista sin imágenes' },
    4: { name: 'Grupo', desc: 'Estilo ExternalAdReply de grupo (NOTA: setgoodbye no afecta esto)' },
    5: { name: 'Simple', desc: 'Mensaje de texto simple + foto de perfil' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('goodbyeType') || 1

    if (variant && /^v?[1-5]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('goodbyeType', id)
        await db.save()
        
        await m.reply(
            `✅ Tipo de despedida cambiado a *V${id}*\n` +
            `*${VARIANTS[id].name}*\n` +
            `_${VARIANTS[id].desc}_`
        )
        return
    }

    const buttons = []
    for (const [id, val] of Object.entries(VARIANTS)) {
        const mark = parseInt(id) === current ? ' ✓' : ''
        buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `V${id}${mark} - ${val.name}`,
                id: `${m.prefix}setgoodbyetype v${id}`
            })
        })
    }

    const caption = `🥗 *ᴛɪᴘᴏ ᴅᴇ ᴅᴇsᴘᴇᴅɪᴅᴀ*\n\n` +
                    `El tipo actual es la versión *${current}*\n` +
                    `_${VARIANTS[current].name}_\n\n` +
                    `Selecciona una variante de despedida:`

    await sock.sendButton(
        m.chat, 
        fs.readFileSync('./assets/images/ourin.jpg'), 
        caption, 
        m, 
        { buttons }
    )
}

export { pluginConfig as config, handler }
