import fs from 'fs'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'clearsessions',
    alias: ['clearsession', 'borrarsesion', 'delsessions'],
    category: 'owner',
    description: 'Elimina todos los archivos de sesión en storage/sessions/',
    usage: '.clearsessions',
    example: '.clearsessions',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m)  {
    const sessionsPath = path.join(process.cwd(), 'storage', 'sessions')
    
    if (!fs.existsSync(sessionsPath)) {
        return m.reply(`❌ ¡La carpeta de sesiones no existe!`)
    }
    
    await m.react('🗑️')
    
    try {
        const files = fs.readdirSync(sessionsPath)
        
        if (files.length === 0) {
            return m.reply(`📁 ¡La carpeta de sesiones ya está vacía!`)
        }
        
        let deleted = 0
        let skipped = 0
        
        for (const file of files) {
            // Es vital saltar creds.json para no desloguear el bot
            if (file === 'creds.json') {
                skipped++
                continue
            }
            
            const filePath = path.join(sessionsPath, file)
            try {
                const stat = fs.statSync(filePath)
                if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true, force: true })
                } else {
                    fs.unlinkSync(filePath)
                }
                deleted++
            } catch {}
        }
        
        await m.react('✅')
        await m.reply(
            `╭┈┈⬡「 🗑️ *LIMPIEZA DE SESIONES* 」
┃
┃ ㊗ ELIMINADOS: *${deleted}* archivos
┃ ㊗ OMITIDOS: *${skipped}* archivos
┃ ㊗ NOTA: creds.json no fue eliminado
┃
╰┈┈⬡

> _¡Archivos de sesión limpiados con éxito!_
> _Reinicia el bot si es necesario._`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
