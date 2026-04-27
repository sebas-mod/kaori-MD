const pluginConfig = {
    name: 'borrarasistencia',
    alias: ['eliminarasistencia', 'cerrarasistencia', 'resetasistencia', 'tutupabsen'],
    category: 'group',
    description: 'Borra o cierra la sesión de asistencia actual (Solo Admins)',
    usage: '.borrarasistencia',
    example: '.borrarasistencia',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

if (!global.absensi) global.absensi = {}

async function handler(m) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *sɪɴ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> No hay ninguna sesión de asistencia activa en este grupo.`
        )
    }
    
    const absen = global.absensi[chatId]
    const totalPeserta = absen.peserta.length
    
    // Eliminar la sesión de la memoria global
    delete global.absensi[chatId]
    
    await m.reply(
        `✅ *¡ᴀsɪsᴛᴇɴᴄɪᴀ ᴄᴇʀʀᴀᴅᴀ!*\n\n` +
        `📌 *Asunto:* ${absen.keterangan}\n` +
        `👥 *Total presentes:* ${totalPeserta}\n\n` +
        `> La sesión de asistencia ha sido eliminada correctamente.\n` +
        `_Powered by KAORI MD_`
    )
}

export { pluginConfig as config, handler }
