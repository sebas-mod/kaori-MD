import config from '../../config.js'

const pluginConfig = {
    name: 'iniciarlista',
    alias: ['startabsen', 'abrirlista', 'comenzarlista', 'lista'],
    category: 'group',
    description: 'Inicia una sesión de asistencia en el grupo (Solo Admins)',
    usage: '.iniciarlista [motivo/título]',
    example: '.iniciarlista Reunión de Staff',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

// Inicialización global para manejar las listas activas
if (!global.absensi) global.absensi = {}

async function handler(m, { sock }) {
    const chatId = m.chat
    
    if (global.absensi[chatId]) {
        return m.reply(
            `❌ *ʟᴀ ʟɪsᴛᴀ ʏᴀ ᴇsᴛᴀ́ ᴀᴄᴛɪᴠᴀ*\n\n` +
            `> Ya hay una sesión de asistencia en curso en este grupo.\n\n` +
            `> Usa \`${m.prefix}borrarlista\` para eliminarla\n` +
            `> o \`${m.prefix}verlista\` para ver el estado actual.`
        )
    }
    
    // Obtenemos el texto del motivo, si no existe ponemos uno por defecto
    const keterangan = m.fullArgs?.trim() || 'Asistencia Diaria'
    
    global.absensi[chatId] = {
        keterangan: keterangan,
        createdBy: m.sender,
        createdAt: new Date().toISOString(),
        peserta: []
    }
    
    const botName = '𝐊𝐀𝐎𝐑𝐈 𝐌𝐃'
    
    await m.reply(
        `📋 *ʟɪsᴛᴀ ᴅᴇ ᴀsɪsᴛᴇɴᴄɪᴀ ɪɴɪᴄɪᴀᴅᴀ*\n\n` +
        `「 📋 *ɪɴғᴏ* 」\n` +
        `📝 *Motivo:* ${keterangan}\n` +
        `👑 *Iniciado por:* @${m.sender.split('@')[0]}\n` +
        `👥 *Presentes:* 0\n\n` +
        `Para anotarte en la lista, escribe: *${m.prefix}presente*\n` +
        `Para ver la lista actual, escribe: *${m.prefix}verlista*\n` +
        `Para finalizar la lista, escribe: *${m.prefix}borrarlista*\n\n` +
        `*${botName} — Gestión de Grupos*`, 
        { mentions: [m.sender] }
    )
}

export { pluginConfig as config, handler }
