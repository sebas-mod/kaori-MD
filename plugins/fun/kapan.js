const pluginConfig = {
    name: 'cuando',
    alias: ['cuando', 'when'],
    category: 'fun',
    description: 'Pregúntale al bot cuándo sucederá algo',
    usage: '.cuando <pregunta>',
    example: '.cuando ¿cuándo me voy a casar?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¿Mañana, tal vez?',
    'Parece que el año que viene.',
    '¡En 3 días!',
    'Hmm, todavía falta bastante.',
    '¡Falta poquito!',
    'Cuando llegue el momento, pasará.',
    '¡El mes que viene!',
    'Quién sabe cuándo, lo importante es tener paciencia.',
    '¡Dentro de poco!',
    '¿En 10 años, quizás?',
    '¡No falta mucho!',
    'Si está destinado, pasará.',
    'Hmm, es difícil de predecir.',
    '¡La semana que viene!',
    '¡Si te esforzás más, será más rápido!',
    'Cuando sea el momento justo.',
    'Lo antes posible, tranqui.',
    'Cuando estés listo.',
    '¡En cuestión de días!',
    'Cuando estés preparado para recibirlo.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⏰ *ᴄᴜᴀɴᴅᴏ*\n\n> ¡Ingresá una pregunta!\n\n*Ejemplo:*\n> .cuando ¿cuándo me voy a casar?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
