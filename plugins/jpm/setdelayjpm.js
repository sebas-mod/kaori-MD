import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'setdelayjpm',
    alias: ['delayjpm', 'jedajpm', 'setjedajpm', 'retrasojpm'],
    category: 'admin',
    description: 'Ajustar el tiempo de espera entre envíos masivos (JPM)',
    usage: '.setdelayjpm <ms>',
    example: '.setdelayjpm 3000',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const input = m.text?.trim()
    const current = db.setting('jedaJpm') || 5000

    if (!input) {
        return sock.sendMessage(m.chat, {
            text: `⏱️ *ʀᴇᴛʀᴀsᴏ ᴅᴇ ᴊᴘᴍ (ᴋᴀᴏʀɪ ᴍᴅ)*\n\n` +
                `> Retraso actual: *${current}ms* (${(current / 1000).toFixed(1)}s)\n\n` +
                `*ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ:*\n` +
                `> \`${m.prefix}setdelayjpm <ms>\`\n\n` +
                `*ᴇᴊᴇᴍᴘʟᴏs:*\n` +
                `> \`${m.prefix}setdelayjpm 3000\` → 3 segundos\n` +
                `> \`${m.prefix}setdelayjpm 5000\` → 5 segundos\n` +
                `> \`${m.prefix}setdelayjpm 10000\` → 10 segundos\n\n` +
                `> Rango permitido: *1000ms - 30000ms*`,
            interactiveButtons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⏱️ 3 segundos',
                        id: `${m.prefix}setdelayjpm 3000`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⏱️ 5 segundos',
                        id: `${m.prefix}setdelayjpm 5000`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '⏱️ 10 segundos',
                        id: `${m.prefix}setdelayjpm 10000`
                    })
                }
            ]
        }, { quoted: m })
    }

    const ms = parseInt(input)

    if (isNaN(ms) || ms < 1000 || ms > 30000) {
        return m.reply(`❌ El retraso debe ser un número entre *1000ms* (1s) y *30000ms* (30s).`)
    }

    db.setting('jedaJpm', ms)

    return sock.sendMessage(m.chat, {
        text: `✅ *ʀᴇᴛʀᴀsᴏ ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴏ*\n\n` +
            `> Anterior: *${current}ms* (${(current / 1000).toFixed(1)}s)\n` +
            `> Ahora: *${ms}ms* (${(ms / 1000).toFixed(1)}s)\n\n` +
            `> Estimación para 100 grupos: *${Math.ceil((100 * ms) / 60000)} minutos*`,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '📢 Probar JPM',
                    id: `${m.prefix}jpm`
                })
            }
        ]
    }, { quoted: m })
}

export { pluginConfig as config, handler }
