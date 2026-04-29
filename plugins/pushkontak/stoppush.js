import { getDatabase } from '../../src/lib/ourin-database.js'
import { getGroupMode } from '../group/botmode.js'

const pluginConfig = {
    name: 'detenerpush',
    alias: ['stoppush', 'stoppushkontak', 'detenerdifusion'],
    category: 'pushkontak', // Categoría original preservada
    description: 'Detiene el proceso de pushkontak que esté en curso',
    usage: '.detenerpush',
    example: '.detenerpush',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!global.statuspush) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No hay ningún proceso de pushkontak activo actualmente.`)
    }
    
    global.stoppush = true
    
    m.react('⏹️')
    await m.reply(`⏹️ *ᴅᴇᴛᴇɴᴇʀ ᴘᴜsʜ*\n\n> Solicitando la detención del proceso...`)
}

export { pluginConfig as config, handler }
