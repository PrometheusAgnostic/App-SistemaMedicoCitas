import { createApp } from 'vue'
import Aplicacion from './Aplicacion.vue'
import enrutador from './enrutador'
import './estilos.css'

createApp(Aplicacion).use(enrutador).mount('#app')

