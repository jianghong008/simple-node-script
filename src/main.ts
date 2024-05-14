
import { loadCSV } from './plugins/i18n'
import { Stage } from './stage'
import './style.css'
loadCSV().then(() => {
    new Stage(document.querySelector<HTMLDivElement>('#app')!)
}).catch(err => {
    console.error(err)
})
