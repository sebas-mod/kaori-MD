import { getRandomItem } from '../../src/lib/ourin-game-data.js'

const pluginConfig = {
    name: 'verdad',
    alias: ['truth', 'truthq', 'verdades'],
    category: 'fun',
    description: 'Genera una pregunta aleatoria para el juego de Verdad o Reto',
    usage: '.verdad',
    example: '.verdad',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    // Se asume que 'truth.json' contiene la lista de preguntas
    const question = getRandomItem('truth.json');
    
    if (!question) {
        await m.reply('❌ ¡No hay datos disponibles en el archivo de verdades!');
        return;
    }
    
    await m.reply(`*VERDAD:* \n\n\`\`\`${question}\`\`\``);
}

export { pluginConfig as config, handler }
