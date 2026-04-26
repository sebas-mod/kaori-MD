const pluginConfig = {
    name: 'probar',
    alias: ['try', 'intenta'],
    category: 'fun',
    description: 'Intenta preguntarle algo al bot para ver qué responde',
    usage: '.probar <pregunta>',
    example: '.probar adivina qué estoy pensando',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

const answers = [
    'Hmm, dejame ver... ¡estás pensando en comida!',
    'Adivino que... ¡estás muy aburrido!',
    'A ver... ¡parece que estás feliz!',
    'Hmm, siento que estás algo confundido.',
    'Intento adivinar... ¿estás extrañando a alguien?',
    'Me parece que estás muy relajado ahora mismo.',
    'Adivino que no soltás el celular ni un segundo.',
    'Hmm, ¿seguro que estás aburrido, no?',
    'A ver, déjame adivinar... ¡tenés ganas de salir a pasear!',
    'Siento que necesitás un poco de entretenimiento.',
    'Hmm, ¡parece que estás de buen humor!',
    'Dejame intentar... ¡seguro tenés mucha curiosidad!',
    'Mi apuesta: estás acostado sin hacer nada.',
    'Hmm, tal vez estés pensando en alguien especial.',
    'A ver: ¿tenés ganas de contarle algo a alguien?',
    'Parece que tenés ganas de jugar a algo.',
    'Hmm, apuesto a que estás escuchando música.',
    'Dejame adivinar... ¡estás en tu pieza!',
    'Siento que estás esperando que pase algo.',
    'Hmm, mi apuesta: ¡necesitás alguien con quien hablar!'
];

async function handler(m) {
    const text = m.text?.trim();

    if (!text) {
        return m.reply(`🎯 *ᴘʀᴏʙᴀʀ*\n\n> ¡Escribí algo!\n\n*Ejemplo:*\n> .probar adivina qué estoy pensando`);
    }

    const answer = answers[Math.floor(Math.random() * answers.length)];

    await m.reply(`${m.body.slice(1)}
*${answer}*`);
}

export { pluginConfig as config, handler }
