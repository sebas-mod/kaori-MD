import FormData from 'form-data'
import axios from 'axios'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'wasted',
    alias: ['gta', 'gtawasted'],
    category: 'canvas',
    description: 'Membuat efek wasted GTA pada gambar',
    usage: '.wasted (reply gambar)',
    example: '.wasted',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
async function uploadTo0x0(buffer) {
    const formData = new FormData()
    formData.append('file', buffer, { filename: 'image.jpg' })
    const res = await axios.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', formData, {
        headers: formData.getHeaders(),
        timeout: 60000
    })
    if (res.data?.status && res.data?.path) {
        return res.data.path
    }
    throw new Error('Upload gagal')
}
async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    if (!isImage) {
        return m.reply(
            `💀 *ᴡᴀsᴛᴇᴅ ᴇꜰꜰᴇᴄᴛ*\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ◦ Reply gambar dengan \`${m.prefix}wasted\`\n` +
            `┃ ◦ Kirim gambar dengan caption \`${m.prefix}wasted\`\n` +
            `╰┈┈⬡`
        )
    }
    m.react('🕕')
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        if (!buffer || buffer.length === 0) {
            throw new Error('Gagal download gambar')
        }
        const imageUrl = await uploadTo0x0(buffer)
        const apiKey = config.APIkey?.lolhuman
        if (!apiKey) {
            throw new Error('API Key tidak ditemukan di config')
        }
        const apiUrl = `https://api.lolhuman.xyz/api/editor/wasted?apikey=${apiKey}&img=${encodeURIComponent(imageUrl)}`
        await sock.sendMedia(m.chat, apiUrl, null, m, {
            type: 'image',
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}
export { pluginConfig as config, handler }