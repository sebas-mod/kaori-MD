const pluginConfig = {
    name: 'abrir',
    alias: ['open', 'abrirgrupo', 'opengroup', 'buka'],
    category: 'group',
    description: 'Abre el grupo para que todos los miembros puedan enviar mensajes',
    usage: '.abrir',
    example: '.abrir',
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
        
        // Verificamos si el grupo ya está abierto (announce: false significa abierto)
        if (!groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀᴄɪᴏ́ɴ ꜰᴀʟʟɪᴅᴀ*\n\n` +
                `> El grupo ya se encuentra \`abierto\`.\n` +
                `> Todos los miembros ya pueden enviar mensajes.`
            );
            return;
        }
        
        // Actualizamos el ajuste del grupo a 'not_announcement' (abierto)
        await sock.groupSettingUpdate(m.chat, 'not_announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum} ha abierto este grupo.\n\n_Ahora todos los miembros pueden participar._\n\n*KAORI MD — Gestión*`;
        
        await m.reply(successMsg, { mentions: [m.sender] });
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Hubo un fallo al intentar abrir el grupo.\n` +
            `> _Detalle: ${error.message}_`
        );
    }
}

export { pluginConfig as config, handler }
