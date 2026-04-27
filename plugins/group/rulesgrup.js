import config from '../../config.js'
import { getDatabase } from '../../src/lib/ourin-database.js'
import fs from 'fs'
import path from 'path'

const pluginConfig = {
    name: 'reglasgrup',
    alias: ['rulesgrup', 'grouprules', 'reglas', 'grules'],
    category: 'group',
    description: 'Muestra las reglas o normas del grupo',
    usage: '.reglasgrup',
    example: '.reglasgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const DEFAULT_GROUP_RULES = `📜 *ʀᴇɢʟᴀs ᴅᴇʟ ɢʀᴜᴘᴏ*

┃ 1️⃣ Prohibido el spam/flood en el chat.
┃ 2️⃣ Prohibido promocionar sin permiso.
┃ 3️⃣ Prohibido contenido ofensivo o +18.
┃ 4️⃣ Respetar a todos los miembros.
┃ 5️⃣ Usar un lenguaje adecuado.
┃ 6️⃣ No compartir enlaces sin autorización.
┃ 7️⃣ Seguir las instrucciones de los admins.
┃ 8️⃣ Prohibido el acoso (bullying).

_¿Vas a romper las reglas? ¡Prepárate para el Kick!_`

async function handler(m, { sock, config: botConfig }) {
    const db = getDatabase()
    const groupData = db.getGroup(m.chat) || {}
    const customRules = groupData.groupRules
    const rulesText = customRules || DEFAULT_GROUP_RULES

    const imagePath = path.join(process.cwd(), 'assets', 'images', 'ourin-rules.jpg')
    let imageBuffer = fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null

    // Adaptación del nombre del canal para KAORI MD
    const saluranName = botConfig.saluran?.name || botConfig.bot?.name || 'KAORI MD'

    if (imageBuffer) {
        await sock.sendMedia(m.chat, imageBuffer, rulesText, m, {
            type: 'image',
        })
    } else {
        await m.reply(rulesText)
    }
}

export { pluginConfig as config, handler, DEFAULT_GROUP_RULES }
