import { spawn } from 'child_process'
import path from 'path'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'restart',
    alias: ['reiniciar', 'reboot', 'restartbot'],
    category: 'owner',
    description: 'Reinicia el proceso del bot (reinicio real)',
    usage: '.restart',
    example: '.restart',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        await m.react('🔄')
        
        const startTime = Date.now()
        
        await sock.sendMessage(m.chat, {
            text: `🔄 *ʀᴇɪɴɪᴄɪᴀɴᴅᴏ ʙᴏᴛ...*\n\n` +
                  `╭┈┈⬡「 📊 *ɪɴғᴏ* 」\n` +
                  `┃ ⏰ Hora: ${new Date().toLocaleTimeString('es-ES')}\n` +
                  `┃ 🔧 Método: Process Spawn\n` +
                  `┃ 📦 PID: ${process.pid}\n` +
                  `╰┈┈⬡\n\n` +
                  `> El bot se reiniciará en 2 segundos...\n` +
                  `> El proceso puede tardar entre 10 y 30 segundos.`
        }, { quoted: m })
        
        console.log('[Reiniciar] Comando activado por:', m.sender)
        console.log('[Reiniciar] Iniciando reinicio seguro...')
        
        setTimeout(() => {
            const cwd = process.cwd()
            const isWindows = process.platform === 'win32'
            
            let command, args
            
            if (isWindows) {
                command = 'cmd.exe'
                args = ['/c', 'start', '/b', 'node', 'index.js']
            } else {
                command = 'node'
                args = ['index.js']
            }
            
            const child = spawn(command, args, {
                cwd: cwd,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: { ...process.env, RESTARTED: 'true', RESTART_TIME: startTime.toString() }
            })
            
            child.unref()
            
            console.log('[Reiniciar] Nuevo proceso generado, cerrando proceso actual...')
            
            setTimeout(() => {
                process.exit(0)
            }, 500)
            
        }, 2000)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
