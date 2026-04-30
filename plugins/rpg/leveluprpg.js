import { getDatabase } from '../../src/lib/ourin-database.js'
import { getRpgContextInfo } from '../../src/lib/ourin-context.js'

const pluginConfig = {
    name: 'notiflevelup',
    alias: ['leveluprpg', 'lvluprpg', 'rpglevelup', 'notiflvl'],
    category: 'rpg',
    description: 'Activa o desactiva las notificaciones de subida de nivel RPG',
    usage: '.notiflevelup <on/off>',
    example: '.notiflevelup on',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const args = m.args || []
    const sub = args[0]?.toLowerCase()
    
    if (!user.settings) user.settings = {}
    
    if (sub === 'on') {
        user.settings.rpgLevelupNotif = true
        db.save()
        return m.reply(
            `✅ *𝐍𝐎𝐓𝐈𝐅. 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏 𝐑𝐏𝐆*\n\n` +
            `> Estado: *ACTIVO* ✅\n` +
            `> ¡Te avisaré cada vez que subas de nivel en el RPG!`
        )
    }
    
    if (sub === 'off') {
        user.settings.rpgLevelupNotif = false
        db.save()
        return m.reply(
            `❌ *𝐍𝐎𝐓𝐈𝐅. 𝐋𝐄𝐕𝐄𝐋 𝐔𝐏 𝐑𝐏𝐆*\n\n` +
            `> Estado: *DESACTIVADO* ❌\n` +
            `> Ya no recibirás avisos cuando subas de nivel.`
        )
    }
    
    const status = user.settings.rpgLevelupNotif !== false ? 'ACTIVO ✅' : 'DESACTIVADO ❌'
    return m.reply(
        `🔔 *𝐀𝐉𝐔𝐒𝐓𝐄 𝐃𝐄 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀𝐂𝐈𝐎𝐍𝐄𝐒*\n\n` +
        `> Estado actual: *${status}*\n\n` +
        `╭┈┈⬡「 📋 *MODO DE USO* 」\n` +
        `┃ > \`.notiflevelup on\` - Activar\n` +
        `┃ > \`.notiflevelup off\` - Desactivar\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> _Configuración de 𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃_`
    )
}

export { pluginConfig as config, handler }
