const pluginConfig = {
    name: 'preguntar',
    alias: ['sera', 'pregunta'],
    category: 'fun',
    description: 'Pregúntale al bot si algo es cierto o posible',
    usage: '.preguntar <pregunta>',
    example: '.preguntar ¿puedo ser rico?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, por supuesto!',
    'No, no lo creo.',
    'Tal vez, inténtalo de nuevo más tarde.',
    'Hmm... yo creo que sí.',
    'Tengo mis dudas, pero podría ser.',
    '¡Definitivamente! ¡100%!',
    'Es imposible.',
    'Podría ser, ¿quién sabe?',
    'En mi opinión, sí.',
    'Uff, me parece que no.',
    'Claro, ¿por qué no?',
    'No lo sé, pregúntale a alguien más.',
    '¡Madre mía, por supuesto que sí!',
    'Hmm... parece que no.',
    '¡Estoy seguro de que sí!',
    'Para nada, imposible.',
    'Quizás, pero no te hagas muchas ilusiones.',
    '¡Claro que sí!',
    'No, lo siento.',
    '¡Se puede! ¡Ánimo!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`❓ *ᴘʀᴇɢᴜɴᴛᴀʀ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .preguntar ¿puedo ser rico?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
