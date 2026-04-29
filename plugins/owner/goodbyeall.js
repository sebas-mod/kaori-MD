import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'despedidatodos',
    alias: ['despall', 'globalgoodbye', 'leaveall'],
    category: 'owner',
    description: 'Activa o desactiva la despedida en todos los grupos',
    usage: '.despedidatodos <on/off>',
    example: '.despedidatodos on',
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
            `👋 *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ*\n\n` +
            `> Activa o desactiva la despedida en TODOS los grupos a la vez\n\n` +
            `╭┈┈⬡「 📋 *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ* 」\n` +
            `┃ ${m.prefix}despedidatodos on\n` +
            `┃ ${m.prefix}despedidatodos off\n` +
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
            db.setGroup(groupId, { leave: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ✅ Despedida: *ACTIVA*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> ¡Se enviará un mensaje de despedida a los miembros que salgan!`
            )
        } else {
            return m.reply(
                `❌ *ᴅᴇsᴘᴇᴅɪᴅᴀ ɢʟᴏʙᴀʟ ᴏғғ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛᴀᴅᴏ* 」\n` +
                `┃ 🌐 Total Grupos: *${count}*\n` +
                `┃ ❌ Despedida: *INACTIVA*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `> La despedida ha sido desactivada en todos los grupos.`
            )
        }
    } catch (error) {
        console.error('[DespedidaAll] Error:', error.message)
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
