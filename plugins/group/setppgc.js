const pluginConfig = {
    name: 'setppgc',
    alias: ['setprofilegc', 'setppgroup', 'setppgrup', 'setfotogc'],
    category: 'group',
    description: 'Cambia la foto de perfil del grupo',
    usage: '.setppgc (responde a una imagen)',
    example: '.setppgc',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let buffer = null
    if (m.quoted?.isImage) {
        try {
            buffer = await m.quoted.download()
        } catch (e) {
            await m.reply(`❌ Error al obtener la imagen.`)
            return
        }
    } else if (m.isImage) {
        try {
            buffer = await m.download()
        } catch (e) {
            await m.reply(`❌ Error al obtener la imagen.`)
            return
        }
    }

    if (!buffer) {
        await m.reply(
            `⚠️ *ᴍᴏᴅᴏ ᴅᴇ ᴜsᴏ*\n\n` +
            `> Responde a una imagen con \`${m.prefix}setppgc\`\n` +
            `> Envía una imagen con el texto \`${m.prefix}setppgc\``
        )
        return
    }

    try {
        await sock.updateProfilePicture(m.chat, buffer)
        await m.reply(
            `✅ ¡La foto de perfil del grupo ha sido actualizada con éxito!`
        )
    } catch (error) {
        await m.reply(
            `❌ Error al cambiar la foto del grupo.\n` +
            `> _Detalle: ${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
