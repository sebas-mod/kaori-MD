import { getRandomItem } from '../../src/lib/ourin-game-data.js'

const pluginConfig = {
    name: 'romantico',
    alias: ['piropo', 'amor', 'romance'],
    category: 'fun',
    description: 'Genera frases románticas o piropos al azar',
    usage: '.romantico',
    example: '.romantico',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const quote = getRandomItem('bucin.json');

    if (!quote) {
        await m.reply('❌ ¡Datos no disponibles!');
        return;
    }

    await m.reply(`\`\`\`"${quote}"\`\`\`\n\n`);
}

export { pluginConfig as config, handler }
