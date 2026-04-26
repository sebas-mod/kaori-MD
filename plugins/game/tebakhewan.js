import { games } from '../../src/lib/ourin-games.js'

games.register('tebakhewan', {
    alias: ['animal', 'th', 'guessanimal', 'animales'],
    emoji: '🐾',
    title: 'ADIVINA EL ANIMAL',
    description: 'Adiviná el nombre del animal'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakhewan')
export { pluginConfig as config, handler, answerHandler }
