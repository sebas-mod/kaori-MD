const pluginConfig = {
    name: 'podria',
    alias: ['puedo', 'podre', 'can'],
    category: 'fun',
    description: 'Pregúntale al bot si algo es posible',
    usage: '.podria <pregunta>',
    example: '.podria ¿podré aprobar el examen?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Claro que sí! ¡Ten confianza!',
    'Hmm, parece difícil.',
    '¡Por supuesto! ¡Ánimo!',
    'No se puede, lo siento.',
    'Tal vez puedas, si te esfuerzas mucho.',
    '¡Claro que puedes! ¡No te rindas!',
    'Es algo difícil, pero podrías intentarlo.',
    '¡Sí que puedes! ¡Tenlo por seguro!',
    'Me parece que no.',
    '¡Puedes! ¡Demuéstralo!',
    'Hmm... lo dudo.',
    '¡Totalmente! ¡Dale con todo!',
    'No puedes, intenta otra cosa.',
    '¡Sí! ¡Confía en ti mismo!',
    'Es difícil, pero no imposible.',
    '¡Absolutamente! ¡Tú puedes!',
    'Parece que vas a necesitar un esfuerzo extra.',
    '¡Puedes! ¡No dudes de ti!',
    'Hmm, inténtalo de nuevo más tarde.',
    '¡Sí! ¡Yo creo en ti!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`💪 *ᴘᴏᴅʀɪᴀ*\n\n> ¡Ingresa una pregunta!\n\n*Ejemplo:*\n> .podria ¿podré aprobar el examen?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
