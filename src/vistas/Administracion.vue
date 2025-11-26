<template>
  <div class="contenedor-pagina">
    <div class="contenedor">
      <h1>Panel de Administración</h1>

      <div class="tabs-administracion">
        <button 
          @click="tabActivo = 'citas'"
          :class="['boton-tab', { activo: tabActivo === 'citas' }]"
        >
          Gestionar Citas
        </button>
        <button 
          @click="tabActivo = 'diario'"
          :class="['boton-tab', { activo: tabActivo === 'diario' }]"
        >
          Citas por Día
        </button>
      </div>

      <!-- Tab: Gestionar Citas -->
      <div v-if="tabActivo === 'citas'" class="contenido-tab">
        <div class="tarjeta">
          <h2>Todas las Citas</h2>
          <div v-if="cargando" class="cargando">Cargando...</div>
          <div v-else class="tabla-citas">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Médico</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cita in todasLasCitas" :key="cita.id">
                  <td>{{ cita.id }}</td>
                  <td>{{ cita.nombrePaciente }}</td>
                  <td>{{ cita.nombreMedico }}</td>
                  <td>{{ formatearFecha(cita.fechaCita) }}</td>
                  <td>{{ formatearHora(cita.horaCita) }}</td>
                  <td>
                    <span class="estado" :class="cita.estado.toLowerCase()">
                      {{ cita.estado }}
                    </span>
                  </td>
                  <td>
                    <button 
                      @click="abrirModalEdicion(cita)"
                      class="btn-editar"
                    >
                      Editar
                    </button>
                    <button 
                      @click="eliminarCita(cita.id)"
                      class="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Tab: Citas por Día -->
      <div v-if="tabActivo === 'diario'" class="contenido-tab">
        <div class="tarjeta">
          <h2>Citas por Día</h2>
          <div class="grupo-formulario">
            <label>Seleccionar Fecha:</label>
            <input type="date" v-model="fechaSeleccionada" @change="cargarCitasDiarias" />
          </div>
          <div v-if="cargandoDiario" class="cargando">Cargando...</div>
          <div v-else-if="citasDiarias.length === 0" class="sin-datos">
            No hay citas programadas para esta fecha
          </div>
          <div v-else class="lista-citas">
            <div 
              v-for="cita in citasDiarias" 
              :key="cita.id"
              class="item-cita"
            >
              <div class="info-cita">
                <strong>{{ cita.nombreMedico }}</strong> - {{ cita.especialidadMedico }}
                <br>
                <small>Paciente: {{ cita.nombrePaciente }}</small>
                <br>
                <small>Hora: {{ formatearHora(cita.horaCita) }}</small>
                <br>
                <span class="estado" :class="cita.estado.toLowerCase()">
                  {{ cita.estado }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Edición -->
      <div v-if="mostrarModalEdicion" class="overlay-modal" @click="cerrarModalEdicion">
        <div class="contenido-modal" @click.stop>
          <h2>Editar Cita</h2>
          <form @submit.prevent="guardarCita">
            <div class="grupo-formulario">
              <label>Médico</label>
              <select v-model="formularioEdicion.medicoId" required>
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
              <label>Fecha</label>
              <input type="date" v-model="formularioEdicion.fechaCita" required />
            </div>
            <div class="grupo-formulario">
              <label>Hora</label>
              <input type="time" v-model="formularioEdicion.horaCita" required />
            </div>
            <div class="grupo-formulario">
              <label>Estado</label>
              <select v-model="formularioEdicion.estado" required>
                <option value="Programada">Programada</option>
                <option value="Confirmada">Confirmada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
            <div class="grupo-formulario">
              <label>Motivo</label>
              <textarea v-model="formularioEdicion.motivo" rows="3"></textarea>
            </div>
            <div class="acciones-modal">
              <button type="button" @click="cerrarModalEdicion" class="btn-secundario">Cancelar</button>
              <button type="submit" class="btn-principal">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '../servicios/api'

export default {
  name: 'Administracion',
  setup() {
    const tabActivo = ref('citas')
    const todasLasCitas = ref([])
    const citasDiarias = ref([])
    const medicos = ref([])
    const cargando = ref(false)
    const cargandoDiario = ref(false)
    const fechaSeleccionada = ref(new Date().toISOString().split('T')[0])
    const mostrarModalEdicion = ref(false)
    const formularioEdicion = ref({
      id: null,
      medicoId: '',
      fechaCita: '',
      horaCita: '',
      estado: '',
      motivo: ''
    })

    const formatearFecha = (cadenaFecha) => {
      const fecha = new Date(cadenaFecha)
      return fecha.toLocaleDateString('es-ES')
    }

    const formatearHora = (intervaloTiempo) => {
      const tiempo = intervaloTiempo.split(':')
      return `${tiempo[0]}:${tiempo[1]}`
    }

    const cargarTodasLasCitas = async () => {
      cargando.value = true
      try {
        // Cargar citas de todos los médicos
        const respuestaMedicos = await api.get('/ControladorMedicos')
        medicos.value = respuestaMedicos.data

        const promesasCitas = medicos.value.map(medico => 
          api.get(`/ControladorCitas/por-medico/${medico.id}`)
        )
        const respuestas = await Promise.all(promesasCitas)
        
        todasLasCitas.value = respuestas.flatMap(r => r.data)
      } catch (error) {
        console.error('Error al cargar citas:', error)
      } finally {
        cargando.value = false
      }
    }

    const cargarCitasDiarias = async () => {
      cargandoDiario.value = true
      try {
        const respuesta = await api.get(`/ControladorCitas/por-fecha?fecha=${fechaSeleccionada.value}`)
        citasDiarias.value = respuesta.data
      } catch (error) {
        console.error('Error al cargar citas diarias:', error)
      } finally {
        cargandoDiario.value = false
      }
    }

    const abrirModalEdicion = (cita) => {
      formularioEdicion.value = {
        id: cita.id,
        medicoId: cita.medicoId,
        fechaCita: new Date(cita.fechaCita).toISOString().split('T')[0],
        horaCita: formatearHora(cita.horaCita),
        estado: cita.estado,
        motivo: cita.motivo || ''
      }
      mostrarModalEdicion.value = true
    }

    const cerrarModalEdicion = () => {
      mostrarModalEdicion.value = false
      formularioEdicion.value = {
        id: null,
        medicoId: '',
        fechaCita: '',
        horaCita: '',
        estado: '',
        motivo: ''
      }
    }

    const guardarCita = async () => {
      try {
        const datosActualizacion = {
          medicoId: parseInt(formularioEdicion.value.medicoId),
          fechaCita: new Date(`${formularioEdicion.value.fechaCita}T${formularioEdicion.value.horaCita}`),
          horaCita: formularioEdicion.value.horaCita,
          estado: formularioEdicion.value.estado,
          motivo: formularioEdicion.value.motivo || null
        }

        await api.put(`/ControladorCitas/${formularioEdicion.value.id}`, datosActualizacion)
        cerrarModalEdicion()
        await cargarTodasLasCitas()
        alert('Cita actualizada correctamente')
      } catch (error) {
        alert(error.response?.data?.mensaje || 'Error al actualizar la cita')
      }
    }

    const eliminarCita = async (id) => {
      if (!confirm('¿Está seguro de eliminar esta cita?')) return

      try {
        await api.delete(`/ControladorCitas/${id}`)
        await cargarTodasLasCitas()
        alert('Cita eliminada correctamente')
      } catch (error) {
        alert('Error al eliminar la cita')
      }
    }

    onMounted(() => {
      cargarTodasLasCitas()
      cargarCitasDiarias()
    })

    return {
      tabActivo,
      todasLasCitas,
      citasDiarias,
      medicos,
      cargando,
      cargandoDiario,
      fechaSeleccionada,
      mostrarModalEdicion,
      formularioEdicion,
      formatearFecha,
      formatearHora,
      cargarCitasDiarias,
      abrirModalEdicion,
      cerrarModalEdicion,
      guardarCita,
      eliminarCita
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
  max-width: 1400px;
  margin: 0 auto;
}

h1 {
  color: #333;
  margin-bottom: 2rem;
}

.tabs-administracion {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.boton-tab {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.boton-tab.activo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.contenido-tab {
  margin-top: 1rem;
}

.tarjeta {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.tarjeta h2 {
  margin-top: 0;
  color: #667eea;
}

.tabla-citas {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8f9fa;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.btn-editar,
.btn-eliminar {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.875rem;
}

.btn-editar {
  background: #17a2b8;
  color: white;
}

.btn-eliminar {
  background: #dc3545;
  color: white;
}

.btn-editar:hover,
.btn-eliminar:hover {
  opacity: 0.8;
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

.overlay-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.contenido-modal {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.contenido-modal h2 {
  margin-top: 0;
  color: #667eea;
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
}

.acciones-modal {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-principal,
.btn-secundario {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
}

.btn-principal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secundario {
  background: #6c757d;
  color: white;
}

.cargando,
.sin-datos {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.lista-citas {
  margin-top: 1rem;
}

.item-cita {
  padding: 1rem;
  margin-bottom: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  border-left: 4px solid #667eea;
}
</style>

