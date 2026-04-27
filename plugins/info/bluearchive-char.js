import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'bluearchive-char',
    alias: ['bachar', 'ba-char', 'personaje-ba'],
    category: 'info',
    description: 'Ver información de personajes de Blue Archive',
    usage: '.bluearchive-char <nombre>',
    example: '.bluearchive-char shiroko',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

class BluArchive {
    findUrl(input, urls) {
        const clean = input.toLowerCase().replace(/\s+/g, '_')
        if (urls.includes(clean)) return clean
        
        const words = clean.split('_')
        const matches = urls.filter(url => 
            words.every(word => url.toLowerCase().includes(word))
        )
        
        return matches.length > 0 ? matches[0] : null
    }
    
    async list() {
        const { data } = await axios.get('https://api.dotgg.gg/bluearchive/characters')
        return data.map(item => ({
            ...item,
            imgSmall: item.imgSmall ? 'https://images.dotgg.gg/bluearchive/characters/' + item.imgSmall : null,
            img: item.img ? 'https://images.dotgg.gg/bluearchive/characters/' + item.img : null
        }))
    }
    
    async char(name) {
        const listc = await this.list()
        const urls = listc.map(c => c.url)
        const foundUrl = this.findUrl(name, urls)
        
        if (!foundUrl) {
            const suggestions = urls.filter(u => u.includes(name.toLowerCase().split(' ')[0])).slice(0, 5)
            throw new Error(`El personaje "${name}" no fue encontrado.\n\n> Quizás quisiste decir: ${suggestions.join(', ') || 'ninguno'}`)
        }
        
        const { data } = await axios.get(`https://api.dotgg.gg/bluearchive/characters/${foundUrl}`)
        return {
            ...data,
            imgSmall: data.imgSmall ? 'https://images.dotgg.gg/bluearchive/characters/' + data.imgSmall : null,
            img: data.img ? 'https://images.dotgg.gg/bluearchive/characters/' + data.img : null
        }
    }
}

async function handler(m, { sock }) {
    const name = m.text?.trim()
    
    if (!name) {
        return m.reply(
            `🎮 *ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ᴄʜᴀʀᴀᴄᴛᴇʀ*\n\n` +
            `> Consulta los datos de los estudiantes de Blue Archive.\n\n` +
            `> *Ejemplos:*\n` +
            `> ${m.prefix}bluearchive-char shiroko\n` +
            `> ${m.prefix}bachar hoshino\n` +
            `> ${m.prefix}bachar aru`
        )
    }
    
    await m.react('🕕')
    
    try {
        const ba = new BluArchive()
        const char = await ba.char(name)
        
        const saluranId = config.saluran?.id || ''
        const saluranName = config.saluran?.name || config.bot?.name || '𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃'
        
        let caption = `🎮 *${char.name?.toUpperCase()}*\n\n`
        
        if (char.bio) {
            caption += `> ${char.bio.substring(0, 200)}${char.bio.length > 200 ? '...' : ''}\n\n`
        }
        
        caption += `╭┈┈⬡「 📋 *ᴘᴇʀꜰɪʟ* 」\n`
        if (char.profile?.familyName) caption += `┃ 👤 Apellido: *${char.profile.familyName}*\n`
        if (char.profile?.age) caption += `┃ 🎂 Edad: *${char.profile.age}*\n`
        if (char.profile?.height) caption += `┃ 📏 Altura: *${char.profile.height}*\n`
        if (char.profile?.school) caption += `┃ 🏫 Escuela: *${char.profile.school}*\n`
        if (char.profile?.club) caption += `┃ 🎯 Club: *${char.profile.club}*\n`
        if (char.profile?.hobby) caption += `┃ ⭐ Hobby: *${char.profile.hobby}*\n`
        if (char.profile?.CV) caption += `┃ 🎤 CV: *${char.profile.CV}*\n`
        caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        caption += `╭┈┈⬡「 ⚔️ *ᴄᴏᴍʙᴀᴛᴇ* 」\n`
        if (char.type) caption += `┃ 🏷️ Tipo: *${char.type}*\n`
        if (char.role) caption += `┃ 🎭 Rol: *${char.role}*\n`
        if (char.position) caption += `┃ 📍 Posición: *${char.position}*\n`
        if (char.profile?.weaponType) caption += `┃ 🔫 Arma: *${char.profile.weaponType}*\n`
        if (char.profile?.weaponName) caption += `┃ ⚔️ Nombre Arma: *${char.profile.weaponName}*\n`
        caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        if (char.skills && char.skills.length > 0) {
            caption += `╭┈┈⬡「 ✨ *ʜᴀʙɪʟɪᴅᴀᴅᴇs* 」\n`
            for (const skill of char.skills.slice(0, 4)) {
                caption += `┃ 🔹 *${skill.name}* (${skill.type})\n`
            }
            caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        }

        caption += `*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Base de datos*`
        
        if (char.img) {
            await sock.sendMessage(m.chat, {
                image: { url: char.img },
                caption,
                contextInfo: {
                    forwardingScore: 9999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: saluranId,
                        newsletterName: saluranName,
                        serverMessageId: 127
                    }
                }
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('☢')
        // Si el error es lanzado por la clase BluArchive, lo enviamos directamente
        if (error.message.includes('encontrado')) {
            return m.reply(`❌ ${error.message}`)
        }
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
