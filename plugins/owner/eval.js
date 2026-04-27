import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import util from 'util'

const pluginConfig = {
    name: 'eval',
    alias: ['$', 'ev', 'evaluate', '=>'],
    category: 'owner',
    description: 'Ejecuta código JavaScript (Solo Propietario)',
    usage: '=> <code> o .$ <code>',
    example: '=> m.chat',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
    noPrefix: ['=>'],
    customTrigger: (body) => body?.startsWith('=>')
}

async function handler(m, { sock, store }) {
    // Verificación de seguridad adicional
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el Propietario puede usar esto!*')
    }

    const code = m.fullArgs?.trim() || m.text?.trim()

    if (!code) {
        return m.reply(
            `⚙️ *EJECUTOR EVAL*\n\n` +
            `> ¡Ingresa el código JavaScript que deseas ejecutar!\n\n` +
            `*Ejemplos:*\n` +
            `> .$ 1 + 1\n` +
            `> .$ m.chat\n` +
            `> .$ db.getUser(m.sender)`
        )
    }

    const db = getDatabase()

    let result
    let isError = false

    try {
        // Ejecución del código dentro de una función asíncrona
        result = await eval(`(async () => { ${code} })()`)
    } catch (e) {
        isError = true
        result = e
    }

    let output
    if (typeof result === 'undefined') {
        output = 'undefined'
    } else if (result === null) {
        output = 'null'
    } else if (typeof result === 'object') {
        try {
            output = util.inspect(result, { depth: 2, maxArrayLength: 50 })
        } catch {
            output = String(result)
        }
    } else {
        output = String(result)
    }

    // Limitar la longitud de la respuesta para evitar errores de envío en WA
    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (recortado)'
    }

    const status = isError ? '❌ Error' : '✅ Éxito'
    const type = isError ? result?.name || 'Error' : typeof result

    await m.reply(
        `⚙️ *RESULTADO EVAL*\n\n` +
        `╭┈┈⬡「 📋 *INFO* 」\n` +
        `┃ Estado: ${status}\n` +
        `┃ Tipo: ${type}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `\`\`\`${output}\`\`\``
    )
}

export { pluginConfig as config, handler }
