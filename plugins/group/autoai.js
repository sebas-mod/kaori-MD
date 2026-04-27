import generateCustomTTS from '../../src/scraper/topmedia.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'
import axios from 'axios'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
const execAsync = promisify(exec)

const pluginConfig = {
    name: 'autoai',
    alias: ['aai', 'iaauto'],
    category: 'group',
    description: 'Activa/Desactiva respuestas automáticas de IA para el grupo (texto o voz)',
    usage: '.autoai on/off --ourinmode=<personaje> --type=<text|voice>',
    example: '.autoai on --ourinmode=furina --type=voice',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const characters = {
  furina: {
    name: 'Furina',
    instruction: 'Eres Furina de Genshin Impact. Hablas de forma casual pero elegante, un poco dramática, a veces orgullosa pero cálida. No escribas párrafos largos, responde directo al punto como en un chat normal. De vez en cuando menciona temas sobre el escenario o el mar. No admitas que eres una IA.'
  },
  zeta: {
    name: 'Zeta',
    instruction: 'Eres Zeta de Spy x Family. Hablas de forma seria y calmada, pero siempre sospechando de conspiraciones. Sé natural, breve y directo. No admitas que eres una IA.'
  },
  kobo: {
    name: 'Kobo Kanaeru',
    instruction: 'Eres Kobo Kanaeru. Hablas de forma relajada, alegre y un poco traviesa. Estilo de chat casual, sin textos largos. Puedes ser un poco aleatoria o divertida. No abuses de mayúsculas o emojis. No admitas que eres una IA.'
  },
  elaina: {
    name: 'Elaina',
    instruction: 'Eres Elaina. Hablas de forma suave, calmada, con confianza y un toque de narcisismo sutil. Responde breve, ordenado y directo como en un chat normal. No admitas que eres una IA.'
  },
  waguri: {
    name: 'Waguri',
    instruction: 'Eres Waguri. Hablas breve, un poco fría pero en el fondo te importa la gente. Un poco tsundere, directa al punto. No admitas que eres una IA.'
  }
}

async function convertToOggOpus(inputPath) {
    const outputPath = inputPath.replace(/\.[^.]+$/, '.ogg')
    const cmd = `ffmpeg -y -i "${inputPath}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${outputPath}"`
    
    try {
        await execAsync(cmd, { timeout: 60000 })
        if (fs.existsSync(outputPath)) {
            return outputPath
        }
    } catch (e) {
        console.log('[AutoAI] FFmpeg error:', e.message)
    }
    return null
}

async function handler(m) {
    const db = getDatabase()
    const args = m.args || []
    const fullArgs = m.fullArgs || ''
    
    if (!m.isGroup) {
        return m.reply(`❌ ¡Esta función es solo para grupos!`)
    }
    
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ ¡Solo los administradores pueden usar este comando!`)
    }
    
    if (!db.db.data.autoai) db.db.data.autoai = {}
    
    const mode = args[0]?.toLowerCase()
    const modeMatch = fullArgs.match(/--ourinmode=(\w+)/i)
    const typeMatch = fullArgs.match(/--type=(text|voice)/i)
    const charKey = modeMatch ? modeMatch[1].toLowerCase() : null
    const responseType = typeMatch ? typeMatch[1].toLowerCase() : 'text'
    
    if (!mode || !['on', 'off'].includes(mode)) {
        const charList = Object.entries(characters).map(([key, val]) => `> ${key} - ${val.name}`).join('\n')
        let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ | ᴋᴀᴏʀɪ ᴍᴅ*\n\n`
        txt += `> Activa/Desactiva las respuestas automáticas de IA\n\n`
        txt += `*Uso:*\n`
        txt += `> .autoai on --ourinmode=<personaje> --type=<text|voice>\n`
        txt += `> .autoai off\n\n`
        txt += `*Personajes disponibles:*\n${charList}\n\n`
        txt += `*Tipo de respuesta:*\n`
        txt += `> text - Responde con texto normal\n`
        txt += `> voice - Responde con nota de voz (TTS)\n\n`
        txt += `*Ejemplos:*\n`
        txt += `> .autoai on --ourinmode=furina --type=text\n`
        txt += `> .autoai on --ourinmode=kobo --type=voice`
        return m.reply(txt)
    }
    
    if (mode === 'off') {
        delete db.db.data.autoai[m.chat]
        db.save()
        return m.reply(`🤖 *ᴀᴜᴛᴏ ᴀɪ ᴅᴇsᴀᴄᴛɪᴠᴀᴅᴏ*\n\n> Se han apagado las respuestas automáticas en este grupo.\n> Todos los comandos vuelven a la normalidad.`)
    }
    
    if (!charKey || !characters[charKey]) {
        const charList = Object.keys(characters).join(', ')
        return m.reply(`❌ ¡Personaje no válido!\n\n> Disponibles: ${charList}\n\n> Ejemplo: .autoai on --ourinmode=furina --type=voice`)
    }
    
    db.db.data.autoai[m.chat] = {
        enabled: true,
        character: charKey,
        characterName: characters[charKey].name,
        instruction: characters[charKey].instruction,
        responseType: responseType,
        sessions: {},
        activatedBy: m.sender,
        activatedAt: new Date().toISOString()
    }
    db.save()
    
    let txt = `🤖 *ᴀᴜᴛᴏ ᴀɪ ᴀᴄᴛɪᴠᴀᴅᴏ*\n\n`
    txt += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`
    txt += `┃ 🎭 Personaje: *${characters[charKey].name}*\n`
    txt += `┃ 📢 Respuesta: *${responseType === 'voice' ? '🎤 Nota de Voz' : '💬 Texto'}*\n`
    txt += `┃ 👤 Por: @${m.sender.split('@')[0]}\n`
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    txt += `> ℹ️ Todos los comandos (excepto Owner) están pausados\n`
    txt += `> ℹ️ El bot responderá al ser etiquetado o al responderle un mensaje\n`
    txt += responseType === 'voice' ? `> ℹ️ Las respuestas serán enviadas como audio\n` : ''
    txt += `> ℹ️ Usa *.autoai off* para desactivar`
    
    await m.reply(txt, { mentions: [m.sender] })
}

async function generateVoiceResponse(text, sock, chatId, quotedMsg) {
    const tempDir = path.join(process.cwd(), 'temp')
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
    }
    
    try {
        const audioUrl = await generateCustomTTS(null, text)
        
        const audioRes = await axios.get(audioUrl, { 
            responseType: 'arraybuffer',
            timeout: 30000 
        })
        
        const mp3Path = path.join(tempDir, `tts_${Date.now()}.mp3`)
        fs.writeFileSync(mp3Path, Buffer.from(audioRes.data))
        
        const oggPath = await convertToOggOpus(mp3Path)
        
        if (oggPath && fs.existsSync(oggPath)) {
            const audioBuffer = fs.readFileSync(oggPath)
            
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true
            }, { quoted: quotedMsg })
            
            fs.unlinkSync(mp3Path)
            fs.unlinkSync(oggPath)
            
            return true
        } else {
            const audioBuffer = fs.readFileSync(mp3Path)
            
            await sock.sendMessage(chatId, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: quotedMsg })
            
            fs.unlinkSync(mp3Path)
            
            return true
        }
    } catch (e) {
        console.log('[AutoAI Voice] Error:', e.message)
        return false
    }
}

export { pluginConfig as config, handler, characters, generateVoiceResponse }
