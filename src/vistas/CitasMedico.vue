<template>
  <div class="contenedor-pagina">
    <div class="contenedor">
      <h1>Mis Citas como Médico</h1>
      
      <div class="tarjeta">
        <h2>Actualizar Disponibilidad</h2>
        <div class="grupo-formulario">
          <label>Horarios Disponibles (JSON)</label>
          <textarea 
            v-model="horariosDisponibles" 
            rows="5"
            placeholder='{"lunes": "09:00-17:00", "martes": "09:00-17:00", "miercoles": "09:00-17:00"}'
          ></textarea>
        </div>
        <button @click="actualizarDisponibilidad" class="btn-principal">Actualizar Disponibilidad</button>
      </div>

      <div v-if="cargando" class="cargando">Cargando citas...</div>
      <div v-else-if="citas.length === 0" class="sin-datos">
        No tienes citas programadas
      </div>
      <div v-else class="grid-citas">
        <div 
          v-for="cita in citas" 
          :key="cita.id"
          class="tarjeta-cita"
        >
          <div class="encabezado-cita">
            <h3>{{ cita.nombrePaciente }}</h3>
            <span class="estado" :class="cita.estado.toLowerCase()">
              {{ cita.estado }}
            </span>
          </div>
          <div class="cuerpo-cita">
            <p><strong>Fecha:</strong> {{ formatearFecha(cita.fechaCita) }}</p>
            <p><strong>Hora:</strong> {{ formatearHora(cita.horaCita) }}</p>
            <p v-if="cita.motivo"><strong>Motivo:</strong> {{ cita.motivo }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { usarTiendaAutenticacion } from '../almacenes/autenticacion'
import api from '../servicios/api'

export default {
  name: 'CitasMedico',
  setup() {
    const tiendaAutenticacion = usarTiendaAutenticacion()
    const citas = ref([])
    const cargando = ref(true)
    const horariosDisponibles = ref('')
    const medicoId = ref(null)

    const formatearFecha = (cadenaFecha) => {
      const fecha = new Date(cadenaFecha)
      return fecha.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }

    const formatearHora = (intervaloTiempo) => {
      const tiempo = intervaloTiempo.split(':')
      return `${tiempo[0]}:${tiempo[1]}`
    }

    const cargarInformacionMedico = async () => {
      try {
        const respuestaMedicos = await api.get('/ControladorMedicos')
        const usuario = tiendaAutenticacion.usuario.value
        const medico = respuestaMedicos.data.find(m => m.correo === usuario?.correo)
        
        if (medico) {
          medicoId.value = medico.id
          horariosDisponibles.value = medico.horariosDisponibles || ''
          await cargarCitas()
        }
      } catch (error) {
        console.error('Error al cargar información del médico:', error)
      }
    }

    const cargarCitas = async () => {
      if (!medicoId.value) return

      try {
        const respuesta = await api.get(`/ControladorCitas/por-medico/${medicoId.value}`)
        citas.value = respuesta.data
      } catch (error) {
        console.error('Error al cargar citas:', error)
      } finally {
        cargando.value = false
      }
    }

    const actualizarDisponibilidad = async () => {
      if (!medicoId.value) return

      try {
        await api.put(`/ControladorMedicos/${medicoId.value}/disponibilidad`, horariosDisponibles.value)
        alert('Disponibilidad actualizada correctamente')
      } catch (error) {
        alert('Error al actualizar la disponibilidad')
      }
    }

    onMounted(() => {
      cargarInformacionMedico()
    })

    return {
      citas,
      cargando,
      horariosDisponibles,
      formatearFecha,
      formatearHora,
      actualizarDisponibilidad
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
  max-width: 1200px;
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
  margin-bottom: 2rem;
}

.tarjeta h2 {
  margin-top: 0;
  color: #667eea;
}

.grupo-formulario {
  margin-bottom: 1rem;
}

.grupo-formulario label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
  font-weight: 500;
}

.grupo-formulario textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  font-family: monospace;
  box-sizing: border-box;
}

.btn-principal {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-principal:hover {
  transform: translateY(-2px);
}

.grid-citas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.tarjeta-cita {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.tarjeta-cita:hover {
  transform: translateY(-5px);
}

.encabezado-cita {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.encabezado-cita h3 {
  margin: 0;
  color: #667eea;
}

.cuerpo-cita p {
  margin: 0.5rem 0;
  color: #555;
}

.estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.estado.programada {
  background: #fff3cd;
  color: #856404;
}

.estado.confirmada {
  background: #d4edda;
  color: #155724;
}

.estado.cancelada {
  background: #f8d7da;
  color: #721c24;
}

.estado.completada {
  background: #d1ecf1;
  color: #0c5460;
}

.cargando,
.sin-datos {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}
</style>

