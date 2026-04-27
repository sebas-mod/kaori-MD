const pluginConfig = {
    name: 'fijar',
    alias: ['pin', 'pinmsg', 'pinpesan', 'fijarmensaje'],
    category: 'group',
    description: 'Fija un mensaje importante en el grupo',
    usage: '.fijar (respondiendo a un mensaje)',
    example: '.fijar 24',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock, args }) {
    if (!m.quoted || !m.quoted.key || !m.quoted.key.id) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
            `> ¡Responde al mensaje que deseas fijar!\n\n` +
            `*Modo de uso:*\n` +
            `> Responde al mensaje → escribe \`${m.prefix}fijar\`\n` +
            `> Opcional: \`${m.prefix}fijar 24\` (fijar por 24 horas)`
        );
        return;
    }
    
    // Duración por defecto: 24 horas (86400 segundos)
    let duration = 86400;
    if (args && args.length > 0 && args[0]) {
        const hours = parseInt(args[0]);
        if (!isNaN(hours) && hours >= 1 && hours <= 720) {
            duration = hours * 3600;
        }
    }
    
    try {
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.key.fromMe || false,
            id: m.quoted.key.id,
            participant: m.quoted.key.participant || m.quoted.sender
        };
        
        await sock.sendMessage(m.chat, {
            pin: pinKey,
            type: 1, // 1 para fijar, 2 para desfijar
            time: duration
        });
        
        const durationText = duration >= 86400 
            ? `${Math.floor(duration / 86400)} día(s)` 
            : `${Math.floor(duration / 3600)} hora(s)`;
        
        const successMsg = `✅ *ᴍᴇɴsᴀᴊᴇ ғɪᴊᴀᴅᴏ*\n\n> El mensaje ha sido fijado con éxito.\n> Duración: *${durationText}*.\n\n*𝐊𝐄𝐈 𝐊𝐀𝐑𝐔𝐈𝐙𝐀𝐖𝐀 𝐌𝐃 — Moderación*`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo fijar el mensaje.\n` +
            `> _Detalle: ${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
