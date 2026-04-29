import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'setrules',
    alias: ['setreglas', 'setnormas', 'configurarreglas'],
    category: 'owner',
    description: 'Establece reglas o normas personalizadas para el bot',
    usage: '.setrules <texto>',
    example: '.setrules 1. No hacer spam\n2. Respetar a los demás',
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
    const text = m.text?.trim() || (m.quoted?.body || m.quoted?.text || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Por favor, ingresa el nuevo texto de las reglas.\n\n` +
            `\`Ejemplo:\`\n` +
            `\`${m.prefix}setrules 1. No hacer spam\\n2. Respetar a los demás\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʀᴇɢʟᴀs ᴀᴄᴛᴜᴀʟɪᴢᴀᴅᴀs*\n\n` +
        `> ¡Las normas del bot se han cambiado correctamente!\n` +
        `> Escribe \`${m.prefix}rules\` para verlas.`
    )
}

export { pluginConfig as config, handler }
