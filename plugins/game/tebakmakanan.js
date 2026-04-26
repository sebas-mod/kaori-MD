import { games } from '../../src/lib/ourin-games.js'

games.register('tebakmakanan', {
    alias: ['makanan', 'comida', 'food', 'adivinarcomida'],
    emoji: '🍲',
    title: 'ADIVINA LA COMIDA',
    description: 'Adiviná el nombre de la comida',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakmakanan')
export { pluginConfig as config, handler, answerHandler }
