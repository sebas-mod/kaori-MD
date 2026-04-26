import { getQuotedStickerHash, addStickerCommand, listStickerCommands } from '../../src/lib/ourin-sticker-command.js'
import { getPlugin } from '../../src/lib/ourin-plugins.js'

const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addscmd', 'setsticker', 'vincularsticker'],
    category: 'group',
    description: 'Convierte un sticker en un acceso directo a un comando',
    usage: '.addcmdsticker <comando> (respondiendo a un sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]

    // Si no pone argumentos, mostramos la ayuda y la lista actual
    if (!commandName) {
        const existingCmds = listStickerCommands()

        let txt = `🖼️ *STICKER A COMANDO*\n\n`
        txt += `> Respondé a un sticker con este comando para crear un acceso directo.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `> Respondé al sticker y escribí:\n`
        txt += `> \`${m.prefix}addcmdsticker menu\`\n\n`

        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *VINCULADOS* 」\n`
            // Mostramos los primeros 10 para no inundar el chat
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃ ... y ${existingCmds.length - 10} más.\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }

        return m.reply(txt)
    }

    // Validación: debe responder a un mensaje
    if (!m.quoted) {
        return m.reply('⚠️ ¡Tenés que *responder a un sticker*!')
    }

    const stickerHash = getQuotedStickerHash(m)
    if (!stickerHash) {
        return m.reply('⚠️ El mensaje que respondiste no parece ser un *sticker*.')
    }

    // Limpiamos el comando (sacamos el punto si lo puso)
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = getPlugin(cleanCmd)

    // Verificamos que el comando que quiere vincular realmente exista en el bot
    if (!plugin) {
        return m.reply(
            `❌ ¡El comando \`${cleanCmd}\` no existe!\n\n` +
            `> Solo podés vincular comandos válidos del bot.`
        )
    }

    // Intentamos guardar la vinculación
    const success = addStickerCommand(stickerHash, cleanCmd, m.sender)

    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *STICKER VINCULADO*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `_¡Ahora al mandar ese sticker, se ejecutará el comando automáticamente!_`
        )
    } else {
        await m.reply('❌ ¡Hubo un error al intentar guardar el sticker command!')
    }
}

export { pluginConfig as config, handler }
