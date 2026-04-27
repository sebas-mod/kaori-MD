import { getAllPlugins } from '../../src/lib/ourin-plugins.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'benefitowner',
    alias: ['ownerbenefits', 'ownerfitur'],
    category: 'main',
    description: 'Ver la explicación y lista de funciones exclusivas para el Owner',
    usage: '.benefitowner',
    isOwner: false,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const plugins = getAllPlugins()
    const ownerCommands = plugins.filter(p => p.config.isOwner && p.config.isEnabled)
    
    const seen = new Set()
    const commandList = []
    for (const p of ownerCommands) {
        const names = Array.isArray(p.config.name) ? p.config.name : [p.config.name]
        for (const name of names) {
            if (!name || seen.has(name)) continue
            seen.add(name)
            commandList.push(`• *${config.command?.prefix || '.'}${name}*`)
        }
    }
    commandList.sort()
    
    const totalCommands = commandList.length
    
    const message = 
        `👑 *¿QUÉ ES UN OWNER?*\n\n` +
        `El Owner es el *dueño del bot* que tiene acceso total a todas las funciones y al control del sistema.\n\n` +
        `╭┈┈⬡「 🔐 *PRIVILEGIOS DE OWNER* 」\n` +
        `┃ ✦ \`\`\`Acceso a todos los comandos sin límites\`\`\`\n` +
        `┃ ✦ \`\`\`Límite ilimitado (-1)\`\`\`\n` +
        `┃ ✦ \`\`\`Bypass de todos los cooldowns\`\`\`\n` +
        `┃ ✦ \`\`\`Control total del sistema del bot\`\`\`\n` +
        `┃ ✦ \`\`\`Gestión de usuarios y grupos\`\`\`\n` +
        `┃ ✦ \`\`\`Acceso al panel y servidor\`\`\`\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *CÓMO FUNCIONA* 」\n` +
        `┃ \`El Owner se añade mediante:\`\n` +
        `┃ • \`\`\`${config.command?.prefix || '.'}addowner <número>\`\`\`\n` +
        `┃ • O directamente en config.js\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 📋 *LISTA DE COMANDOS OWNER* 」\n` +
        `┃ \`Total: ${totalCommands} comandos\`\n` +
        `┃\n` +
        commandList.map(cmd => `┃ ${cmd}`).join('\n') + 
        `\n╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> ¡Contacta al owner para obtener acceso!`
    
    await m.reply(message)
}

export { pluginConfig as config, handler }
