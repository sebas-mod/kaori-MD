import axios from "axios"
import config from "../../config.js"

const pluginConfig = {
    name: 'seedream',
    alias: ['editimg'],
    category: 'ai',
    description: 'Edita imágenes con IA usando un prompt',
    usage: '.seedream <prompt>',
    example: '.seedream hazlo estilo anime',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

async function uploadTmpfiles(buffer) {
    const form = new FormData()
    form.append('file', new Blob([buffer]), "image.png")

    const res = await fetch("https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk", {
        method: "POST",
        body: form
    })

    const data = await res.json()
    if (!data?.status || !data?.path) throw new Error("Subida fallida: " + JSON.stringify(data))

    return data.path
}

async function handler(m, { sock }) {
    const prompt = m.text
    if (!prompt) {
        return m.reply(
            `🍌 *SEE DREAM 4*\n\n` +
            `> Edita imágenes con IA\n\n` +
            `\`Ejemplo: ${m.prefix}seedream hazlo estilo anime\`\n\n` +
            `> Responde a una imagen o envía una con el texto`
        )
    }
    
    const isImage = m.isImage || (m.quoted && m.quoted.isImage)
    if (!isImage) {
        return m.reply(`🍌 *SEE DREAM*\n\n> Responde a una imagen o envía una con el texto`)
    }
    
    m.react('🕕')
    try {
        let mediaBuffer
        if (m.isImage && m.download) {
            mediaBuffer = await m.download()
        } else if (m.quoted && m.quoted.isImage && m.quoted.download) {
            mediaBuffer = await m.quoted.download()
        }
        
        if (!mediaBuffer || !Buffer.isBuffer(mediaBuffer)) {
            m.react('❌')
            return m.reply(`❌ *ꜰᴀʟʟᴀ*\n\n> No se pudo descargar la imagen`)
        }

        const imageUrl = await uploadTmpfiles(mediaBuffer)

        const { data } = await axios.post(
            "https://api.covenant.sbs/api/ai/seedream",
            {
                prompt,
                imageUrl
            },
            {
                headers: {
                    "x-api-key": config.APIkey.covenant
                },
                timeout: 60000
            }
        )

        console.log(data)

        if (!data.status) {
            m.react('❌')
            return m.reply(`❌ *ꜰᴀʟʟᴀ*\n\n> No se pudo editar la imagen`)
        }
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, data?.data?.url, null, m, {
            type: 'image'
        })
        
    } catch (error) {
        console.log(error?.response?.data || error.message)
        m.react('❌')
        m.reply(`🍀 *Vaya, parece que hay un problema*
Por favor, inténtalo de nuevo más tarde, no hagas spam, o prueba otra opción: ${m.prefix}ourinbanana ${m.text} (responde a una imagen)`)
    }
}

export { pluginConfig as config, handler }
