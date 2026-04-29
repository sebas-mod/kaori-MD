import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'basura',
    alias: ['limpiabasura', 'limpiartemp', 'deltemp', 'borrartemp'],
    category: 'owner',
    description: 'Elimina todos los archivos temporales de la carpeta temp',
    usage: '.basura',
    example: '.basura',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const tempPath = path.join(process.cwd(), 'temp')

    if (!fs.existsSync(tempPath)) {
        return m.reply('❌ ¡La carpeta temp no fue encontrada!')
    }

    await m.react('🗑️')

    try {
        const files = fs.readdirSync(tempPath)

        if (!files.length) {
            return m.reply('📁 ¡La carpeta temp ya está vacía!')
        }

        let deleted = 0

        for (const file of files) {
            const filePath = path.join(tempPath, file)

            // Elimina archivos o carpetas de forma recursiva
            fs.rmSync(filePath, { recursive: true, force: true })
            deleted++
        }

        await m.react('✅')
        await m.reply(
            `🗑️ *¡ᴛᴇᴍᴘ ʟɪᴍᴘɪᴀᴅᴏ!*\n\n` +
            `> Total de archivos/carpetas eliminados: *${deleted}*`
        )

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
