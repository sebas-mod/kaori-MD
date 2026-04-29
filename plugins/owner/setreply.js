import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import pkg from 'ourin';
const { generateWAMessageFromContent, proto } = pkg;

const pluginConfig = {
    name: 'setreply',
    alias: ['estiloreply', 'variantereply', 'configreply'],
    category: 'owner',
    description: 'Configura el estilo visual de las respuestas (reply)',
    usage: '.setreply <v1-v9>',
    example: '.setreply v5',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const VARIANTS = {
    v1: { id: 1, name: 'Simple', desc: 'Respuesta de texto normal sin estilo', emoji: '📝' },
    v2: { id: 2, name: 'Contexto', desc: 'Respuesta con externalAdReply (miniatura pequeña)', emoji: '🖼️' },
    v3: { id: 3, name: 'Reenvío', desc: 'ContextInfo completo + boletín informativo', emoji: '📨' },
    v4: { id: 4, name: 'Qcontacto', desc: 'V3 + respuesta citada falsa (verificado azul)', emoji: '✅' },
    v5: { id: 5, name: 'FakeTroli', desc: 'V3 + citado de carrito falso + miniatura grande', emoji: '🛒' },
    v6: { id: 6, name: 'Hehe', desc: 'Verificado azul + documento', emoji: '📄' },
    v7: { id: 7, name: 'Favorito', desc: 'Verificado azul + imagen', emoji: '🌟' },
    v8: { id: 8, name: 'Imagen Larga', desc: 'Imagen larga, sin verificado azul', emoji: '📐' },
    v9: { id: 9, name: 'Video GIF', desc: 'Video GIF, sin verificado azul', emoji: '🎞️' }
};

async function handler(m, { sock, db }) {
    const args = m.args || [];
    const variant = args[0]?.toLowerCase();

    if (variant) {
        const selected = VARIANTS[variant];
        if (!selected) {
            await m.reply(`❌ ¡Variante no válida!\n\nUsa: v1 hasta v9`);
            return;
        }

        db.setting('replyVariant', selected.id);

        await m.reply(
            `✅ *ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ʀᴇᴘʟʏ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀ*\n\n` +
            `> ${selected.emoji} *V${selected.id} — ${selected.name}*\n` +
            `> _${selected.desc}_`
        );
        return;
    }

    const current = db.setting('replyVariant') || config.ui?.replyVariant || 1;

    const rows = Object.entries(VARIANTS).map(([key, val]) => ({
        title: `${val.emoji} ${key.toUpperCase()}${val.id === current ? ' ✓' : ''} — ${val.name}`,
        description: val.desc,
        id: `${m.prefix}setreply ${key}`
    }));

    const bodyText =
        `💬 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ʀᴇᴘʟʏ*\n\n` +
        `> Variante activa: *V${current}*\n` +
        `> _${VARIANTS[`v${current}`]?.name || 'Desconocido'}_\n\n` +
        `> Elige una variante de la lista de abajo:`;

    try {
        const interactiveButtons = [
            {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: '💬 sᴇʟᴇᴄᴄɪᴏɴᴀʀ ᴇsᴛɪʟᴏ',
                    sections: [{
                        title: 'ʟɪsᴛᴀ ᴅᴇ ᴠᴀʀɪᴀɴᴛᴇs ᴅᴇ ʀᴇᴘʟʏ',
                        rows
                    }]
                })
            }
        ];

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
                            title: '💬 Variante de Respuesta',
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
        }, { userJid: m.sender, quoted: m });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } catch {
        let txt = `💬 *ᴄᴏɴғɪɢᴜʀᴀʀ ᴠᴀʀɪᴀɴᴛᴇ ᴅᴇ ʀᴇᴘʟʏ*\n\n`;
        txt += `> Variante actual: *V${current}*\n\n`;
        for (const [key, val] of Object.entries(VARIANTS)) {
            const mark = val.id === current ? ' ✓' : '';
            txt += `> ${val.emoji} *${key.toUpperCase()}*${mark} — _${val.desc}_\n`;
        }
        txt += `\n_Usa: \`.setreply v1\` hasta \`.setreply v9\`_`;
        await m.reply(txt);
    }
}

export { pluginConfig as config, handler }
