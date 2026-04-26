import { games } from '../../src/lib/ourin-games.js'

games.register('tebakprofesi', {
    alias: ['tp', 'profesion', 'guessjob', 'empleo'],
    emoji: '👨‍💼',
    title: 'ADIVINA LA PROFESIÓN',
    description: 'Adiviná el nombre de la profesión'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakprofesi')
export { pluginConfig as config, handler, answerHandler }
