const pluginConfig = {
    name: 'cuanto',
    alias: ['cuantos', 'howmuch', 'howmany'],
    category: 'fun',
    description: 'Pregúntale al bot cuánto de algo',
    usage: '.cuanto <pregunta>',
    example: '.cuanto ¿cuántos años tendrá mi pareja?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '1',
    '7',
    '12',
    '21',
    '99',
    '69',
    '100',
    '50',
    '25',
    '1000',
    '5',
    '17',
    '88',
    '33',
    'Nada (la respuesta siempre es nada)',
    '¡Muchísimo!',
    'Solo un poco.',
    '¡Incalculable!',
    'Hmm, alrededor de 10.',
    '¡Más de lo que crees!',
    'No sé, me da pereza pensar.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🔢 *ᴄᴜᴀɴᴛᴏ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .cuanto ¿cuántos años tendrá mi pareja?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
