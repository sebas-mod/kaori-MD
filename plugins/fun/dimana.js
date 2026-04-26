const pluginConfig = {
    name: 'donde',
    alias: ['donde', 'where', 'mana'],
    category: 'fun',
    description: 'Pregúntale al bot dónde está algo',
    usage: '.donde <pregunta>',
    example: '.donde ¿dónde está mi alma gemela?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Cerca tuyo!',
    'Muy, muy lejos.',
    'En el lugar que menos te esperás.',
    'En tu corazón.',
    'Por acá cerca.',
    'Hmm, probá buscando en tu pieza.',
    'Allá afuera, esperándote.',
    'En el mismo lugar que vos.',
    'En algún lugar hermoso.',
    'Detrás de la puerta.',
    'A tu izquierda.',
    '¡Frente a tus ojos!',
    'Lejísimos, ¿en el exterior tal vez?',
    'En un lugar lleno de recuerdos.',
    '¡En todas partes!',
    'En el mundo virtual.',
    'En el mundo de los sueños.',
    'En un lugar secreto.',
    'Hmm, es difícil explicar la ubicación.',
    'En un lugar que te va a hacer muy feliz.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`📍 *ᴅᴏɴᴅᴇ*\n\n> ¡Ingresá una pregunta!\n\n*Ejemplo:*\n> .donde ¿dónde está mi alma gemela?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
