import { games } from '../../src/lib/ourin-games.js'

games.register('siapakahaku', {
    alias: ['quiensoy', 'siapa', 'whoami'],
    emoji: '🎭',
    title: '¿QUIÉN SOY?',
    description: 'Adivina el personaje u objeto según la descripción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('siapakahaku')
export { pluginConfig as config, handler, answerHandler }
