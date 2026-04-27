import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'resetlinkgc',
    alias: ['resetlink', 'revocarenlace', 'nuevolink', 'revokelink'],
    category: 'group',
    description: 'Restablece el enlace de invitación del grupo',
    usage: '.resetlinkgc',
    example: '.resetlinkgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    m.react('🔄')
    
    try {
        // Ejecuta la revocación del enlace actual
        await sock.groupRevokeInvite(m.chat)
        
        m.react('✅')
        m.reply(
            `✅ *ᴇɴʟᴀᴄᴇ ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴏ*\n\n` +
            `> El enlace anterior ha sido invalidado con éxito.\n` +
            `> Usa \`${m.prefix}linkgc\` para generar y obtener el nuevo enlace.\n\n` +
            `*KAORI MD — Seguridad*`
        )
        
    } catch (err) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
