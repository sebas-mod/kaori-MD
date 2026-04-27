import moment from 'moment-timezone'
import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'botafk',
    alias: ['afkbot', 'afkmode'],
    category: 'owner',
    description: 'Modo AFK para el bot: el bot no responderá comandos, solo enviará un mensaje de AFK',
    usage: '.botafk <razón>',
    example: '.botafk Tomando un descanso',
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
    const currentAfk = db.setting('botAfk')
    
    if (currentAfk && currentAfk.active) {
        db.setting('botAfk', { active: false })
        await m.react('✅')
        
        const afkDuration = Date.now() - currentAfk.since
        const duration = formatDuration(afkDuration)
        
        return m.reply(
            `✅ *BOT DE NUEVO ONLINE*\n\n` +
            `╭┈┈⬡「 📊 *ESTADÍSTICAS AFK* 」\n` +
            `┃ ⏱️ Duración: \`${duration}\`\n` +
            `┃ 📝 Razón: \`${currentAfk.reason || '-'}\`\n` +
            `╰┈┈⬡\n\n` +
            `> ¡El bot está listo para recibir comandos!`
        )
    } else {
        const reason = m.args.join(' ') || 'AFK'
        
        db.setting('botAfk', {
            active: true,
            reason: reason,
            since: Date.now()
        })
        
        await m.react('💤')
        return m.reply(
            `💤 *MODO AFK ACTIVADO*\n\n` +
            `╭┈┈⬡「 📋 *INFO* 」\n` +
            `┃ 📝 Razón: \`${reason}\`\n` +
            `┃ ⏰ Desde las: \`${moment().tz('America/Argentina/Buenos_Aires').format('HH:mm:ss')}\`\n` +
            `╰┈┈⬡\n\n` +
            `╭┈┈⬡「 🔒 *ACCESO* 」\n` +
            `┃ ✅ Propietario (Owner)\n` +
            `┃ ✅ El propio bot (fromMe)\n` +
            `┃ ❌ Todos los demás usuarios\n` +
            `╰┈┈⬡\n\n` +
            `> Otros usuarios recibirán un mensaje de AFK\n` +
            `> Escribe \`${m.prefix}botafk\` para volver a estar online`
        )
    }
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} día(s) ${hours % 24} hora(s)`
    if (hours > 0) return `${hours} hora(s) ${minutes % 60} minuto(s)`
    if (minutes > 0) return `${minutes} minuto(s) ${seconds % 60} segundo(s)`
    return `${seconds} segundo(s)`
}

export { pluginConfig as config, handler }
