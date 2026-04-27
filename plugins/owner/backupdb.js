import { sendStoreBackup, SCHEMA_VERSION } from '../../src/lib/ourin-store-backup.js'

const pluginConfig = {
    name: 'backupdb',
    alias: ['respaldodb', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Realiza un respaldo de la base de datos y lo envía al owner',
    usage: '.backupdb',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        '📁 database/*.json (todos los archivos JSON)',
        '📁 database/cpanel/* (datos de cPanel)',
        '📄 storage/database.json (BD principal)',
        '📄 db.json (BD raíz)',
        '📄 database/main/*.json (BD principal)',
        '📋 backup_metadata.json (info del esquema)'
    ]
    
    await m.reply(
        `🕕 *Creando respaldo de la base de datos...*\n\n` +
        `╭┈┈⬡「 📦 *CONTENIDO DEL RESPALDO* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await sendStoreBackup(sock)
    
    if (result.success) {
        await m.reply(
            `✅ *¡Respaldo Exitoso!*\n\n` +
            `📦 Tamaño: ${result.size}\n` +
            `📁 Archivos: ${result.files}\n` +
            `🔖 Esquema: v${SCHEMA_VERSION}\n\n` +
            `> Respaldo de tipo seguro, compatible con futuras actualizaciones.\n` +
            `> El archivo ha sido enviado al owner principal.`
        )
    } else {
        await m.reply(`❌ El respaldo falló: ${result.error}`)
    }
}

export { pluginConfig as config, handler }
