const pluginConfig = {
    name: 'puntuar',
    alias: ['rate', 'valorar', 'calificar'],
    category: 'fun',
    description: 'Pedile al bot que puntúe algo',
    usage: '.puntuar <algo>',
    example: '.puntuar mi facha',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const ratings = [
    { score: '10/10', comment: '¡Perfecto! ¡No tiene comparación!' },
    { score: '9/10', comment: '¡Casi perfecto! ¡Está buenísimo!' },
    { score: '8/10', comment: '¡Muy bueno! ¡Me encanta!' },
    { score: '7/10', comment: 'Bastante bien, ¡arriba del promedio!' },
    { score: '6/10', comment: 'Zafa, pero podría estar mejor.' },
    { score: '5/10', comment: 'Normalito, estándar.' },
    { score: '4/10', comment: 'Hmm, le falta un toque.' },
    { score: '3/10', comment: 'Necesita mejorar un montón.' },
    { score: '2/10', comment: 'Uff, está lejísimos de ser bueno.' },
    { score: '1/10', comment: 'Perdoname, pero es un desastre.' },
    { score: '100/10', comment: '¡LEYENDA! ¡Más allá de la perfección!' },
    { score: '11/10', comment: '¡Superó mis expectativas!' },
    { score: '69/100', comment: 'Nice... 😏' },
    { score: '420/10', comment: '¡TREMENDO! 🔥' },
    { score: '∞/10', comment: 'Sos un crack, fuera de escala' },
    { score: '7.5/10', comment: '¡Sólido! ¡Buen trabajo!' },
    { score: '8.5/10', comment: '¡Impresionante!' },
    { score: '9.5/10', comment: '¡Casi la perfección absoluta!' },
    { score: '-1/10', comment: 'No sé ni qué decirte...' },
    { score: '???/10', comment: 'Error 404: Rating no encontrado.' }
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⭐ *ᴘᴜɴᴛᴜᴀʀ*\n\n> ¡Ingresá algo para calificar!\n\n*Ejemplo:*\n> .puntuar mi facha`);
    }

    const rating = ratings[Math.floor(Math.random() * ratings.length)];

    await m.reply(`Mi puntuación es: *${rating.score}*
${rating.comment}`);
}

export { pluginConfig as config, handler }
