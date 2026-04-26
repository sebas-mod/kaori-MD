import { games } from '../../src/lib/ourin-games.js'

games.register('susunkata', {
    alias: ['susun', 'ordenar', 'scramble', 'armar'],
    emoji: '🔠',
    title: 'ORDENAR PALABRAS',
    description: 'Armá la palabra correcta ordenando las letras'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('susunkata')
export { pluginConfig as config, handler, answerHandler }
