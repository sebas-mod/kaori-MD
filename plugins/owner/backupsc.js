import moment from 'moment-timezone'
import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'backupsc',
    alias: ['respaldo', 'backupscript', 'backupsource'],
    category: 'owner',
    description: 'Realiza un respaldo del código fuente (script) del bot en formato ZIP',
    usage: '.backupsc',
    example: '.backupsc',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const EXCLUDE_DIRS = new Set([
    'node_modules', '.git', 'storage', 'storages', 'tmp', 'temp', '.cache',
    'logs', 'sessions', 'session', 'auth', '.npm', '.yarn', 'dist', 'coverage',
    '__pycache__', 'autoreply_media', 'build', 'Baileys-master', 'ourin',
    'ALYA V8', 'DHX-pro', 'RTXZY-MD-pro', 'BETABOTZ-MD2-pro', 'KazzTzyCanvs',
    'starseed-main', 'OurinGlitch-Baileys-main', 'Script Lyrra MD V7',
    'Sky Md V2', 'Marin Kitagawa MD V1.0 (1)', 'AmbaCrash v19 Free (1)',
    '@blckrose', 'database', 'data', 'backup', 'animation', '_tools',
    'case', 'PUSHKONTAK', '.vscode', '.gemini',
])

const EXCLUDE_EXTENSIONS = new Set([
    '.zip', '.tar.gz', '.7z', '.mp4', '.mp3', '.wav', '.avi', '.mkv',
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.ico', '.svg',
    '.traineddata', '.log', '.bak', '.lock',
])

const EXCLUDE_FILES = new Set([
    '.env', '.env.local', 'creds.json', 'package-lock.json', 'yarn.lock',
    '.npmrc', '.gitignore', 'boot_final.log', 'bot_log.txt', 'error.txt',
    'changelog.txt', 'UPDATE.txt', 'CHANGELOG.md',
])

const MAX_FILE_SIZE = 2 * 1024 * 1024

function shouldExclude(filePath, basePath) {
    const relativePath = path.relative(basePath, filePath)
    const parts = relativePath.split(path.sep)
    for (const part of parts) {
        if (EXCLUDE_DIRS.has(part)) return true
    }
    const fileName = path.basename(filePath)
    if (EXCLUDE_FILES.has(fileName)) return true
    const ext = path.extname(fileName).toLowerCase()
    if (EXCLUDE_EXTENSIONS.has(ext)) return true
    if (fileName.endsWith('.tar.gz')) return true
    return false
}

async function handler(m, { sock }) {
    await m.react('🕕')
    await m.reply(`📦 *RESPALDO DEL SCRIPT*\n\n> Procesando el respaldo...\n> Por favor, espera un momento...`)
    
    try {
        const projectRoot = process.cwd()
        // Ajustado a una zona horaria común para hispanohablantes o se puede usar la local
        const timestamp = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD_HH-mm-ss')
        const botName = config.bot?.name?.replace(/[^a-zA-Z0-9]/g, '') || 'OurinBot'
        const zipFileName = `${botName}_respaldo_${timestamp}.zip`
        const tmpDir = path.join(projectRoot, 'tmp')
        
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })
        const zipFilePath = path.join(tmpDir, zipFileName)

        const output = fs.createWriteStream(zipFilePath)
        const archive = archiver('zip', { zlib: { level: 9 } })

        await new Promise((resolve, reject) => {
            output.on('close', resolve)
            archive.on('error', reject)
            archive.pipe(output)

            function addDirectory(dirPath) {
                try {
                    const items = fs.readdirSync(dirPath)
                    for (const item of items) {
                        const fullPath = path.join(dirPath, item)
                        if (shouldExclude(fullPath, projectRoot)) continue
                        try {
                            const stat = fs.statSync(fullPath)
                            if (stat.isDirectory()) {
                                addDirectory(fullPath)
                            } else if (stat.isFile() && stat.size < MAX_FILE_SIZE) {
                                const relativePath = path.relative(projectRoot, fullPath)
                                archive.file(fullPath, { name: relativePath })
                            }
                        } catch {}
                    }
                } catch {}
            }

            addDirectory(projectRoot)
            archive.finalize()
        })

        const stats = fs.statSync(zipFilePath)
        const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2)
        const saluranId = config.saluran?.id || '120363208449943317@newsletter'
        const saluranName = config.saluran?.name || config.bot?.name || 'Ourin-AI'

        await sock.sendMessage(m.chat, {
            document: fs.readFileSync(zipFilePath),
            fileName: zipFileName,
            mimetype: 'application/zip',
            caption:
                `✅ *RESPALDO COMPLETADO*\n\n` +
                `╭┈┈⬡「 📋 *DETALLES* 」\n` +
                `┃ 📝 Nombre: \`${zipFileName}\`\n` +
                `┃ 📊 Tamaño: \`${fileSizeMB} MB\`\n` +
                `┃ 📅 Fecha: \`${moment().tz('America/Argentina/Buenos_Aires').format('DD/MM/YYYY')}\`\n` +
                `╰┈┈⬡`,
            contextInfo: {
                forwardingScore: 9999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127
                }
            }
        }, { quoted: m })

        await m.react('✅')

        try { fs.unlinkSync(zipFilePath) } catch {}
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
