import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor(MiddleWare) para agregar el token a las peticiones
api.interceptors.request.use(
  (configuracion) => {
    const token = localStorage.getItem('token')
    if (token) {
      configuracion.headers.Authorization = `Bearer ${token}`
    }
    return configuracion
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticion
api.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      window.location.href = '/iniciar-sesion'
    }
    return Promise.reject(error)
  }
)

export default api

