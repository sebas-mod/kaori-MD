import { games } from '../../src/lib/ourin-games.js'

games.register('tebaknegara', {
    alias: ['tn', 'pais', 'guesscountry', 'nacion'],
    emoji: '🌍',
    title: 'ADIVINA EL PAÍS',
    description: 'Adiviná el nombre del país'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaknegara')
export { pluginConfig as config, handler, answerHandler }
