import { getParticipantJids } from '../../src/lib/ourin-lid.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'listadmin',
    alias: ['admins', 'adminlist', 'listaadmins'],
    category: 'group',
    description: 'Muestra la lista de administradores del grupo',
    usage: '.listadmin',
    example: '.listadmin',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        // Filtrar participantes que tengan rango de admin o superadmin
        const admins = participants.filter(p => p.admin)

        if (admins.length === 0) {
            await m.reply(`❌ *ꜰᴀʟʟᴏ*\n\n> No se encontraron administradores en este grupo.`)
            return
        }

        const owner = admins.find(a => a.admin === 'superadmin')
        const regularAdmins = admins.filter(a => a.admin === 'admin')

        let adminList = `👑 *ʟɪsᴛᴀ ᴅᴇ ᴀᴅᴍɪɴs*\n\n`

        if (owner) {
            adminList += `\`\`\`━━━ CREADOR ━━━\`\`\`\n`
            adminList += `\`\`\`👑 @${owner.id.split('@')[0]}\`\`\`\n\n`
        }

        if (regularAdmins.length > 0) {
            adminList += `\`\`\`━━━ ADMINS ━━━\`\`\`\n`
            regularAdmins.forEach((admin, i) => {
                adminList += `\`\`\`${i + 1}. @${admin.id.split('@')[0]}\`\`\`\n`
            })
        }
        
        adminList += `\n> *Total Admins:* ${admins.length}\n`
        adminList += `*KAORI MD — Gestión de Grupo*`

        const mentions = admins.map(a => a.id)

        await m.reply(adminList, { mentions })

    } catch (error) {
        console.error(error)
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
