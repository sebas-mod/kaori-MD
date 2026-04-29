import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
    name: 'setownertype',
    alias: ['tipoowner', 'estiloowner', 'varianteowner'],
    category: 'owner',
    description: 'Configura el estilo visual del mensaje de contacto del owner',
    usage: '.setownertype',
    example: '.setownertype',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    1: { name: 'Diseño Actual', desc: 'Muestra el diseño predeterminado del bot' },
    2: { name: 'Tarjetas Carousel', desc: 'Tarjetas deslizables con la foto del owner' },
    3: { name: 'Contacto Múltiple', desc: 'Envía las tarjetas de contacto de todos los owners' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()
    const current = db.setting('ownerType') || 1
    
    if (variant && /^v?[1-3]$/.test(variant)) {
        const id = parseInt(variant.replace('v', ''))
        db.setting('ownerType', id)
        await db.save()
        
        await m.reply(
            `✅ Tipo de owner cambiado a *V${id}*\n\n` +
            `> *${VARIANTS[id].name}*\n` +
            `> _${VARIANTS[id].desc}_`
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
                id: `${m.prefix}setownertype v${id}`
            })
        })
    }
    
    await sock.sendMessage(m.chat, {
        text: `🎨 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴇsᴛɪʟᴏ ᴏᴡɴᴇʀ*\n\n> Tipo actual: *V${current}*\n> _${VARIANTS[current].name}_\n\n> Selecciona una variante para el contacto:`,
        footer: config.bot?.name || 'Ourin-AI',
        contextInfo: {
            mentionedJid: [m.sender],
            isForwarded: true,
            forwardingScore: 999
        },
        interactiveButtons: buttons
    }, { quoted: m })
}

export { pluginConfig as config, handler }
