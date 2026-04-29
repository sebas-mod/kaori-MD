import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'welcomeall',
    alias: ['bienvenidaall', 'bienvenidaglobal', 'wcall'],
    category: 'owner',
    description: 'Activa o desactiva la bienvenida en todos los grupos',
    usage: '.welcomeall <on/off>',
    example: '.welcomeall on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const args = m.args || []
    const action = args[0]?.toLowerCase()
    
    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *ʙɪᴇɴᴠᴇɴɪᴅᴀ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activa o desactiva el mensaje de bienvenida en TODOS los grupos a la vez.\n\n` +
            `╭┈┈⬡「 📋 *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ* 」\n` +
            `┃ ${m.prefix}welcomeall on\n` +
            `┃ ${m.prefix}welcomeall off\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    await m.react('🕕')
    
    try {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        const status = action === 'on'
        let count = 0
        
        for (const groupId of groupIds) {
            db.setGroup(groupId, { welcome: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ✅ Bienvenida: *ACTIVADA*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> ¡Todos los miembros nuevos serán saludados automáticamente!`
            )
        } else {
            return m.reply(
                `❌ *ʙɪᴇɴᴠᴇɴɪᴅᴀ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ❌ Bienvenida: *DESACTIVADA*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> Se ha desactivado la bienvenida en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[WelcomeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
