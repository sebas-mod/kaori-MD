const pluginConfig = {
    name: 'debo',
    alias: ['deberia', 'should', 'harus'],
    category: 'fun',
    description: 'Pregúntale al bot si deberías hacer algo',
    usage: '.debo <pregunta>',
    example: '.debo ¿debería declararle mi amor?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    '¡Sí, de una!',
    'No, mejor no.',
    'Hmm, como vos quieras.',
    '¡Totalmente! ¡Ni lo dudes!',
    'No es necesario.',
    '¡Si creés que hace falta, hacelo!',
    'Pensalo bien primero.',
    '¡Sí! ¡Ahora mismo!',
    'No, mejor esperá un poco.',
    'Sí, pero con cuidado.',
    'No tenés por qué, pero podés.',
    '¡Obligatorio!',
    'Hmm, mejor pasá.',
    'Hacelo cuando estés seguro.',
    '¡Tenés que hacerlo, por tu futuro!',
    'No hace falta, tranqui.',
    '¡Mandate de una!',
    'No te apures, pensalo otra vez.',
    '¡Claro que sí!',
    'Fijate cómo está la situación primero.'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`⚖️ *ᴅᴇʙᴏ*\n\n> ¡Ingresá una pregunta!\n\n*Ejemplo:*\n> .debo ¿debería declararle mi amor?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
