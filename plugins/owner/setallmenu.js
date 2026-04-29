import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import pkg from 'ourin'
const { generateWAMessageFromContent, proto } = pkg

const pluginConfig = {
    name: 'setallmenu',
    alias: ['estilomenu', 'variantemenu', 'configmenu'],
    category: 'owner',
    description: 'Configura el estilo visual del menú principal (allmenu)',
    usage: '.setallmenu <v1-v5>',
    example: '.setallmenu v2',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    v1: { id: 1, name: 'Texto Simple', desc: 'Texto plano sin imágenes ni información de contexto', emoji: '📝' },
    v2: { id: 2, name: 'Imagen + Contexto', desc: 'Imagen con información de contexto completa y boletín', emoji: '🖼️' },
    v3: { id: 3, name: 'Documento', desc: 'Archivo con miniatura JPEG, contexto y citado verificado', emoji: '📄' },
    v4: { id: 4, name: 'Botón Interactivo', desc: 'Mensaje interactivo con selección de categoría y respuesta rápida', emoji: '🔘' },
    v5: { id: 5, name: 'Flujo Nativo', desc: 'NativeFlow con oferta por tiempo limitado y botones interactivos', emoji: '✨' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()

    if (variant) {
        const selected = VARIANTS[variant]
        if (!selected) {
            await m.reply(`❌ ¡Variante no válida!\n\nUsa: v1 hasta v5`)
            return
        }

        db.setting('allmenuVariant', selected.id)
        await db.save()

        await m.reply(
            `✅ *ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜ́ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n` +
            `> ${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
            `> _${selected.desc}_`
        )
        return
    }

    const current = db.setting('allmenuVariant') || config.ui?.allmenuVariant || 2

    const rows = Object.entries(VARIANTS).map(([key, val]) => ({
        title: `${val.emoji} ${key.toUpperCase()}${val.id === current ? ' ✓' : ''} — ${val.name}`,
        description: val.desc,
        id: `${m.prefix}setallmenu ${key}`
    }))

    const bodyText =
        `📋 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴇsᴛɪʟᴏ ᴅᴇ ᴍᴇɴᴜ́*\n\n` +
        `> Variante activa: *V${current}*\n` +
        `> _${VARIANTS[`v${current}`]?.name || 'Desconocido'}_\n\n` +
        `> Selecciona una variante de la lista de abajo:`

    try {
        const interactiveButtons = [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '📋 sᴇʟᴇᴄᴄɪᴏɴᴀʀ ᴇsᴛɪʟᴏ',
                    sections: [{
                        title: 'ʟɪsᴛᴀ ᴅᴇ ᴠᴀʀɪᴀɴᴛᴇs ᴅɪsᴘᴏɴɪʙʟᴇs',
                        rows
                    }]
                })
            }
        ]

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.fromObject({
                            text: bodyText
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.fromObject({
                            text: config.bot?.name || 'Ourin-AI'
                        }),
                        header: proto.Message.InteractiveMessage.Header.fromObject({
                            title: '📋 Variante AllMenu',
                            subtitle: `${Object.keys(VARIANTS).length} variantes disponibles`,
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: interactiveButtons
                        }),
                        contextInfo: {
                            mentionedJid: [m.sender],
                            forwardingScore: 9999,
                            isForwarded: true,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: config.saluran?.id || '120363208449943317@newsletter',
                                newsletterName: config.saluran?.name || config.bot?.name || 'Ourin-AI',
                                serverMessageId: 127
                            }
                        }
                    })
                }
            }
        }, { userJid: m.sender, quoted: m })

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch {
        let txt = `📋 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴇsᴛɪʟᴏ ᴅᴇ ᴍᴇɴᴜ́*\n\n`
        txt += `> Variante actual: *V${current}*\n\n`
        for (const [key, val] of Object.entries(VARIANTS)) {
            const mark = val.id === current ? ' ✓' : ''
            txt += `> ${val.emoji} *${key.toUpperCase()}*${mark} — _${val.desc}_\n`
        }
        txt += `\n_Usa: \`.setallmenu v1\` hasta \`.setallmenu v5\`_`
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
