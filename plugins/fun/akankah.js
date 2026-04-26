const pluginConfig = {
    name: 'acaso',
    alias: ['sera', 'acaso', 'will'],
    category: 'fun',
    description: 'Pregúntale al bot si algo sucederá',
    usage: '.acaso <pregunta>',
    example: '.acaso ¿seré exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, definitivamente sucederá!',
    'No, no parece que vaya a pasar.',
    'Tal vez sí, tal vez no.',
    '¡Si Dios quiere, sucederá!',
    'Hmm, es difícil de predecir.',
    '¡Claro que sí! ¡Tenlo por seguro!',
    'Me parece que no.',
    'Sucederá si te esfuerzas lo suficiente.',
    'En algún momento pasará, seguro.',
    'No va a pasar, lo siento.',
    '¡Por supuesto que sí! ¡Solo espera!',
    'Hmm, tengo mis dudas.',
    '¡Pasará! ¡Confía en el proceso!',
    'Las probabilidades son bajas.',
    '¡Seguro que sí, estoy convencido!',
    'No va a pasar, mejor busca otra cosa.',
    'Pasará, pero tomará su tiempo.',
    '¡Ojalá que sí!',
    'Si está en tu destino, pasará.',
    '¡Sucederá en el momento adecuado!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🔮 *ᴀᴄᴀsᴏ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .acaso ¿seré exitoso?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    // Mantenemos el formato original de mostrar la pregunta seguida de la respuesta
    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
