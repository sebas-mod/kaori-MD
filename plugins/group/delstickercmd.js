import { getQuotedStickerHash, deleteStickerCommand, listStickerCommands, findByCommand } from '../../src/lib/ourin-sticker-command.js'

const pluginConfig = {
    name: 'delstickercmd',
    alias: ['delcmdsticker', 'removesticker', 'unsticker', 'eliminarcmd'],
    category: 'group',
    description: 'Elimina un comando asignado a un sticker',
    usage: '.delstickercmd <comando> o respondiendo a un sticker',
    example: '.delstickercmd menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]

    if (!commandName && !m.quoted) {
        const existingCmds = listStickerCommands()
        if (existingCmds.length === 0) {
            return m.reply(
                `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs | ᴋᴀᴏʀɪ ᴍᴅ*\n\n` +
                `> No hay comandos de sticker registrados.\n` +
                `> Puedes agregar uno con \`.addcmdsticker\``
            )
        }
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n`
        txt += `╭┈┈⬡「 📋 *ʟɪsᴛᴀ ᴀᴄᴛᴜᴀʟ* 」\n`
        
        for (const cmd of existingCmds) {
            txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `*ᴇʟɪᴍɪɴᴀ ᴄᴏɴ:*\n`
        txt += `> \`.delstickercmd <comando>\`\n`
        txt += `> o responde a un sticker con \`.delstickercmd\``
        
        return m.reply(txt)
    }
    
    let deleted = false
    let deletedCmd = ''

    if (m.quoted) {
        const stickerHash = getQuotedStickerHash(m)
        if (stickerHash) {
            const success = deleteStickerCommand(stickerHash)
            if (success) {
                deleted = true
                deletedCmd = 'el sticker seleccionado'
            }
        }
    }

    if (!deleted && commandName) {
        const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
        const found = findByCommand(cleanCmd)
        
        if (found) {
            const success = deleteStickerCommand(found.hash)
            if (success) {
                deleted = true
                deletedCmd = `.${cleanCmd}`
            }
        } else {
            return m.reply(
                `❌ ¡El comando de sticker \`${cleanCmd}\` no existe!\n\n` +
                `> Revisa la lista completa con \`.delstickercmd\``
            )
        }
    }
    
    if (deleted) {
        await m.react('✅')
        await m.reply(
            `✅ *ᴄᴏᴍᴀɴᴅᴏ ᴇʟɪᴍɪɴᴀᴅᴏ*\n\n` +
            `> 🗑️ El acceso mediante \`${deletedCmd}\` ha sido borrado.`
        )
    } else {
        await m.reply(
            `❌ ¡No se pudo eliminar!\n\n` +
            `> Responde al sticker que quieres quitar, o\n` +
            `> Escribe el nombre del comando: \`.delstickercmd menu\``
        )
    }
}

export { pluginConfig as config, handler }
