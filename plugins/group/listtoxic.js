import { getDatabase } from '../../src/lib/ourin-database.js'
import { DEFAULT_TOXIC_WORDS } from './antitoxic.js'

const pluginConfig = {
    name: 'listtoxic',
    alias: ['toxiclist', 'listainsultos', 'verinsultos', 'listatoxic'],
    category: 'group',
    description: 'Muestra la lista de palabras prohibidas o tóxicas',
    usage: '.listtoxic',
    example: '.listtoxic',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    
    const customWords = groupData.toxicWords || []
    const defaultWords = DEFAULT_TOXIC_WORDS || []
    
    let text = `📋 *ʟɪsᴛᴀ ᴅᴇ ɪɴsᴜʟᴛᴏs*\n\n`
    
    if (customWords.length > 0) {
        text += `╭┈┈⬡「 ✏️ *ᴘᴇʀsᴏɴᴀʟ* (${customWords.length}) 」\n`
        for (let i = 0; i < customWords.length; i++) {
            text += `┃ ${i + 1}. ${customWords[i]}\n`
        }
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    text += `╭┈┈⬡「 📦 *ʙᴀsᴇ* (${defaultWords.length}) 」\n`
    
    for (let i = 0; i < defaultWords.length; i++) {
        text += `┃ ${i + 1}. ${defaultWords[i]}\n`
    }
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    text += `Total: *${customWords.length + defaultWords.length}* palabras\n\n`
    text += `> Usa \`${m.prefix}addtoxic <palabra>\` para agregar\n`
    text += `> Usa \`${m.prefix}deltoxic <palabra>\` para eliminar\n\n`
    text += `*KAORI MD — Moderación*`
    
    await m.reply(text)
}

export { pluginConfig as config, handler }
