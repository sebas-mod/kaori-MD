import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'dolphin',
    alias: ['dolphinai', 'dphn'],
    category: 'ai',
    description: 'Chatea con Dolphin AI (Modelo 24B)',
    usage: '.dolphin <pregunta> o .dolphin --<template> <pregunta>',
    example: '.dolphin explica qué es la IA',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const TEMPLATES = ['logical', 'creative', 'summarize', 'code-beginner', 'code-advanced']

async function dolphinAI(question, template = 'logical') {
    const { data } = await axios.post('https://chat.dphn.ai/api/chat', {
        messages: [{
            role: 'user',
            content: question
        }],
        model: 'dolphinserver:24B',
        template: template
    }, {
        headers: {
            origin: 'https://chat.dphn.ai',
            referer: 'https://chat.dphn.ai/',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36'
        }
    })
    
    const result = data.split('\n\n')
        .filter(line => line && line.startsWith('data: {'))
        .map(line => JSON.parse(line.substring(6)))
        .map(line => line.choices[0].delta.content)
        .join('')
    
    if (!result) throw new Error('Sin respuesta de la IA')
    
    return result
}

async function handler(m, { sock }) {
    let text = m.text?.trim()
    
    if (!text) {
        return m.reply(
            `🐬 *ᴅᴏʟᴘʜɪɴ ᴀɪ*\n\n` +
            `> Chatea con Dolphin AI Modelo 24B\n\n` +
            `╭┈┈⬡「 📋 *ᴘʟᴀɴᴛɪʟʟᴀs* 」\n` +
            `┃ • \`logical\` - Respuesta lógica\n` +
            `┃ • \`creative\` - Respuesta creativa\n` +
            `┃ • \`summarize\` - Resumen\n` +
            `┃ • \`code-beginner\` - Código nivel principiante\n` +
            `┃ • \`code-advanced\` - Código nivel avanzado\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `> *Ejemplo:*\n` +
            `> ${m.prefix}dolphin ¿qué es la IA?\n` +
            `> ${m.prefix}dolphin --creative haz un poema`
        )
    }
    
    let template = 'logical'
    
    const templateMatch = text.match(/^--(\S+)\s+/)
    if (templateMatch) {
        const requestedTemplate = templateMatch[1].toLowerCase()
        if (TEMPLATES.includes(requestedTemplate)) {
            template = requestedTemplate
            text = text.replace(templateMatch[0], '').trim()
        }
    }
    
    if (!text) {
        return m.reply(`❌ ¡Ingresa una pregunta!`)
    }
    
    await m.react('🕕')
    
    try {
        const result = await dolphinAI(text, template)
        await m.reply(result)
        
        await m.react('✅')
        
    } catch (error) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
