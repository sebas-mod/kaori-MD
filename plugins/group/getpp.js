const pluginConfig = {
    name: 'getpp',
    alias: ['pp', 'profilepic', 'avatar', 'fotoperfil'],
    category: 'group',
    description: 'Obtén la foto de perfil de un usuario (mención/reply)',
    usage: '.getpp @user',
    example: '.getpp @549xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let target = m.sender
    
    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.length) {
        target = m.mentionedJid[0]
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        // Adaptación lógica para prefijos si es necesario
        if (num.startsWith('0')) num = '54' + num.slice(1) 
        target = num + '@s.whatsapp.net'
    }
    
    const targetNum = target.split('@')[0]
    
    let ppUrl
    try {
        ppUrl = await sock.profilePictureUrl(target, 'image')
    } catch {
        // Imagen por defecto si no tiene PP o es privada
        ppUrl = 'https://files.catbox.moe/ejy4ky.jpg'
    }

    await sock.sendMedia(m.chat, ppUrl, `Foto de perfil de @${targetNum}`, m, {
        type: 'image',
        mentions: [target]
    })
}

export { pluginConfig as config, handler }
