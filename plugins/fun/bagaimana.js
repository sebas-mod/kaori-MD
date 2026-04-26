const pluginConfig = {
    name: 'como',
    alias: ['como', 'how'],
    category: 'fun',
    description: 'Pregúntale al bot cómo hacer algo',
    usage: '.como <pregunta>',
    example: '.como ¿cómo ser exitoso?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Es fácil, solo hazlo!',
    'Hmm, es difícil de explicar. ¡Inténtalo primero!',
    'Con esfuerzo y un poco de suerte, seguro.',
    'Bueno, así es como se hace.',
    'No estoy muy seguro, busca otra referencia.',
    'Ve despacio, con el tiempo lo lograrás.',
    '¡Con trabajo duro y sin rendirse!',
    'Primero, empieza por creer en ti mismo.',
    'Hmm, cada persona tiene su propia forma de hacerlo.',
    'Solo sigue a tu corazón.',
    'Aprende de los que ya tienen experiencia.',
    'Paso a paso, no te apures.',
    '¡Con una voluntad de hierro!',
    'Empieza por las cosas pequeñas.',
    'Sé constante y verás los resultados.',
    '¡No lo pienses tanto y pasa a la acción!',
    '¡Fácil! ¡Solo tienes que empezar!',
    '¿Cómo? ¡Pues probando!',
    'Con la estrategia adecuada.',
    'Hmm, yo también sigo aprendiendo sobre eso.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`📋 *ᴄᴏᴍᴏ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .como ¿cómo ser exitoso?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
