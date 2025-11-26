import { reactive, computed } from 'vue'
import api from '../servicios/api'

// Estado global reactivo
const estado = reactive({
  usuario: null,
  token: localStorage.getItem('token') || null,
  estaAutenticado: !!localStorage.getItem('token')
})

// Inicializar usuario desde localStorage
const inicializar = () => {
  const usuarioAlmacenado = localStorage.getItem('usuario')
  if (usuarioAlmacenado) {
    try {
      estado.usuario = JSON.parse(usuarioAlmacenado)
    } catch (e) {
      console.error('Error al parsear usuario almacenado:', e)
    }
  }
}

// Inicializar al cargar el módulo
inicializar()

export function usarTiendaAutenticacion() {
  const iniciarSesion = async (correo, contrasena) => {
    try {
      const respuesta = await api.post('/ControladorAutenticacion/iniciar-sesion', { 
        correo, 
        contrasena 
      })
      estado.token = respuesta.data.token
      estado.usuario = respuesta.data.usuario
      estado.estaAutenticado = true
      localStorage.setItem('token', respuesta.data.token)
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
      return { exito: true }
    } catch (error) {
      return { 
        exito: false, 
        mensaje: error.response?.data?.mensaje || 'Error al iniciar sesión' 
      }
    }
  }

  const registrar = async (datosRegistro) => {
    try {
      const respuesta = await api.post('/ControladorAutenticacion/registrar', datosRegistro)
      estado.token = respuesta.data.token
      estado.usuario = respuesta.data.usuario
      estado.estaAutenticado = true
      localStorage.setItem('token', respuesta.data.token)
      localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
      return { exito: true }
    } catch (error) {
      return { 
        exito: false, 
        mensaje: error.response?.data?.mensaje || 'Error al registrar' 
      }
    }
  }

  const cerrarSesion = () => {
    estado.usuario = null
    estado.token = null
    estado.estaAutenticado = false
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  }

  return {
    usuario: computed(() => estado.usuario),
    token: computed(() => estado.token),
    estaAutenticado: computed(() => estado.estaAutenticado),
    iniciarSesion,
    registrar,
    cerrarSesion
  }
}

