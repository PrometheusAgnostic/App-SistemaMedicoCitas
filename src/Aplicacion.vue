<template>
  <div id="aplicacion">
    <nav v-if="estaAutenticado" class="barra-navegacion">
      <div class="contenedor-nav">
        <h1 class="logo-nav">Sistema de Citas Médicas</h1>
        <div class="menu-nav">
          <router-link to="/panel" class="enlace-nav">Panel</router-link>
          <router-link v-if="rolUsuario === 'Paciente'" to="/mis-citas" class="enlace-nav">Mis Citas</router-link>
          <router-link v-if="rolUsuario === 'Paciente'" to="/nueva-cita" class="enlace-nav">Nueva Cita</router-link>
          <router-link v-if="rolUsuario === 'Medico'" to="/citas-medico" class="enlace-nav">Mis Citas</router-link>
          <router-link v-if="rolUsuario === 'Admin'" to="/administracion" class="enlace-nav">Administración</router-link>
          <span class="usuario-nav">{{ nombreUsuario }}</span>
          <button @click="cerrarSesion" class="btn-cerrar-sesion">Cerrar Sesión</button>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { usarTiendaAutenticacion } from './almacenes/autenticacion'

export default {
  name: 'Aplicacion',
  setup() {
    const enrutador = useRouter()
    const tiendaAutenticacion = usarTiendaAutenticacion()

    const estaAutenticado = computed(() => tiendaAutenticacion.estaAutenticado.value)
    const nombreUsuario = computed(() => tiendaAutenticacion.usuario.value?.nombre || '')
    const rolUsuario = computed(() => tiendaAutenticacion.usuario.value?.rol || '')

    const cerrarSesion = () => {
      tiendaAutenticacion.cerrarSesion()
      enrutador.push('/iniciar-sesion')
    }

    return {
      estaAutenticado,
      nombreUsuario,
      rolUsuario,
      cerrarSesion
    }
  }
}
</script>

<style scoped>
.barra-navegacion {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.contenedor-nav {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.logo-nav {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.menu-nav {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.enlace-nav {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  transition: background 0.3s;
}

.enlace-nav:hover,
.enlace-nav.router-link-active {
  background: rgba(255,255,255,0.2);
}

.usuario-nav {
  font-weight: 500;
  padding: 0.5rem 1rem;
}

.btn-cerrar-sesion {
  background: rgba(255,255,255,0.2);
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-cerrar-sesion:hover {
  background: rgba(255,255,255,0.3);
}
</style>

