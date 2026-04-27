import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-nombrebot',
    alias: ['setnamabot', 'setnamebot', 'cambiarbot', 'nombrebot'],
    category: 'owner',
    description: 'Cambia el nombre del bot en config.js',
    usage: '.cambiar-nombrebot <nuevo nombre>',
    example: '.cambiar-nombrebot Ourin MD',
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
            `🤖 *CAMBIAR NOMBRE DEL BOT*\n\n` +
            `> Nombre actual: *${config.bot?.name || '-'}*\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}cambiar-nombrebot <nuevo nombre>\``
        )
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        // Reemplaza el nombre en el objeto bot: { name: '...' }
        configContent = configContent.replace(
            /bot:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
            (match, oldName) => {
                // Reemplaza independientemente de si usa comillas simples o dobles
                return match.replace(`'${oldName}'`, `'${newName}'`).replace(`"${oldName}"`, `'${newName}'`)
            }
        )
        
        fs.writeFileSync(configPath, configContent)
        
        // Actualizar la instancia de configuración en memoria
        if (config.bot) config.bot.name = newName
        
        m.reply(`✅ *ÉXITO*\n\n> El nombre del bot se ha cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
