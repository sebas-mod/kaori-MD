import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'cambiar-nombreowner',
    alias: ['setnamaowner', 'setnameowner', 'nombreowner', 'cambiarowner'],
    category: 'owner',
    description: 'Cambia el nombre del propietario en config.js',
    usage: '.cambiar-nombreowner <nuevo nombre>',
    example: '.cambiar-nombreowner Zann',
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
            `👤 *CAMBIAR NOMBRE DEL OWNER*\n\n` +
            `> Nombre actual: *${config.owner?.name || '-'}*\n\n` +
            `*Uso:*\n` +
            `\`${m.prefix}cambiar-nombreowner <nuevo nombre>\``
        )
    }
    
    try {
        const configPath = path.join(process.cwd(), 'config.js')
        let configContent = fs.readFileSync(configPath, 'utf8')
        
        // Busca el objeto owner: { ... name: '...' } y actualiza el valor del nombre
        configContent = configContent.replace(
            /owner:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
            (match, oldName) => match.replace(`'${oldName}'`, `'${newName}'`).replace(`"${oldName}"`, `'${newName}'`)
        )
        
        fs.writeFileSync(configPath, configContent)
        
        // Actualiza el objeto en memoria para KAORI MD
        if (config.owner) {
            config.owner.name = newName
        }
        
        m.reply(`✅ *ÉXITO*\n\n> El nombre del owner se ha cambiado a: *${newName}*`)
        
    } catch (error) {
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
