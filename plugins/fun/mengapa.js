const pluginConfig = {
    name: 'porque',
    alias: ['porqué', 'why', 'porque'],
    category: 'fun',
    description: 'Pregúntale al bot el porqué de algo',
    usage: '.porque <pregunta>',
    example: '.porque ¿por qué el cielo es azul?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Porque el destino así lo quiso.',
    '¡Hmm, buena pregunta! Yo también estoy confundido.',
    'Porque así es como funcionan las cosas.',
    'Porque el universo tiene sus motivos.',
    'No tengo idea, mejor buscalo en Google.',
    'Porque sí, no le des tantas vueltas.',
    '¿Quizás por pura casualidad?',
    'Porque el mundo está lleno de misterios.',
    'Hmm, es bastante difícil de explicar.',
    'Porque el universo funciona de formas misteriosas.',
    'Yo también tengo curiosidad, ¿por qué será?',
    'Porque simplemente así tenía que pasar.',
    '¡Excelente pregunta! Lástima que no tengo la respuesta.',
    'Porque esa es la gracia de la vida.',
    'Porque cada cosa tiene su propia razón de ser.',
    'Hmm... necesito tiempo para pensarlo bien.',
    'Porque esa es la lógica de este asunto.',
    'Me parece que es porque no queda de otra.',
    'Porque todo en esta vida está conectado.',
    '¡Justo en eso estaba pensando yo también!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🤔 *ᴘᴏʀϙᴜᴇ*\n\n> ¡Ingresá una pregunta!\n\n*Ejemplo:*\n> .porque ¿por qué el cielo es azul?`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
