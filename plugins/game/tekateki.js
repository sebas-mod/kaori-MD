import { games } from '../../src/lib/ourin-games.js'

games.register('tekateki', {
    alias: ['teka', 'acertijo', 'puzzle'],
    emoji: '🧩',
    title: 'ACERTIJOS',
    description: 'Juego de acertijos tradicionales'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tekateki')
export { pluginConfig as config, handler, answerHandler }
