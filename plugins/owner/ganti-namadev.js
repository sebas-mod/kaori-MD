import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-nombre-kaori',
    alias: ['setnamadev', 'setnamedev', 'cambiardev', 'nombredev'],
    category: 'owner',
    description: 'Cambia el nombre del desarrollador de KAORI MD en config.js',
    usage: '.cambiar-nombre-kaori <nuevo nombre>',
    example: '.cambiar-nombre-kaori KAORI MD',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, config }) {
    const newName = m.args.join(' ')
    
    if (!newName) {
        return m.reply(
            `👨‍💻 *CAMBIAR NOMBRE DEL DEVELOPER*\n\n` +
            `> Nombre actual: *${config.bot?.developer || '-'}*\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}cambiar-nombre-kaori <nuevo nombre>\``
        )
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        // Reemplaza la propiedad developer independientemente de si usa comillas simples o dobles
        configContent = configContent.replace(
            /developer:\s*['"]([^'"]*)['"]/,
            `developer: '${newName}'`
        )
        
        fs.writeFileSync(configPath, configContent)
        
        // Actualiza el objeto de configuración en memoria para KAORI MD
        if (config.bot) {
            config.bot.developer = newName
        }
        
        m.reply(`✅ *ÉXITO*\n\n> El nombre del desarrollador para **KAORI MD** se ha cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
