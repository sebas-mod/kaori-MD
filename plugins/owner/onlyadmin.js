import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'soloadmin',
    alias: ['selfadmin', 'publicadmin', 'adminonly'],
    category: 'owner',
    description: 'Solo los administradores del grupo pueden acceder a los comandos del bot',
    usage: '.soloadmin on/off',
    example: '.soloadmin on',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args[0]?.toLowerCase()
    const cmd = m.command.toLowerCase()
    const current = db.setting('onlyAdmin') || false

    if (cmd === 'selfadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot ahora es accesible para todos')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admins de grupo\n' +
            '┃ ✅ Propietario del bot\n' +
            '┃ ❌ Miembros normales\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.soloadmin off` para desactivar'
        )
    }

    if (cmd === 'publicadmin') {
        if (current) {
            db.setting('onlyAdmin', false)
            await m.react('❌')
            return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot ahora es accesible para todos')
        }
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admins de grupo\n' +
            '┃ ✅ Propietario del bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembros normales en grupos\n' +
            '╰┈┈⬡\n\n' +
            '> Usa `.soloadmin off` para desactivar'
        )
    }

    if (!args || args === 'status') {
        return m.reply(
            `🔒 *sᴏʟᴏᴀᴅᴍɪɴ*\n\n` +
            `> Estado: ${current ? '✅ Activo' : '❌ Inactivo'}\n\n` +
            `*Uso:*\n` +
            `> \`.soloadmin on\` — Activar\n` +
            `> \`.soloadmin off\` — Desactivar\n\n` +
            `_Solo admins de grupo, owner y chats privados podrán acceder al bot_`
        )
    }

    if (args === 'on') {
        if (current) return m.reply('⚠️ SoloAdmin ya está activo.')
        db.setting('onlyAdmin', true)
        db.setting('selfAdmin', false)
        db.setting('publicAdmin', false)
        await m.react('✅')
        return m.reply(
            '✅ *sᴏʟᴏᴀᴅᴍɪɴ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n' +
            '╭┈┈⬡「 🔒 *ᴀᴄᴄᴇsᴏ* 」\n' +
            '┃ ✅ Admins de grupo\n' +
            '┃ ✅ Propietario del bot\n' +
            '┃ ✅ Chat privado (todos)\n' +
            '┃ ❌ Miembros normales en grupos\n' +
            '╰┈┈⬡'
        )
    }

    if (args === 'off') {
        if (!current) return m.reply('⚠️ SoloAdmin ya está inactivo.')
        db.setting('onlyAdmin', false)
        await m.react('❌')
        return m.reply('❌ *sᴏʟᴏᴀᴅᴍɪɴ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> El bot ahora es accesible para todos')
    }

    return m.reply('❌ Argumento no válido. Usa: `on` o `off`')
}

export { pluginConfig as config, handler }
