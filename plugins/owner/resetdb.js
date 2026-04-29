import fs from 'fs'
import path from 'path'
import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'resetdb',
    alias: ['borrardb', 'limpiardb', 'resetear-datos'],
    category: 'owner',
    description: 'Restablece todos los datos de la base de datos',
    usage: '.resetdb [confirm]',
    example: '.resetdb confirm',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

if (!global.resetDbPending) global.resetDbPending = {}

async function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el Propietario!*')
    }
    
    const confirm = m.args?.[0]?.toLowerCase()
    
    if (confirm !== 'confirm') {
        global.resetDbPending[m.sender] = Date.now()
        
        return m.reply(
            `⚠️ *¡ᴀᴅᴠᴇʀᴛᴇɴᴄɪᴀ!*\n\n` +
            `> Esto eliminará TODOS los datos:\n` +
            `> • Datos de usuarios\n` +
            `> • Datos de grupos\n` +
            `> • Datos de clanes\n` +
            `> • Todas las estadísticas\n\n` +
            `╭┈┈⬡「 ⚠️ *ᴄᴏɴғɪʀᴍᴀᴄɪᴏ́ɴ* 」\n` +
            `┃ Escribe: *.resetdb confirm*\n` +
            `┃ dentro de los próximos 60 segundos\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> ❌ ¡Esta acción NO SE PUEDE deshacer!`
        )
    }
    
    const pending = global.resetDbPending[m.sender]
    if (!pending || (Date.now() - pending) > 60000) {
        delete global.resetDbPending[m.sender]
        return m.reply(`❌ ¡Tiempo agotado! Escribe *.resetdb* de nuevo para empezar.`)
    }
    
    delete global.resetDbPending[m.sender]
    
    try {
        const dbPath = path.join(process.cwd(), 'database', 'db.json')
        const backupPath = path.join(process.cwd(), 'database', `db_backup_${Date.now()}.json`)
        
        // Crear una copia de seguridad antes de borrar todo, por seguridad
        if (fs.existsSync(dbPath)) {
            fs.copyFileSync(dbPath, backupPath)
        }
        
        const db = getDatabase()
        
        let userCount = 0
        let groupCount = 0
        let clanCount = 0
        
        if (db.db?.data?.users) {
            userCount = Object.keys(db.db.data.users).length
            db.db.data.users = {}
        }
        
        if (db.db?.data?.groups) {
            groupCount = Object.keys(db.db.data.groups).length
            db.db.data.groups = {}
        }
        
        if (db.db?.data?.clans) {
            clanCount = Object.keys(db.db.data.clans).length
            db.db.data.clans = {}
        }
        
        await db.save()
        
        await m.reply(
            `✅ *¡ʙᴀsᴇ ᴅᴇ ᴅᴀᴛᴏs ʀᴇsᴛᴀʙʟᴇᴄɪᴅᴀ!*\n\n` +
            `╭┈┈⬡「 📊 *ᴅᴀᴛᴏs ᴇʟɪᴍɪɴᴀᴅᴏs* 」\n` +
            `┃ 👤 Usuarios: ${userCount}\n` +
            `┃ 👥 Grupos: ${groupCount}\n` +
            `┃ ⚔️ Clanes: ${clanCount}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> Copia de seguridad guardada en:\n` +
            `> \`${path.basename(backupPath)}\``
        )
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
