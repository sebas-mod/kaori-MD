import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'resetlimitdefault',
    alias: ['restablecerlimitopredeterminado', 'resetlimitpred'],
    category: 'owner',
    description: 'Restablece el límite predeterminado a la configuración original',
    usage: '.resetlimitdefault',
    example: '.resetlimitdefault',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = getDatabase()
    const configDefault = config.limits?.default || 25
    
    // Elimina el valor personalizado de la base de datos para volver al de config.js
    db.setting('defaultLimit', null)
    
    await m.reply(
        `✅ *ᴇ́xɪᴛᴏ*\n\n` +
        `> El límite predeterminado ha sido restablecido a: \`${configDefault}\`\n` +
        `> Los nuevos usuarios recibirán el límite de la configuración original.`
    )
}

export { pluginConfig as config, handler }
