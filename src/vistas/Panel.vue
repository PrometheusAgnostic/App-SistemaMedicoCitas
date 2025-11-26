<template>
  <div class="panel">
    <div class="contenedor">
      <h1>Bienvenido, {{ nombreUsuario }}</h1>
      <div class="contenido-panel">
        <div class="tarjeta">
          <h2>Información del Usuario</h2>
          <p><strong>Nombre:</strong> {{ usuario?.nombre }}</p>
          <p><strong>Correo:</strong> {{ usuario?.correo }}</p>
          <p><strong>Rol:</strong> {{ usuario?.rol }}</p>
        </div>

        <div v-if="rolUsuario === 'Paciente'" class="tarjeta">
          <h2>Acciones Rápidas</h2>
          <router-link to="/nueva-cita" class="btn-principal">Nueva Cita</router-link>
          <router-link to="/mis-citas" class="btn-secundario">Ver Mis Citas</router-link>
        </div>

        <div v-if="rolUsuario === 'Medico'" class="tarjeta">
          <h2>Acciones Rápidas</h2>
          <router-link to="/citas-medico" class="btn-principal">Ver Mis Citas</router-link>
        </div>

        <div v-if="rolUsuario === 'Admin'" class="tarjeta">
          <h2>Panel de Administración</h2>
          <router-link to="/administracion" class="btn-principal">Gestionar Sistema</router-link>
        </div>

        <!-- RF-06: Listado de citas por día -->
        <div class="tarjeta">
          <h2>Citas del Día</h2>
          <div class="grupo-formulario">
            <label>Seleccionar Fecha:</label>
            <input type="date" v-model="fechaSeleccionada" @change="cargarCitasPorFecha" />
          </div>
          <div v-if="cargando" class="cargando">Cargando...</div>
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
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { usarTiendaAutenticacion } from '../almacenes/autenticacion'
import api from '../servicios/api'

export default {
  name: 'Panel',
  setup() {
    const tiendaAutenticacion = usarTiendaAutenticacion()
    const usuario = computed(() => tiendaAutenticacion.usuario.value)
    const nombreUsuario = computed(() => usuario.value?.nombre || 'Usuario')
    const rolUsuario = computed(() => usuario.value?.rol || '')
    
    const fechaSeleccionada = ref(new Date().toISOString().split('T')[0])
    const citasDiarias = ref([])
    const cargando = ref(false)

    const formatearHora = (intervaloTiempo) => {
      const tiempo = intervaloTiempo.split(':')
      return `${tiempo[0]}:${tiempo[1]}`
    }

    const cargarCitasPorFecha = async () => {
      cargando.value = true
      try {
        const respuesta = await api.get(`/ControladorCitas/por-fecha?fecha=${fechaSeleccionada.value}`)
        citasDiarias.value = respuesta.data
      } catch (error) {
        console.error('Error al cargar citas:', error)
      } finally {
        cargando.value = false
      }
    }

    onMounted(() => {
      cargarCitasPorFecha()
    })

    return {
      usuario,
      nombreUsuario,
      rolUsuario,
      fechaSeleccionada,
      citasDiarias,
      cargando,
      formatearHora,
      cargarCitasPorFecha
    }
  }
}
</script>

<style scoped>
.panel {
  min-height: calc(100vh - 80px);
  padding: 2rem;
  background: #f5f5f5;
}

.contenedor {
  max-width: 1200px;
  margin: 0 auto;
}

.panel h1 {
  color: #333;
  margin-bottom: 2rem;
}

.contenido-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
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
  font-size: 1.5rem;
}

.btn-principal,
.btn-secundario {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  margin: 0.5rem 0.5rem 0.5rem 0;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: transform 0.2s;
}

.btn-principal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-secundario {
  background: #6c757d;
  color: white;
}

.btn-principal:hover,
.btn-secundario:hover {
  transform: translateY(-2px);
}

.grupo-formulario {
  margin-bottom: 1rem;
}

.grupo-formulario label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

.grupo-formulario input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
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

.info-cita {
  color: #333;
}

.info-cita small {
  color: #666;
}

.estado {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-top: 0.5rem;
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
  padding: 2rem;
  color: #666;
}
</style>

