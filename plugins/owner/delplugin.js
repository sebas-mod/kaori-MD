import fs from 'fs'
import path from 'path'
import { unloadPlugin } from '../../src/lib/ourin-plugins.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'delplugin',
    alias: ['delpl', 'borrarplugin', 'removeplugin', 'eliminarplugin'],
    category: 'owner',
    description: 'Elimina un archivo de plugin basado en su nombre',
    usage: '.delplugin <nombre>',
    example: '.delplugin anime_search',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function findPluginFile(pluginsDir, name) {
    const folders = fs.readdirSync(pluginsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)

    for (const folder of folders) {
        const folderPath = path.join(pluginsDir, folder)
        const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))

        for (const file of files) {
            const baseName = file.replace('.js', '')
            if (baseName.toLowerCase() === name.toLowerCase()) {
                return { folder, file, path: path.join(folderPath, file) }
            }
        }
    }

    return null
}

async function handler(m, { sock }) {
    const name = m.fullArgs?.trim() || m.args?.[0]

    if (!name) {
        return m.reply(
            `🗑️ *ELIMINAR PLUGIN*\n\n` +
            `Elimina un plugin del sistema permanentemente.\n\n` +
            `*Ejemplo:*\n` +
            `\`${m.prefix}delplugin nombre_del_plugin\``
        )
    }

    await m.react('🕕')

    try {
        const pluginsDir = path.join(process.cwd(), 'plugins')
        const found = findPluginFile(pluginsDir, name)

        if (!found) {
            await m.react('❌')
            return m.reply(`❌ *ERROR*\n\nEl plugin \`${name}\` no fue encontrado en ninguna carpeta.`)
        }

        let unloadResult = { success: false }
        try { 
            // Intentamos descargar el plugin de la memoria primero
            unloadResult = unloadPlugin(name) || { success: true } 
        } catch (e) {
            console.error('[DelPlugin] Error al descargar:', e)
        }

        // Borramos el archivo físico
        fs.unlinkSync(found.path)

        await m.react('✅')
        return m.reply(
            `✅ *PLUGIN ELIMINADO*\n\n` +
            `╭─〔 *DETALLES* 〕───⬣\n` +
            `│ Archivo: \`${found.file}\`\n` +
            `│ Carpeta: \`${found.folder}\`\n` +
            `│ Estado: ${unloadResult.success ? '✅ Descargado' : '⚠️ Pendiente'}\n` +
            `╰───────⬣\n\n` +
            `¡El plugin ha sido borrado del disco y ya no está activo!`
        )

    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
