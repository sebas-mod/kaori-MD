import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'resetrules',
    alias: ['resetreglas', 'resetbotrules'],
    category: 'owner',
    description: 'Restablece las reglas del bot a los valores predeterminados',
    usage: '.resetrules',
    example: '.resetrules',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = getDatabase()
    
    // Restablece el valor en la configuración de la base de datos a null (por defecto)
    db.setting('botRules', null)
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀs*\n\n` +
        `> ¡Las reglas del bot se han restablecido correctamente!\n` +
        `> Escribe \`${m.prefix}rules\` para ver las reglas actuales.`
    )
}

export { pluginConfig as config, handler }
