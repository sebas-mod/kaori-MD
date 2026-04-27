import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'delantilink',
    alias: ['delalink', 'delblocklink', 'remantilink', 'quitarantilink'],
    category: 'group',
    description: 'Elimina un dominio o patrón de la lista de antilink del grupo',
    usage: '.delantilink <dominio/patrón>',
    example: '.delantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    const link = m.args.join(' ')?.trim()?.toLowerCase()
    
    if (!link) {
        const groupData = db.getGroup(m.chat) || {}
        const antilinkList = groupData.antilinkList || []
        
        if (antilinkList.length === 0) {
            return m.reply(`📋 ¡La lista de antilink está vacía!`)
        }
        
        let txt = `🔗 *ʟɪsᴛᴀ ᴀɴᴛɪʟɪɴᴋ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n`
        antilinkList.forEach((l, i) => {
            txt += `> ${i + 1}. \`${l}\`\n`
        })
        txt += `\n> Total: *${antilinkList.length}* dominios bloqueados`
        txt += `\n\nUsa \`${m.prefix}delantilink <dominio>\` para eliminar uno.`
        
        return m.reply(txt)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    let antilinkList = groupData.antilinkList || []
    
    const index = antilinkList.findIndex(l => l === link)
    
    if (index === -1) {
        return m.reply(`⚠️ ¡El dominio \`${link}\` no se encuentra en la lista de este grupo!`)
    }
    
    antilinkList.splice(index, 1)
    db.setGroup(m.chat, { ...groupData, antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
        `> Dominio: \`${link}\`\n` +
        `> Restantes: *${antilinkList.length}* en la lista`
    )
}

export { pluginConfig as config, handler }
