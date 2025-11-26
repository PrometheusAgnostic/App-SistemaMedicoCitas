<template>
  <div class="contenedor-autenticacion">
    <div class="tarjeta-autenticacion">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="manejarInicioSesion">
        <div class="grupo-formulario">
          <label>Correo Electrónico</label>
          <input 
            type="email" 
            v-model="correo" 
            required 
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input 
            type="password" 
            v-model="contrasena" 
            required 
            placeholder="••••••••"
          />
        </div>
        <div v-if="error" class="mensaje-error">{{ error }}</div>
        <button type="submit" class="btn-principal" :disabled="cargando">
          {{ cargando ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>
      <div class="acceso-rapido">
        <p class="texto-acceso-rapido">O accede rápidamente como:</p>
        <div class="botones-acceso-rapido">
          <button @click="accesoRapido('Paciente')" class="btn-acceso btn-paciente">
            Paciente
          </button>
          <button @click="accesoRapido('Medico')" class="btn-acceso btn-medico">
            Médico
          </button>
          <button @click="accesoRapido('Admin')" class="btn-acceso btn-admin">
            Admin
          </button>
        </div>
      </div>
      <p class="enlace-autenticacion">
        ¿No tienes cuenta? 
        <router-link to="/registro">Regístrate aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usarTiendaAutenticacion } from '../almacenes/autenticacion'
import api from '../servicios/api'

export default {
  name: 'IniciarSesion',
  setup() {
    const enrutador = useRouter()
    const tiendaAutenticacion = usarTiendaAutenticacion()
    
    const correo = ref('')
    const contrasena = ref('')
    const error = ref('')
    const cargando = ref(false)

    const manejarInicioSesion = async () => {
      error.value = ''
      cargando.value = true

      const resultado = await tiendaAutenticacion.iniciarSesion(correo.value, contrasena.value)
      
      if (resultado.exito) {
        enrutador.push('/panel')
      } else {
        error.value = resultado.mensaje
      }
      
      cargando.value = false
    }

    const accesoRapido = async (rol) => {
      error.value = ''
      cargando.value = true

      try {
        // Enviar el rol como objeto
        const respuesta = await api.post('/ControladorAutenticacion/acceso-rapido', { rol: rol })
        
        // Guardar en localStorage
        localStorage.setItem('token', respuesta.data.token)
        localStorage.setItem('usuario', JSON.stringify(respuesta.data.usuario))
        
        // Recargar la página para que el store se actualice
        window.location.href = '/panel'
      } catch (err) {
        console.error('Error en acceso rápido:', err)
        error.value = err.response?.data?.mensaje || 'Error al acceder'
        cargando.value = false
      }
    }

    return {
      correo,
      contrasena,
      error,
      cargando,
      manejarInicioSesion,
      accesoRapido
    }
  }
}
</script>

<style scoped>
.contenedor-autenticacion {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.tarjeta-autenticacion {
  background: white;
  padding: 2.5rem;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.tarjeta-autenticacion h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  text-align: center;
}

.grupo-formulario {
  margin-bottom: 1.5rem;
}

.grupo-formulario label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.grupo-formulario input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
}

.grupo-formulario input:focus {
  outline: none;
  border-color: #667eea;
}

.btn-principal {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-principal:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-principal:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mensaje-error {
  color: #e74c3c;
  margin-bottom: 1rem;
  text-align: center;
}

.enlace-autenticacion {
  text-align: center;
  margin-top: 1.5rem;
  color: #666;
}

.enlace-autenticacion a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.enlace-autenticacion a:hover {
  text-decoration: underline;
}

.acceso-rapido {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
}

.texto-acceso-rapido {
  text-align: center;
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.botones-acceso-rapido {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-acceso {
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.btn-paciente {
  background: white;
  border-color: #667eea;
  color: #667eea;
}

.btn-paciente:hover {
  background: #667eea;
  color: white;
}

.btn-medico {
  background: white;
  border-color: #48bb78;
  color: #48bb78;
}

.btn-medico:hover {
  background: #48bb78;
  color: white;
}

.btn-admin {
  background: white;
  border-color: #f56565;
  color: #f56565;
}

.btn-admin:hover {
  background: #f56565;
  color: white;
}
</style>

