import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'listantilink',
    alias: ['antilinklist', 'listalinks', 'verlinks'],
    category: 'group',
    description: 'Muestra la lista de enlaces bloqueados en el grupo',
    usage: '.listantilink',
    example: '.listantilink',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const DEFAULT_BLOCKED_LINKS = [
    'chat.whatsapp.com',
    'wa.me',
    'bit.ly',
    't.me',
    'telegram.me',
    'discord.gg',
    'discord.com/invite'
]

function handler(m) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customList = groupData.antilinkList || []
    
    let txt = `🔗 *ʟɪsᴛᴀ ᴀɴᴛɪ-ʟɪɴᴋ*\n\n`
    
    txt += `╭┈┈⬡「 📌 *ᴘᴏʀ ᴅᴇꜰᴇᴄᴛᴏ* 」\n`
    DEFAULT_BLOCKED_LINKS.forEach((l, i) => {
        txt += `┃ ${i + 1}. \`${l}\`\n`
    })
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    if (customList.length > 0) {
        txt += `╭┈┈⬡「 ➕ *ᴘᴇʀsᴏɴᴀʟ* 」\n`
        customList.forEach((l, i) => {
            txt += `┃ ${i + 1}. \`${l}\`\n`
        })
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    txt += `> Base: *${DEFAULT_BLOCKED_LINKS.length}* dominios\n`
    txt += `> Propios: *${customList.length}* dominios\n\n`
    txt += `Usa \`${m.prefix}addantilink <link>\` para agregar\n`
    txt += `Usa \`${m.prefix}delantilink <link>\` para eliminar\n\n`
    txt += `*KAORI MD — Seguridad*`
    
    m.reply(txt)
}

export { pluginConfig as config, handler, DEFAULT_BLOCKED_LINKS }
