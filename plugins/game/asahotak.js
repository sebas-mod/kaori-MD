import { games } from '../../src/lib/ourin-games.js'

games.register('asahotak', {
    alias: ['acertijo', 'asah', 'quiz', 'puzle'],
    emoji: '🧠',
    title: 'ACERTIJO MENTAL',
    description: 'Juego de ingenio - adivina la respuesta'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('asahotak')
export { pluginConfig as config, handler, answerHandler }
