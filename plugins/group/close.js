const pluginConfig = {
    name: 'close',
    alias: ['cerrar', 'cerrargrupo', 'tutup'],
    category: 'group',
    description: 'Cierra el grupo para que solo los administradores puedan enviar mensajes',
    usage: '.close',
    example: '.close',
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

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪóɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
                `> El grupo ya se encuentra \`cerrado\`.\n` +
                `> Actualmente solo los administradores pueden enviar mensajes.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        const successMsg = `✅ @${senderNum} ha cerrado el grupo correctamente.`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> No se pudo cerrar el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
