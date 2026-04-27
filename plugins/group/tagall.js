import { getParticipantJid, getParticipantJids } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'tagall',
    alias: ['todos', 'everyone', 'all', 'tagall', 'mencionar'],
    category: 'group',
    description: 'Menciona a todos los miembros del grupo',
    usage: '.todos <mensaje>',
    example: '.todos ¡Despierten!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    const text = m.text || 'Mención a todos los miembros'

    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []

        if (participants.length === 0) {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> No hay miembros en este grupo.`)
            return
        }

        const mentions = getParticipantJids(participants)
        const memberList = participants.map((p, i) => `${i + 1}. @${getParticipantJid(p).split('@')[0]}`).join('\n').trim()

        await m.reply(`📢 *ᴍᴇɴsᴀᴊᴇ:* ${text}\n\n` +
            `\`\`\`━━━ ${participants.length} MIEMBROS TOTAL ━━━\`\`\`\n` +
            memberList + `\n\n*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Difusión*`, { mentions: mentions })

    } catch (error) {
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
