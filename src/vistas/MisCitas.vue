<template>
  <div class="contenedor-pagina">
    <div class="contenedor">
      <h1>Mis Citas</h1>
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
            <h3>{{ cita.nombreMedico }}</h3>
            <span class="estado" :class="cita.estado.toLowerCase()">
              {{ cita.estado }}
            </span>
          </div>
          <div class="cuerpo-cita">
            <p><strong>Especialidad:</strong> {{ cita.especialidadMedico }}</p>
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
import api from '../servicios/api'

export default {
  name: 'MisCitas',
  setup() {
    const citas = ref([])
    const cargando = ref(true)

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

    const cargarCitas = async () => {
      try {
        const respuesta = await api.get('/ControladorCitas/mis-citas')
        citas.value = respuesta.data
      } catch (error) {
        console.error('Error al cargar citas:', error)
      } finally {
        cargando.value = false
      }
    }

    onMounted(() => {
      cargarCitas()
    })

    return {
      citas,
      cargando,
      formatearFecha,
      formatearHora
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

