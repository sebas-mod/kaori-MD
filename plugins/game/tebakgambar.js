import { games } from '../../src/lib/ourin-games.js'

games.register('tebakgambar', {
    alias: ['tg', 'imagen', 'guessimage', 'adivinaimagen'],
    emoji: '🖼️',
    title: 'ADIVINA LA IMAGEN',
    description: 'Adiviná la palabra a partir de la imagen',
    timeout: 90000,
    hasImage: true,
    questionField: null,
    hintCount: 3
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakgambar')
export { pluginConfig as config, handler, answerHandler }
