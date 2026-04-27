import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'linkgc',
    alias: ['link', 'linkgroup', 'enlace', 'gclink'],
    category: 'group',
    description: 'Obtén el enlace de invitación del grupo',
    usage: '.linkgc',
    example: '.linkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false, // Cambiado a false para que cualquier usuario pueda pedirlo si el bot es admin
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔗')
    
    try {
        const code = await sock.groupInviteCode(m.chat)
        const urlGrup = `https://chat.whatsapp.com/${code}`
        
        const response = `✨ *ᴇɴʟᴀᴄᴇ ᴅᴇʟ ɢʀᴜᴘᴏ*\n\n` +
                         `Aquí tienes el link de invitación para este grupo:\n` +
                         `> ${urlGrup}\n\n` +
                         `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Asistente Grupal*`

        await m.reply(response)
        
        m.react('✅')
        
    } catch (err) {
        console.error(err)
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
