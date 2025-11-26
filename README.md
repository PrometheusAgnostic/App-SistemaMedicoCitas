# 🟢 Frontend - Sistema de Citas Médicas

## 📍 Ubicación
Esta carpeta contiene **TODO el código del Frontend** desarrollado en **Vue.js 3**

## 🚀 Cómo Abrir

1. Abrir **VS Code**
2. **File → Open Folder**
3. Seleccionar: `Frontend/`

## 📁 Estructura

```
Frontend/
├── src/
│   ├── vistas/                      ← Vistas/Páginas Vue
│   │   ├── IniciarSesion.vue
│   │   ├── Registro.vue
│   │   ├── Panel.vue
│   │   ├── NuevaCita.vue
│   │   ├── MisCitas.vue
│   │   ├── CitasMedico.vue
│   │   └── Administracion.vue
│   │
│   ├── almacenes/                   ← Estado global
│   │   └── autenticacion.js
│   │
│   ├── servicios/                   ← Servicios HTTP
│   │   └── api.js
│   │
│   ├── enrutador/                   ← Enrutamiento
│   │   └── index.js
│   │
│   ├── Aplicacion.vue               ← Componente raíz
│   ├── main.js                      ← Punto de entrada
│   └── estilos.css                  ← Estilos globales
│
├── package.json                     ← Dependencias npm
├── vite.config.js                   ← Configuración de Vite
└── index.html                       ← HTML principal
```

## ⚙️ Configuración

### 1. Instalar Dependencias
En la terminal:
```bash
npm install
```

### 2. Verificar Configuración
Abrir `vite.config.js` y verificar que el proxy apunte al backend:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

### 3. Ejecutar
```bash
npm run dev
```

## ✅ Verificación

- Frontend corriendo en: `http://localhost:5173`
- Interfaz visible en el navegador
- Sin errores en la consola del navegador

## 📚 Tecnologías

- Vue.js 3
- Vue Router
- Axios
- Vite
- HTML5/CSS3

## 🔑 Rutas Principales

- `/iniciar-sesion` - Iniciar sesión
- `/registro` - Registro de usuarios
- `/panel` - Panel principal
- `/nueva-cita` - Agendar nueva cita (Paciente)
- `/mis-citas` - Ver mis citas (Paciente)
- `/citas-medico` - Ver citas (Médico)
- `/administracion` - Panel de administración (Admin)

## 📝 Notas

- Todos los nombres de variables, funciones y componentes están en español
- Los nombres de tecnologías (Vue, router, computed, ref, etc.) se mantienen en inglés
- El código está completamente documentado en español

