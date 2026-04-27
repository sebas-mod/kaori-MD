import fs from 'fs'
import path from 'path'
import axios from 'axios'
import os from 'os'
import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import util from 'util'

const pluginConfig = {
    name: 'exec',
    alias: ['>', 'run', 'ejecutar'],
    category: 'owner',
    description: 'Ejecuta código JS desde un mensaje respondido (Solo Propietario)',
    usage: '.> (responder a un mensaje con código)',
    example: '.> (reply)',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, store }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el Propietario puede usar esto!*')
    }

    let code = null

    // Intenta obtener el código del mensaje respondido
    if (m.quoted) {
        code = m.quoted.text || m.quoted.body || m.quoted.caption
    }

    // Si no hay respuesta, intenta obtenerlo de los argumentos directos
    if (!code) {
        code = m.fullArgs?.trim() || m.text?.trim()
    }

    if (!code) {
        return m.reply(
            `⚙️ *EJECUTOR EXEC*\n\n` +
            `> ¡Responde a un mensaje que contenga código JavaScript!\n\n` +
            `*O también:*\n` +
            `> .> <code>\n\n` +
            `*Ejemplo:*\n` +
            `> Responde a: \`return m.chat\`\n` +
            `> Luego escribe: .>`
        )
    }

    code = code.trim()

    // Limpieza de bloques de código Markdown
    if (code.startsWith('```') && code.endsWith('```')) {
        code = code.slice(3, -3)
        if (code.startsWith('javascript') || code.startsWith('js')) {
            code = code.replace(/^(javascript|js)\n?/, '')
        }
    }

    const db = getDatabase()

    let result
    let isError = false

    try {
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

    if (output.length > 3000) {
        output = output.slice(0, 3000) + '\n\n... (recortado)'
    }

    const status = isError ? '❌ Error' : '✅ Éxito'
    const type = isError ? result?.name || 'Error' : typeof result

    // Vista previa del código ejecutado
    const codePreview = code.length > 100 ? code.slice(0, 100) + '...' : code

    await m.reply(
        `⚙️ *RESULTADO EXEC*\n\n` +
        `╭┈┈⬡「 📋 *CÓDIGO* 」\n` +
        `┃ \`${codePreview}\`\n` +
        `├┈┈⬡「 📊 *RESULTADO* 」\n` +
        `┃ Estado: ${status}\n` +
        `┃ Tipo: ${type}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `\`\`\`${output}\`\`\``
    )
}

export { pluginConfig as config, handler }
