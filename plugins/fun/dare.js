import { getRandomItem } from '../../src/lib/ourin-game-data.js'

const pluginConfig = {
    name: 'reto',
    alias: ['dare', 'desafio', 'tantang'],
    category: 'fun',
    description: 'Genera un reto aleatorio (Dare)',
    usage: '.reto',
    example: '.reto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const challenge = getRandomItem('dare.json');

    if (!challenge) {
        await m.reply('❌ ¡Datos no disponibles!');
        return;
    }

    await m.reply(`\`\`\`${challenge}\`\`\``);
}

export { pluginConfig as config, handler }


export { pluginConfig as config, handler }