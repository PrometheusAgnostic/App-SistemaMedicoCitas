<template>
  <div class="contenedor-pagina">
    <div class="contenedor">
      <h1>Nueva Cita Médica</h1>
      <div class="tarjeta">
        <form @submit.prevent="manejarEnvio">
          <div class="grupo-formulario">
            <label>Seleccionar Médico</label>
            <select v-model="formulario.medicoId" required @change="alCambiarMedico">
              <option value="">Seleccione un médico...</option>
              <option 
                v-for="medico in medicos" 
                :key="medico.id" 
                :value="medico.id"
              >
                {{ medico.nombre }} - {{ medico.especialidad }}
              </option>
            </select>
          </div>

          <div class="grupo-formulario">
            <label>Fecha de la Cita</label>
            <input 
              type="date" 
              v-model="formulario.fechaCita" 
              required 
              :min="fechaMinima"
              @change="verificarDisponibilidad"
            />
          </div>

          <div class="grupo-formulario">
            <label>Hora de la Cita</label>
            <input 
              type="time" 
              v-model="formulario.horaCita" 
              required 
              @change="verificarDisponibilidad"
            />
          </div>

          <div class="grupo-formulario">
            <label>Motivo de la Cita (Opcional)</label>
            <textarea 
              v-model="formulario.motivo" 
              rows="3"
              placeholder="Describa el motivo de su consulta..."
            ></textarea>
          </div>

          <div v-if="disponibilidadVerificada && !estaDisponible" class="mensaje-error">
            El horario seleccionado no está disponible. Por favor, seleccione otro horario.
          </div>

          <div v-if="error" class="mensaje-error">{{ error }}</div>
          <div v-if="exito" class="mensaje-exito">{{ exito }}</div>

          <button type="submit" class="btn-principal" :disabled="cargando || !estaDisponible">
            {{ cargando ? 'Agendando...' : 'Agendar Cita' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../servicios/api'

export default {
  name: 'NuevaCita',
  setup() {
    const enrutador = useRouter()
    
    const medicos = ref([])
    const formulario = reactive({
      medicoId: '',
      fechaCita: '',
      horaCita: '',
      motivo: ''
    })

    const error = ref('')
    const exito = ref('')
    const cargando = ref(false)
    const estaDisponible = ref(true)
    const disponibilidadVerificada = ref(false)

    const fechaMinima = computed(() => {
      const hoy = new Date()
      return hoy.toISOString().split('T')[0]
    })

    const cargarMedicos = async () => {
      try {
        const respuesta = await api.get('/ControladorMedicos')
        medicos.value = respuesta.data
      } catch (err) {
        error.value = 'Error al cargar la lista de médicos'
      }
    }

    const verificarDisponibilidad = async () => {
      if (!formulario.medicoId || !formulario.fechaCita || !formulario.horaCita) {
        disponibilidadVerificada.value = false
        return
      }

      try {
        const respuesta = await api.get(
          `/ControladorMedicos/${formulario.medicoId}/verificar-disponibilidad`,
          {
            params: {
              fecha: formulario.fechaCita,
              hora: formulario.horaCita
            }
          }
        )
        estaDisponible.value = respuesta.data.disponible
        disponibilidadVerificada.value = true
      } catch (err) {
        console.error('Error al verificar disponibilidad:', err)
      }
    }

    const alCambiarMedico = () => {
      disponibilidadVerificada.value = false
      estaDisponible.value = true
    }

    const manejarEnvio = async () => {
      error.value = ''
      exito.value = ''
      cargando.value = true

      try {
        const datosCita = {
          medicoId: parseInt(formulario.medicoId),
          fechaCita: new Date(`${formulario.fechaCita}T${formulario.horaCita}`),
          horaCita: formulario.horaCita + ':00',
          motivo: formulario.motivo || null
        }

        await api.post('/ControladorCitas', datosCita)
        exito.value = 'Cita agendada exitosamente'
        
        setTimeout(() => {
          enrutador.push('/mis-citas')
        }, 1500)
      } catch (err) {
        error.value = err.response?.data?.mensaje || 'Error al agendar la cita'
      } finally {
        cargando.value = false
      }
    }

    onMounted(() => {
      cargarMedicos()
    })

    return {
      medicos,
      formulario,
      error,
      exito,
      cargando,
      estaDisponible,
      disponibilidadVerificada,
      fechaMinima,
      verificarDisponibilidad,
      alCambiarMedico,
      manejarEnvio
    }
  }
}
</script>

<style scoped>
.contenedor-pagina {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  background: #f5f5f5;
}

.contenedor {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

.tarjeta {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
  padding: 0.75rem;
  background: #fee;
  border-radius: 5px;
}

.mensaje-exito {
  color: #27ae60;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #d4edda;
  border-radius: 5px;
}
</style>

