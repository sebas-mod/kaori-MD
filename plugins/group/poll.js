const pluginConfig = {
    name: 'encuesta',
    alias: ['poll', 'vote', 'voting', 'votacion'],
    category: 'group',
    description: 'Crea una encuesta o votación en el grupo',
    usage: '.encuesta <pregunta> | <opción1>, <opción2>, ...',
    example: '.encuesta ¿Qué almorzamos? | Pizza, Hamburguesa, Sushi',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Formato no válido!\n\n` +
            `*Formato:*\n` +
            `> \`${m.prefix}encuesta pregunta | opción1, opción2\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}encuesta ¿Qué jugamos? | Free Fire, Minecraft\`\n\n` +
            `*Opción múltiple:*\n` +
            `> \`${m.prefix}encuesta multi | pregunta | opción1, opción2, ...\`\n` +
            `> (Permite elegir más de una opción)`
        );
        return;
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> Debes usar el separador "|" entre la pregunta y las opciones.\n` +
            `> Uso: \`pregunta | opción1, opción2, ...\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Se requieren al menos 2 opciones!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Máximo 12 opciones permitidas!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡La pregunta es demasiado larga!\n` +
            `> Máximo 255 caracteres.`
        );
        return;
    }
    
    try {
        const pollMsg = `✅ *ᴇɴᴄᴜᴇsᴛᴀ ᴄʀᴇᴀᴅᴀ*\n\n> Generada con éxito por @${m.sender.split('@')[0]}`;
        
        await m.reply(pollMsg, { mentions: [m.sender] });
        
        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo crear la encuesta.\n` +
            `> _Detalle: ${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
