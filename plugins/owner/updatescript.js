import fs from 'fs'
import path from 'path'
import { execSync, exec } from 'child_process'

const pluginConfig = {
    name: 'actualizarscript',
    alias: ['updatebot', 'actualizarbot', 'updatesc'],
    category: 'owner',
    description: 'Actualiza el script automáticamente desde GitHub con copia de seguridad',
    usage: '.actualizarscript',
    example: '.actualizarscript',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const REPO_URL = 'https://github.com/LuckyArch/OurinMD.git'
const BRANCH = 'main'

const ELEMENTOS_A_PRESERVAR = [
    'config.js',
    'db.json',
    'sessions',
    'storage',
    'database',
    '.env',
    'node_modules',
    'tmp',
    'temp'
]

function formatearTamano(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function copiarRecursivoSync(src, dest, preservar, rutaRelativa = '') {
    const stats = fs.statSync(src)

    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
        const entradas = fs.readdirSync(src)
        let contador = 0

        for (const entrada of entradas) {
            const relPath = rutaRelativa ? `${rutaRelativa}/${entrada}` : entrada
            const deberiaPreservar = preservar.some(p => relPath === p || relPath.startsWith(p + '/'))

            if (deberiaPreservar) continue

            contador += copiarRecursivoSync(
                path.join(src, entrada),
                path.join(dest, entrada),
                preservar,
                relPath
            )
        }
        return contador
    }

    const dir = path.dirname(dest)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.copyFileSync(src, dest)
    return 1
}

function respaldarArchivo(baseDir, backupDir, rutaArchivo) {
    const src = path.join(baseDir, rutaArchivo)
    const dest = path.join(backupDir, rutaArchivo)

    if (!fs.existsSync(src)) return false

    const stat = fs.statSync(src)
    if (stat.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })
        const entradas = fs.readdirSync(src, { withFileTypes: true })
        for (const entrada of entradas) {
            respaldarArchivo(baseDir, backupDir, path.join(rutaArchivo, entrada.name))
        }
    } else {
        const dir = path.dirname(dest)
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        fs.copyFileSync(src, dest)
    }
    return true
}

function limpiarDirectorio(rutaDir) {
    if (fs.existsSync(rutaDir)) {
        fs.rmSync(rutaDir, { recursive: true, force: true })
    }
}

async function handler(m, { sock }) {
    const baseDir = process.cwd()
    const tempDir = path.join(baseDir, 'tmp', 'clonacion_actualizacion')
    const marcaTiempo = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
    const backupDir = path.join(baseDir, 'backup', `pre_actualizacion_${marcaTiempo}`)

    try {
        let tieneGit = false
        try {
            execSync('git --version', { stdio: 'pipe' })
            tieneGit = true
        } catch {}

        if (!tieneGit) {
            return m.reply(
                `❌ *ᴇʀʀᴏʀ*\n\n` +
                `> Git no está instalado en el servidor\n` +
                `> Instala git primero: \`apt install git\` / \`pkg install git\``
            )
        }

        await m.react('🕕')
        await m.reply(
            `🔄 *ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪóɴ ᴅᴇ sᴄʀɪᴘᴛ*\n\n` +
            `> Repo: \`LuckyArch/OurinMD\`\n` +
            `> Rama: \`${BRANCH}\`\n\n` +
            `📦 Paso 1/4 — Creando copia de seguridad...`
        )

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true })
        }

        const respaldados = []
        for (const item of ELEMENTOS_A_PRESERVAR) {
            if (item === 'node_modules' || item === 'tmp' || item === 'temp') continue
            if (respaldarArchivo(baseDir, backupDir, item)) {
                respaldados.push(item)
            }
        }

        await m.reply(
            `✅ *ʙᴀᴄᴋᴜᴘ ᴇxɪᴛᴏsᴏ*\n\n` +
            `> ${respaldados.length} elementos guardados\n` +
            `> ${respaldados.map(i => `\`${i}\``).join(', ')}\n\n` +
            `📥 Paso 2/4 — Clonando repositorio nuevo...`
        )

        limpiarDirectorio(tempDir)

        try {
            execSync(`git clone --depth 1 --branch ${BRANCH} ${REPO_URL} "${tempDir}"`, {
                stdio: 'pipe',
                timeout: 120000
            })
        } catch (e) {
            await m.react('❌')
            return m.reply(
                `❌ *ᴇʀʀᴏʀ ᴀʟ ᴄʟᴏɴᴀʀ*\n\n` +
                `> ${e.message}\n\n` +
                `💾 Backup guardado en: \`backup/pre_actualizacion_${marcaTiempo}\``
            )
        }

        const gitDir = path.join(tempDir, '.git')
        limpiarDirectorio(gitDir)

        await m.reply(
            `✅ *ᴄʟᴏɴᴀᴄɪóɴ ᴇxɪᴛᴏsᴀ*\n\n` +
            `> Script actualizado descargado\n\n` +
            `📋 Paso 3/4 — Copiando archivos nuevos...`
        )

        let archivosCopiados = 0
        try {
            archivosCopiados = copiarRecursivoSync(tempDir, baseDir, ELEMENTOS_A_PRESERVAR)
        } catch (e) {
            await m.react('❌')
            return m.reply(
                `❌ *ᴇʀʀᴏʀ ᴀʟ ᴄᴏᴘɪᴀʀ*\n\n` +
                `> ${e.message}\n\n` +
                `💾 Backup guardado en: \`backup/pre_actualizacion_${marcaTiempo}\``
            )
        }

        limpiarDirectorio(tempDir)

        await m.reply(
            `✅ *ᴄᴏᴘɪᴀ ᴇxɪᴛᴏsᴀ*\n\n` +
            `> ${archivosCopiados} archivos actualizados\n` +
            `> Los datos importantes no fueron sobrescritos\n\n` +
            `🔧 Paso 4/4 — Instalando dependencias...`
        )

        try {
            execSync('npm install --production', {
                cwd: baseDir,
                timeout: 300000,
                stdio: 'pipe'
            })
            await m.reply(`✅ *ɴᴘᴍ ɪɴsᴛᴀʟʟ ᴇxɪᴛᴏsᴏ*`)
        } catch (e) {
            await m.reply(
                `⚠️ *ɴᴘᴍ ɪɴsᴛᴀʟʟ ғᴀʟʟɪᴅᴏ*\n\n` +
                `> ${e.message?.slice(0, 200)}\n` +
                `> Ejecuta \`npm install\` manualmente`
            )
        }

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `✅ *ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪóɴ ғɪɴᴀʟɪᴢᴀᴅᴀ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜᴍᴇɴ* 」\n` +
                `┃ 📄 Archivos actualizados: \`${archivosCopiados}\`\n` +
                `┃ 💾 Backup: \`backup/pre_actualizacion_${marcaTiempo}\`\n` +
                `┃ 📦 Repo: \`LuckyArch/OurinMD\`\n` +
                `╰┈┈⬡\n\n` +
                `> El bot se reiniciará en 3 segundos...\n` +
                `> Si hay errores, restaura desde el backup.`
        }, { quoted: m })

        setTimeout(() => {
            process.exit(0)
        }, 3000)

    } catch (error) {
        limpiarDirectorio(tempDir)
        await m.react('❌')
        return m.reply(
            `❌ *ᴀᴄᴛᴜᴀʟɪᴢᴀᴄɪóɴ ғᴀʟʟɪᴅᴀ*\n\n` +
            `> ${error.message}\n\n` +
            `💾 Backup guardado en: \`backup/pre_actualizacion_${marcaTiempo}\``
        )
    }
}

export { pluginConfig as config, handler }
