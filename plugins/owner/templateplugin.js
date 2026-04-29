import config from '../../config.js'

const pluginConfig = {
    name: 'plantillaplugin',
    alias: ['tplplugin', 'crearplantilla', 'plugin-template'],
    category: 'owner',
    description: 'Genera una plantilla base para nuevos plugins (Solo Owner)',
    usage: '.plantillaplugin',
    example: '.plantillaplugin',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    if (!config.isOwner(m.sender)) {
        return m.reply('❌ *¡Solo el Propietario (Owner) puede usar esto!*')
    }

    const template = `
const pluginConfig = {
    name: 'ejemplo',
    alias: ['ex'],
    category: 'general',
    description: 'Plugin de ejemplo',
    usage: '.ejemplo',
    example: '.ejemplo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await m.reply('¡Este es un plugin de ejemplo!')
    } catch (error) {
        console.error('Error en Plugin de Ejemplo:', error)
        await m.reply('❌ *ERROR*\\n\\n> ' + error.message)
    }
}

export { pluginConfig as config, handler }
`
    m.reply(`\`\`\`${template}\`\`\``)
}

export { pluginConfig as config, handler }
