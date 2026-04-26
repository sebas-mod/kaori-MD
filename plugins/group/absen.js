import moment from 'moment-timezone'
import config from '../../config.js'

const pluginConfig = {
    name: 'asistir',
    alias: ['presente', 'asistir', 'anotarse'],
    category: 'group',
    description: 'Marcá tu presencia en la lista de asistencia',
    usage: '.asistir',
    example: '.asistir',
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
    
    // Verificar si hay una sesión activa
    if (!global.absensi[chatId]) {
        return m.reply(
            `❌ *NO HAY LISTA ACTIVA*\n\n` +
            `> No se inició ninguna lista de asistencia en este grupo.\n\n` +
            `> Un admin puede empezar una con:\n` +
            `> *${m.prefix}mulaiabsen [motivo]*`
        )
    }

    const absen = global.absensi[chatId]

    // Evitar duplicados
    if (absen.peserta.includes(m.sender)) {
        return m.reply(`❌ ¡Ya estás en la lista, che!`)
    }

    // Agregar al usuario y formatear fecha local
    absen.peserta.push(m.sender)
    const now = moment().tz('America/Argentina/Buenos_Aires')
    const dateStr = now.format('D [de] MMMM [de] YYYY')

    const list = absen.peserta
        .map((jid, i) => `┃ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n')

    await m.reply(
        `✅ *¡ANOTADO, @${m.sender.split('@')[0]}!*\n\n` +
        `MOTIVO: ${absen.keterangan}\n` +
        `╭┈┈⬡「 📋 INFO 」\n` +
        `┃ 📅 ${dateStr}\n` +
        `┃ 👥 Total: ${absen.peserta.length}\n` +
        `├┈┈⬡「 📝 *LISTA DE PRESENTES* 」\n` +
        `${list}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> _Escribí *${m.prefix}absen* para anotarte_\n` +
        `> _Escribí *${m.prefix}cekabsen* para ver la lista_`,
        { mentions: absen.peserta }
    )
}

export { pluginConfig as config, handler }
