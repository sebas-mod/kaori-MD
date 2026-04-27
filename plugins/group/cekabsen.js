import moment from 'moment-timezone'
import config from '../../config.js'

const pluginConfig = {
    name: 'cekabsen',
    alias: ['listabsen', 'listaasistencia', 'verasistencia'],
    category: 'group',
    description: 'Muestra la lista de participantes que ya han marcado asistencia',
    usage: '.cekabsen',
    example: '.cekabsen',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

if (!global.absensi) global.absensi = {}

async function handler(m, { sock }) {
    const chatId = m.chat
    
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *ɴᴏ ʜᴀʏ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `> ¡No hay ninguna sesión de asistencia activa en este grupo!\n\n` +
            `> Un administrador puede iniciar una con:\n` +
            `> *.mulaiabsen [descripción]*`
        )
    }

    const absen = global.absensi[chatId]
    // Ajustado a la zona horaria de Buenos Aires para coincidir con tu ubicación
    const now = moment().tz('America/Argentina/Buenos_Aires')
    const dateStr = now.format('D [de] MMMM YYYY')
    const createdDate = moment(absen.createdAt).tz('America/Argentina/Buenos_Aires')
    const timeStr = createdDate.format('HH:mm')

    let list = '┃ _Aún no hay participantes anotados_'
    if (absen.peserta.length > 0) {
        list = absen.peserta
            .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
            .join('\n')
    }

    const contextName = config.bot?.name || 'ᴋᴀᴏʀɪ ᴍᴅ'

    await m.reply(`📋 *ʟɪsᴛᴀ ᴅᴇ ᴀsɪsᴛᴇɴᴄɪᴀ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 *Asunto:* ${absen.keterangan}\n` +
            `┃ 📅 *Fecha:* ${dateStr}\n` +
            `┃ ⏰ *Inició:* ${timeStr} hs\n` +
            `┃ 👑 *Por:* @${absen.createdBy.split('@')[0]}\n` +
            `├┈┈⬡「 👥 *ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛᴇs (${absen.peserta.length})* 」\n` +
            `${list}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Escribe *${m.prefix}absen* para marcar tu presencia.`, 
            { mentions: [...absen.peserta, absen.createdBy] }
    )
}

export { pluginConfig as config, handler }
