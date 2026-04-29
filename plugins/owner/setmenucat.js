import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import pkg from 'ourin'
const { generateWAMessageFromContent, proto } = pkg

const pluginConfig = {
    name: 'setmenucat',
    alias: ['estilocatmenu', 'variantecatmenu', 'configcat'],
    category: 'owner',
    description: 'Configura el estilo visual del menú por categorías (menucat)',
    usage: '.setmenucat <v1-v4>',
    example: '.setmenucat v2',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const VARIANTS = {
    v1: { id: 1, name: 'Texto Simple', desc: 'Texto plano sin información de contexto', emoji: '📝' },
    v2: { id: 2, name: 'Contexto + Newsletter', desc: 'Texto + contextInfo + boletín + anuncio externo', emoji: '🖼️' },
    v3: { id: 3, name: 'Imagen + Subtítulo', desc: 'Imagen + descripción + contextInfo + boletín', emoji: '📸' },
    v4: { id: 4, name: 'Botón Interactivo', desc: 'Mensaje interactivo + selección de comandos + botón de regreso', emoji: '🔘' }
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const variant = args[0]?.toLowerCase()

    if (variant) {
        const selected = VARIANTS[variant]
        if (!selected) {
            await m.reply(`❌ ¡Variante no válida!\n\nUsa: v1 hasta v4`)
            return
        }

        db.setting('menucatVariant', selected.id)
        await db.save()

        await m.reply(
            `✅ *ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜᴄᴀᴛ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n` +
            `> ${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
            `> _${selected.desc}_`
        )
        return
    }

    const current = db.setting('menucatVariant') || config.ui?.menucatVariant || 2

    const rows = Object.entries(VARIANTS).map(([key, val]) => ({
        title: `${val.emoji} ${key.toUpperCase()}${val.id === current ? ' ✓' : ''} — ${val.name}`,
        description: val.desc,
        id: `${m.prefix}setmenucat ${key}`
    }))

    const bodyText =
        `📂 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜᴄᴀᴛ*\n\n` +
        `> Variante activa: *V${current}*\n` +
        `> _${VARIANTS[`v${current}`]?.name || 'Desconocido'}_\n\n` +
        `> Elige una variante de la lista de abajo:`

    try {
        const interactiveButtons = [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '📂 sᴇʟᴇᴄᴄɪᴏɴᴀʀ ᴇsᴛɪʟᴏ',
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
                            title: '📂 Variante MenuCat',
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
        let txt = `📂 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ᴍᴇɴᴜᴄᴀᴛ*\n\n`
        txt += `> Variante actual: *V${current}*\n\n`
        for (const [key, val] of Object.entries(VARIANTS)) {
            const mark = val.id === current ? ' ✓' : ''
            txt += `> ${val.emoji} *${key.toUpperCase()}*${mark} — _${val.desc}_\n`
        }
        txt += `\n_Usa: \`.setmenucat v1\` hasta \`.setmenucat v4\`_`
        await m.reply(txt)
    }
}

export { pluginConfig as config, handler }
