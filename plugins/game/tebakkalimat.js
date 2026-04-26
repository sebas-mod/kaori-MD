import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkalimat', {
    alias: ['tkl', 'frase', 'refran', 'peribahasa'],
    emoji: '📖',
    title: 'ADIVINA LA FRASE',
    description: 'Adiviná la frase o el refrán'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkalimat')
export { pluginConfig as config, handler, answerHandler }
