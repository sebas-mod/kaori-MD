import moment from 'moment-timezone'
import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'guardardb',
    alias: ['backupdb', 'downloaddb', 'getdb', 'respaldardb'],
    category: 'owner',
    description: 'Descarga el archivo de la base de datos actual',
    usage: '.guardardb',
    example: '.guardardb',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el Propietario!*')
    }

    const dbPath = path.join(process.cwd(), 'database', 'db.json')

    if (!fs.existsSync(dbPath)) {
        return m.reply(`❌ ¡El archivo de la base de datos no fue encontrado!`)
    }

    try {
        const stats = fs.statSync(dbPath)
        const data = fs.readFileSync(dbPath)
        
        // Ajustado a una zona horaria de referencia (puedes cambiarla a la tuya, ej: 'America/Mexico_City')
        const now = moment().tz('America/Argentina/Buenos_Aires')
        const timestamp = now.format('YYYY-MM-DD_HH-mm-ss')
        const fileName = `respaldo_db_${timestamp}.json`

        await sock.sendMessage(m.chat, {
            document: data,
            fileName: fileName,
            mimetype: 'application/json',
            caption: `📦 *ʀᴇsᴘᴀʟᴅᴏ ᴅᴇ ʙᴀsᴇ ᴅᴇ ᴅᴀᴛᴏs*\n\n` +
                `╭┈┈⬡「 📋 *ɪɴғᴏ* 」\n` +
                `┃ 📁 Archivo: \`db.json\`\n` +
                `┃ 📊 Tamaño: \`${(stats.size / 1024).toFixed(2)} KB\`\n` +
                `┃ 📅 Fecha: \`${now.format('DD/MM/YYYY')}\`\n` +
                `┃ ⏰ Hora: \`${now.format('HH:mm:ss')}\`\n` +
                `╰┈┈┈┈┈┈┈┈⬡`
        }, { quoted: m })

    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
