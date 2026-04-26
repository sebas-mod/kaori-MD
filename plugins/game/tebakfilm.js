import { games } from '../../src/lib/ourin-games.js'

games.register('tebakfilm', {
    alias: ['tf', 'pelicula', 'guessmovie', 'cine'],
    emoji: '🎬',
    title: 'ADIVINA LA PELÍCULA',
    description: 'Adiviná el título de la película'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakfilm')
export { pluginConfig as config, handler, answerHandler }
