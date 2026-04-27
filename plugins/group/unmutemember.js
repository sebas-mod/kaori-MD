import { getDatabase } from '../../src/lib/ourin-database.js'
import { isLid, lidToJid } from '../../src/lib/ourin-lid.js'

const pluginConfig = {
    name: 'unmutemember',
    alias: ['unmutemiembro', 'desmutearmienbro', 'listmute', 'listamute', 'vermutas'],
    category: 'group',
    description: 'Quita el silencio a un miembro específico o muestra la lista de silenciados',
    usage: '.unmutemember <@tag/reply/número>',
    example: '.unmutemember @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function resolveTarget(m) {
    let raw = ''

    if (m.quoted) {
        raw = m.quoted.sender || ''
    } else if (m.mentionedJid?.length) {
        raw = m.mentionedJid[0] || ''
    } else if (m.args[0]) {
        raw = m.args[0]
    }

    if (!raw) return ''

    if (isLid(raw)) raw = lidToJid(raw)
    if (!raw.includes('@')) raw = raw.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

    return raw
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const mutedMembers = groupData.mutedMembers || []

    // Lógica para mostrar la lista de silenciados
    if (m.command === 'listmute' || m.command === 'listamute' || m.command === 'vermutas') {
        if (mutedMembers.length === 0) {
            return m.reply(`🔇 *LISTA DE SILENCIADOS*\n\n> No hay miembros silenciados en este grupo.`)
        }

        let txt = `🔇 *LISTA DE SILENCIADOS*\n\n╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n`
        mutedMembers.forEach((jid, i) => {
            const num = jid.replace(/@.+/g, '')
            txt += `┃ ${i + 1}. @${num}\n`
        })
        txt += `╰┈┈⬡\n\n> Total: \`${mutedMembers.length}\` miembros silenciados`

        return m.reply(txt, { mentions: mutedMembers })
    }

    const targetJid = resolveTarget(m)

    if (!targetJid) {
        return m.reply(
            `🔊 *UNMUTE MEMBER*\n\n` +
            `> Permite que un miembro silenciado vuelva a hablar.\n\n` +
            `*Modo de uso:*\n` +
            `> ${m.prefix}unmutemember @user\n` +
            `> ${m.prefix}unmutemember 123456789\n` +
            `> Responde a un mensaje + ${m.prefix}unmutemember`
        )
    }

    const targetNumber = targetJid.replace(/@.+/g, '')

    const index = mutedMembers.findIndex(jid => {
        const c = jid.replace(/@.+/g, '')
        return c === targetNumber || c.endsWith(targetNumber) || targetNumber.endsWith(c)
    })

    if (index === -1) {
        return m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> El miembro @${targetNumber} no está silenciado actualmente.`, { mentions: [targetJid] })
    }

    mutedMembers.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, mutedMembers })

    m.react('🔊')
    await m.reply(
        `🔊 *MIEMBRO DESMUTEARO*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀʟʟᴇ* 」\n` +
        `┃ 👤 ᴍɪᴇᴍʙʀᴏ: @${targetNumber}\n` +
        `┃ 🔊 ᴇsᴛᴀᴅᴏ: \`Habilitado\`\n` +
        `┃ 📊 sɪʟᴇɴᴄɪᴀᴅᴏs: \`${mutedMembers.length}\` restantes\n` +
        `╰┈┈⬡\n\n*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Moderación*`,
        { mentions: [targetJid] }
    )
}

export { pluginConfig as config, handler }
