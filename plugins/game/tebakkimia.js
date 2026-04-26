import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkimia', {
    alias: ['kimia', 'quimica', 'chemistry', 'unsur'],
    emoji: '🧪',
    title: 'ADIVINA LA QUÍMICA',
    description: 'Adiviná el elemento químico',
    questionField: 'unsur',
    answerField: 'lambang'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkimia')
export { pluginConfig as config, handler, answerHandler }
