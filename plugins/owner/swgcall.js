import { fileTypeFromBuffer } from 'file-type'
import fs from 'fs'
import path from 'path'
import { config } from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const botConfig = config

const pluginConfig = {
    name: 'swgcall',
    alias: ['swgctodos', 'difundirestado', 'swgcbc', 'historiatodogrupo'],
    category: 'owner',
    description: 'Publica un Estado/Historia de Grupo en TODOS los grupos a la vez (borde verde)',
    usage: '.swgcall <texto> o responde a un archivo multimedia',
    example: '.swgcall ¡Anuncio importante!',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function sendGroupStatus(sock, jid, content) {
    return await sock.sendMessage(jid, { groupStatusMessage: content })
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const text = m.text || ''

    if (args[0] === '--yes') {
        const pending = global._swgcallPending?.get(m.sender)
        if (!pending) {
            return m.reply(`⚠️ *No hay datos pendientes. Envía de nuevo el medio + .swgcall*`)
        }

        const { rawContent, groups, tempFile } = pending

        await m.react('🔄')

        let content = {}
        if (rawContent.image) content = { image: rawContent.image, caption: rawContent.caption || '' }
        else if (rawContent.video) content = { video: rawContent.video, caption: rawContent.caption || '' }
        else if (rawContent.audio) content = { audio: rawContent.audio, mimetype: rawContent.mimetype || 'audio/mpeg', ptt: rawContent.ptt || false }
        else if (rawContent.text) content = { text: rawContent.text }

        let success = 0
        let failed = 0
        const failedGroups = []
        const total = groups.length
        const delay = (ms) => new Promise(r => setTimeout(r, ms))

        for (let i = 0; i < groups.length; i++) {
            const [groupId, meta] = groups[i]
            try {
                await sendGroupStatus(sock, groupId, content)
                success++
            } catch (e) {
                failed++
                failedGroups.push(meta.subject || groupId)
            }

            // Delay para evitar spam block
            if ((i + 1) % 5 === 0) {
                await delay(2000)
            } else {
                await delay(500)
            }
        }

        global._swgcallPending.delete(m.sender)
        if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile) } catch {}
        }

        let report = `✅ *ᴅɪꜰᴜsɪóɴ sᴡɢᴄ ꜰɪɴᴀʟɪᴢᴀᴅᴀ*\n\n` +
            `> Total: *${total}* grupos\n` +
            `> Éxito: *${success}* ✅\n` +
            `> Fallidos: *${failed}* ❌`

        if (failedGroups.length > 0) {
            report += `\n\n*Grupos fallidos:*\n` + failedGroups.map(g => `> • ${g}`).join('\n')
        }

        await m.reply(report)
        await m.react('✅')
        return
    }

    let rawContent = {}
    let buffer, ext, tempFile
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const source = m.quoted && (m.quoted.isImage || m.quoted.isVideo || m.quoted.isAudio || m.quoted.mimetype?.startsWith('audio'))
        ? m.quoted
        : (m.isImage || m.isVideo || m.isAudio || m.mimetype?.startsWith('audio'))
            ? m
            : null

    if (source) {
        try {
            buffer = await source.download()
            if (!buffer) return m.reply(`❌ Error al obtener el archivo multimedia.`)

            const fileType = await fileTypeFromBuffer(buffer)
            ext = fileType?.ext || 'bin'
            tempFile = path.join(tempDir, `swgcall_${Date.now()}.${ext}`)
            fs.writeFileSync(tempFile, buffer)

            const isImage = source.isImage || fileType?.mime?.startsWith('image')
            const isVideo = source.isVideo || fileType?.mime?.startsWith('video')
            const isAudio = source.isAudio || fileType?.mime?.startsWith('audio') || source.mimetype?.startsWith('audio')

            if (isImage) {
                rawContent.image = buffer
                rawContent.caption = text || ''
            } else if (isVideo) {
                rawContent.video = buffer
                rawContent.caption = text || ''
            } else if (isAudio) {
                rawContent.audio = buffer
                rawContent.mimetype = fileType?.mime || source.mimetype || 'audio/mpeg'
                rawContent.ptt = source.msg?.ptt || false
            }
        } catch {
            return m.reply(te(m.prefix, m.command, m.pushName))
        }
    } else if (text && text.trim()) {
        rawContent.text = text
        rawContent.font = 0
        rawContent.backgroundColor = '#128C7E'
    } else {
        return m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> \`${m.prefix}swgcall texto\` - Historia de texto a todos los grupos\n` +
            `> Responde a imagen/video/audio + \`${m.prefix}swgcall\`\n` +
            `> Envía imagen/video + texto \`${m.prefix}swgcall\`\n\n` +
            `⚠️ _¡Esta función publicará la historia en TODOS los grupos!_`
        )
    }

    try {
        global.isFetchingGroups = true
        const groups = await sock.groupFetchAllParticipating()
        global.isFetchingGroups = false
        const groupList = Object.entries(groups)

        if (groupList.length === 0) {
            return m.reply(`⚠️ *El bot no está en ningún grupo.*`)
        }

        if (!global._swgcallPending) global._swgcallPending = new Map()
        global._swgcallPending.set(m.sender, {
            rawContent,
            groups: groupList,
            tempFile,
            timestamp: Date.now()
        })

        const mediaType = rawContent.text ? 'Texto'
            : rawContent.image ? 'Imagen'
            : rawContent.video ? 'Video'
            : rawContent.audio ? (rawContent.ptt ? 'Nota de Voz' : 'Audio')
            : 'Desconocido'

        let thumbnail = null
        try { thumbnail = fs.readFileSync('./assets/images/ourin2.jpg') } catch {}

        const estimatedTime = Math.ceil(groupList.length * 1.5)

        await sock.sendMessage(m.chat, {
            text: `📢 *ᴄᴏɴꜰɪʀᴍᴀᴄɪóɴ ᴅᴇ ᴅɪꜰᴜsɪóɴ sᴡɢᴄ*\n\n` +
                  `> Multimedia: *${mediaType}*\n` +
                  `> Total Grupos: *${groupList.length}*\n` +
                  `> Estimación: *~${estimatedTime} segundos*\n\n` +
                  `⚠️ _¡La historia se publicará en TODOS los grupos!_\n` +
                  `_Presiona confirmar para continuar._`,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: botConfig?.saluran?.id,
                    newsletterName: botConfig?.saluran?.name
                },
                externalAdReply: thumbnail ? {
                    title: botConfig.bot?.name || 'Ourin MD',
                    body: 'DIFUSIÓN SWGC',
                    thumbnail,
                    sourceUrl: botConfig.saluran?.link || '',
                    mediaType: 1,
                    renderLargerThumbnail: false
                } : undefined
            },
            footer: 'OURIN MD',
            interactiveButtons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: `✅ Enviar a ${groupList.length} Grupos`,
                        id: `${m.prefix}swgcall --yes`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '❌ Cancelar',
                        id: `${m.prefix}cancelswgcall`
                    })
                }
            ]
        })
    } catch (error) {
        await m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> Error al obtener la lista de grupos.\n> _${error.message}_`)
        if (tempFile && fs.existsSync(tempFile)) {
            try { fs.unlinkSync(tempFile) } catch {}
        }
        global._swgcallPending?.delete(m.sender)
    }
}

export { pluginConfig as config, handler }
