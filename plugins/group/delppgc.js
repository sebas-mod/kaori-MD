const pluginConfig = {
    name: 'delppgc',
    alias: ['delprofilegc', 'delppgroup', 'borrarfotogrupo', 'eliminarfotogc'],
    category: 'group',
    description: 'Elimina la foto de perfil del grupo',
    usage: '.delppgc',
    example: '.delppgc',
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
    try {
        await sock.removeProfilePicture(m.chat)
        
        await m.reply(
            `✅ La foto del grupo ha sido eliminada con éxito.`
        )
    } catch (error) {
        await m.reply(
            `❌ *ꜰᴀʟʟᴏ*\n\n` +
            `> No se pudo eliminar la foto del grupo.\n` +
            `> _${error.message}_`
        )
    }
}

export { pluginConfig as config, handler }
