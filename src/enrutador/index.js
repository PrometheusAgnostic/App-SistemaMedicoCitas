import { createRouter, createWebHistory } from 'vue-router'
import { usarTiendaAutenticacion } from '../almacenes/autenticacion'

const rutas = [
  {
    path: '/',
    redirect: '/panel'
  },
  {
    path: '/iniciar-sesion',
    name: 'IniciarSesion',
    component: () => import('../vistas/IniciarSesion.vue'),
    meta: { requiereAutenticacion: false }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('../vistas/Registro.vue'),
    meta: { requiereAutenticacion: false }
  },
  {
    path: '/panel',
    name: 'Panel',
    component: () => import('../vistas/Panel.vue'),
    meta: { requiereAutenticacion: true }
  },
  {
    path: '/mis-citas',
    name: 'MisCitas',
    component: () => import('../vistas/MisCitas.vue'),
    meta: { requiereAutenticacion: true, rol: 'Paciente' }
  },
  {
    path: '/nueva-cita',
    name: 'NuevaCita',
    component: () => import('../vistas/NuevaCita.vue'),
    meta: { requiereAutenticacion: true, rol: 'Paciente' }
  },
  {
    path: '/citas-medico',
    name: 'CitasMedico',
    component: () => import('../vistas/CitasMedico.vue'),
    meta: { requiereAutenticacion: true, rol: 'Medico' }
  },
  {
    path: '/administracion',
    name: 'Administracion',
    component: () => import('../vistas/Administracion.vue'),
    meta: { requiereAutenticacion: true, rol: 'Admin' }
  }
]

const enrutador = createRouter({
  history: createWebHistory(),
  routes: rutas
})

enrutador.beforeEach((a, desde, siguiente) => {
  const tiendaAutenticacion = usarTiendaAutenticacion()
  
  if (a.meta.requiereAutenticacion && !tiendaAutenticacion.estaAutenticado.value) {
    siguiente('/iniciar-sesion')
  } else if (a.meta.rol && tiendaAutenticacion.usuario.value?.rol !== a.meta.rol) {
    siguiente('/panel')
  } else {
    siguiente()
  }
})

export default enrutador

