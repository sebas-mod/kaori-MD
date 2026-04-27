const pluginConfig = {
    name: 'stopjpm',
    alias: ['detenerjpm', 'pararjpm', 'cancelarjpm'],
    category: 'admin',
    description: 'Detener un proceso de JPM en curso',
    usage: '.stopjpm',
    example: '.stopjpm',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (!global.statusjpm) {
        return m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> No hay ningún proceso de JPM (difusión masiva) activo en este momento.`)
    }
    
    global.stopjpm = true
    
    m.react('⏹️')
    await m.reply(`⏹️ *ᴅᴇᴛᴇɴɪᴇɴᴅᴏ ᴊᴘᴍ*\nSolicitud enviada. El proceso se detendrá tras completar el envío actual...`)
}

export { pluginConfig as config, handler }
