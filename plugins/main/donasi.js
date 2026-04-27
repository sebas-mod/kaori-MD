import config from '../../config.js'
import path from 'path'
import fs from 'fs'
import fetch from 'node-fetch'

const pluginConfig = {
    name: 'donar',
    alias: ['donate', 'donasi', 'donacion', 'support', 'apoyar'],
    category: 'main',
    description: 'Información para apoyar el desarrollo del bot',
    usage: '.donar',
    example: '.donar',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = config.bot?.name || 'KAORI MD'
    const ownerName = config.owner?.name || 'Owner'
    const saluranId = config.saluran?.id || '120363208449943317@newsletter'
    const saluranName = config.saluran?.name || botName
    
    const donasiConfig = config.donasi || {}
    const payments = donasiConfig.payment || []
    const links = donasiConfig.links || []
    const qrisUrl = donasiConfig.qris || ''
    const benefits = donasiConfig.benefits || [
        'Apoyar el desarrollo constante',
        'Mantener el servidor estable',
        'Nuevas funciones más rápido',
        'Soporte prioritario'
    ]
    
    let text = `💖 *APOYA A ${botName.toUpperCase()}* 💖\n\n`
    text += `Tu contribución ayuda a mantener el bot activo y gratuito para todos.\n\n`
    
    if (payments.length > 0 || links.length > 0) {
        text += `╭┈┈⬡「 💳 *MÉTODOS DE PAGO* 」\n`
        for (const pay of payments) {
            text += `┃ 🏦 *${pay.name?.toUpperCase()}*\n`
            text += `┃ ◦ Número: \`${pay.number}\`\n`
            text += `┃ ◦ Titular: ${pay.holder}\n`
            text += `┃\n`
        }
        
        for (const link of links) {
            const icons = { saweria: '☕', trakteer: '🍵', paypal: '💰', mercado: '💸', default: '🔗' }
            const icon = icons[link.name?.toLowerCase()] || icons.default
            text += `┃ ${icon} *${link.name}*\n`
            text += `┃ ${link.url}\n`
            text += `┃\n`
        }
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    } else {
        text += `╭┈┈⬡「 💳 *MÉTODOS* 」\n`
        text += `┃\n`
        text += `┃ > Sin configurar actualmente\n`
        text += `┃ > Edita config.donasi\n`
        text += `┃\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    text += `🎁 *BENEFICIOS*\n`
    for (const benefit of benefits) {
        text += `◦ ${benefit}\n`
    }
    text += `\n`
    
    text += `_Cualquier monto es sumamente valioso._\n`
    text += `Contacto: @${config.owner?.number?.[0] || 'owner'}`
    
    const copyButtons = payments.map(pay => ({
        name: 'cta_copy',
        buttonParamsJson: JSON.stringify({
            display_text: `📋 Copiar No. ${pay.name}`,
            copy_code: pay.number
        })
    }))
    
    const contextInfo = {
        mentionedJid: config.owner?.number?.[0] ? [`${config.owner.number[0]}@s.whatsapp.net`] : [],
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127
        }
    }
    
    if (qrisUrl) {
        try {
            const response = await fetch(qrisUrl)
            const qrisBuffer = Buffer.from(await response.arrayBuffer())
            
            await sock.sendButton(m.chat, qrisBuffer, text, m, {
                buttons: copyButtons
            })
        } catch (e) {
            await sock.sendButton(m.chat, null, text, m, {
                buttons: copyButtons
            })
        }
    } else {
        await sock.sendMessage(m.chat, {
            text: text,
            footer: botName,
            contextInfo: contextInfo,
            interactiveButtons: copyButtons
        }, { quoted: m })
    }
}

export { pluginConfig as config, handler }
