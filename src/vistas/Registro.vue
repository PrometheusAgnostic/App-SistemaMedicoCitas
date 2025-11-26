<template>
  <div class="contenedor-autenticacion">
    <div class="tarjeta-autenticacion">
      <h2>Registro</h2>
      <form @submit.prevent="manejarRegistro">
        <div class="grupo-formulario">
          <label>Nombre</label>
          <input type="text" v-model="formulario.nombre" required />
        </div>
        <div class="grupo-formulario">
          <label>Correo Electrónico</label>
          <input type="email" v-model="formulario.correo" required />
        </div>
        <div class="grupo-formulario">
          <label>Contraseña</label>
          <input type="password" v-model="formulario.contrasena" required minlength="6" />
        </div>
        <div class="grupo-formulario">
          <label>Tipo de Usuario</label>
          <select v-model="formulario.rol" @change="alCambiarRol" required>
            <option value="">Seleccione...</option>
            <option value="Paciente">Paciente</option>
            <option value="Medico">Médico</option>
          </select>
        </div>

        <!-- Campos para Paciente -->
        <template v-if="formulario.rol === 'Paciente'">
          <div class="grupo-formulario">
            <label>Teléfono</label>
            <input type="tel" v-model="formulario.telefono" required />
          </div>
          <div class="grupo-formulario">
            <label>Edad</label>
            <input type="number" v-model.number="formulario.edad" required min="1" />
          </div>
        </template>

        <!-- Campos para Médico -->
        <template v-if="formulario.rol === 'Medico'">
          <div class="grupo-formulario">
            <label>Especialidad</label>
            <input type="text" v-model="formulario.especialidad" required />
          </div>
          <div class="grupo-formulario">
            <label>Cédula Profesional</label>
            <input type="text" v-model="formulario.cedulaProfesional" required />
          </div>
          <div class="grupo-formulario">
            <label>Horarios Disponibles (JSON opcional)</label>
            <textarea 
              v-model="formulario.horariosDisponibles" 
              placeholder='{"lunes": "09:00-17:00", "martes": "09:00-17:00"}'
              rows="3"
            ></textarea>
          </div>
        </template>

        <div v-if="error" class="mensaje-error">{{ error }}</div>
        <button type="submit" class="btn-principal" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>
      <p class="enlace-autenticacion">
        ¿Ya tienes cuenta? 
        <router-link to="/iniciar-sesion">Inicia sesión aquí</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { usarTiendaAutenticacion } from '../almacenes/autenticacion'

export default {
  name: 'Registro',
  setup() {
    const enrutador = useRouter()
    const tiendaAutenticacion = usarTiendaAutenticacion()
    
    const formulario = reactive({
      nombre: '',
      correo: '',
      contrasena: '',
      rol: '',
      telefono: '',
      edad: null,
      especialidad: '',
      cedulaProfesional: '',
      horariosDisponibles: ''
    })

    const error = ref('')
    const cargando = ref(false)

    const alCambiarRol = () => {
      // Limpiar campos específicos al cambiar de rol
      if (formulario.rol === 'Paciente') {
        formulario.especialidad = ''
        formulario.cedulaProfesional = ''
        formulario.horariosDisponibles = ''
      } else {
        formulario.telefono = ''
        formulario.edad = null
      }
    }

    const manejarRegistro = async () => {
      error.value = ''
      cargando.value = true

      const datosRegistro = {
        nombre: formulario.nombre,
        correo: formulario.correo,
        contrasena: formulario.contrasena,
        rol: formulario.rol
      }

      if (formulario.rol === 'Paciente') {
        datosRegistro.telefono = formulario.telefono
        datosRegistro.edad = formulario.edad
      } else if (formulario.rol === 'Medico') {
        datosRegistro.especialidad = formulario.especialidad
        datosRegistro.cedulaProfesional = formulario.cedulaProfesional
        datosRegistro.horariosDisponibles = formulario.horariosDisponibles || null
      }

      const resultado = await tiendaAutenticacion.registrar(datosRegistro)
      
      if (resultado.exito) {
        enrutador.push('/panel')
      } else {
        error.value = resultado.mensaje
      }
      
      cargando.value = false
    }

    return {
      formulario,
      error,
      cargando,
      alCambiarRol,
      manejarRegistro
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.grupo-formulario input,
.grupo-formulario select,
.grupo-formulario textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  box-sizing: border-box;
  font-family: inherit;
}

.grupo-formulario input:focus,
.grupo-formulario select:focus,
.grupo-formulario textarea:focus {
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
</style>

