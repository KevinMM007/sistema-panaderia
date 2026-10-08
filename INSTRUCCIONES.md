# 🚀 Guía de Instalación y Ejecución

## Requisitos Previos

Asegúrate de tener instalado:
- **Node.js** (versión 18 o superior) - [Descargar aquí](https://nodejs.org/)
- **npm** (viene con Node.js)

Para verificar si los tienes instalados, abre una terminal y ejecuta:
```bash
node --version
npm --version
```

## 📦 Instalación

### Paso 1: Navegar al directorio del proyecto

Abre una terminal (CMD, PowerShell, o Git Bash) y navega a la carpeta del proyecto:

```bash
cd C:\Users\moral\Documents\SistemaPanaderia
```

### Paso 2: Instalar dependencias

Ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
npm install
```

Este proceso puede tomar varios minutos. Espera a que termine completamente.

### Paso 3: Iniciar el servidor de desarrollo

Una vez instaladas las dependencias, inicia el servidor de desarrollo:

```bash
npm run dev
```

Verás un mensaje similar a:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### Paso 4: Abrir en el navegador

Abre tu navegador favorito (Chrome, Edge, Firefox) y ve a:
```
http://localhost:3000
```

## 🎯 Primer Uso

### Credenciales de Acceso

El sistema viene con dos usuarios por defecto:

**Administrador:**
- Usuario: `admin`
- Contraseña: `1234`

**Cajero:**
- Usuario: `cajero`
- Contraseña: `0000`

### Cargando Productos de Ejemplo

Para facilitar las pruebas, puedes cargar productos de ejemplo:

1. Abre la **Consola del Navegador** (F12 o clic derecho → Inspeccionar → Consola)
2. Copia y pega este código:

```javascript
import { seedSampleProducts } from './src/utils/sampleData';
await seedSampleProducts();
```

O en la consola del navegador mientras estás en la aplicación:

```javascript
// Esto cargará 20+ productos de ejemplo
const { seedSampleProducts } = await import('/src/utils/sampleData.ts');
await seedSampleProducts();
```

## 🏗️ Compilar para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/`.

Para previsualizar la versión de producción:

```bash
npm run preview
```

## 📱 Instalar como PWA

Una vez que la aplicación esté corriendo:

1. En Chrome/Edge: Busca el ícono de **instalar** (⊕) en la barra de direcciones
2. Haz clic en "Instalar"
3. La aplicación se abrirá como una app independiente

En Android/Tablet:
1. Abre la app en Chrome
2. Menú (⋮) → "Agregar a pantalla de inicio"
3. Confirma la instalación

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
# Elimina node_modules y reinstala
rm -rf node_modules
npm install
```

### Error: "Port 3000 is already in use"
```bash
# Cambia el puerto en vite.config.ts o usa otro puerto:
npm run dev -- --port 3001
```

### La base de datos no se inicializa
1. Abre DevTools (F12) → Application → IndexedDB
2. Elimina "PanaderiaDB"
3. Recarga la página (F5)

### Limpiar caché del navegador
- Chrome/Edge: `Ctrl + Shift + Delete` → Selecciona "Cached images and files"
- O en DevTools: Application → Clear storage → Clear site data

## 📚 Estructura de Carpetas

```
SistemaPanaderia/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas principales
│   ├── db/             # Configuración de base de datos
│   ├── store/          # Estado global (Zustand)
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Funciones auxiliares
│   └── hooks/          # Custom hooks
├── public/             # Archivos estáticos
└── dist/              # Build de producción (generado)
```

## 🆘 Soporte

Si encuentras algún problema:

1. Verifica que Node.js esté actualizado
2. Revisa la consola del navegador (F12) en busca de errores
3. Asegúrate de que no haya errores en la terminal donde ejecutaste `npm run dev`

## 🎉 ¡Listo!

Tu sistema de panadería está funcionando. Ahora puedes:
- ✅ Agregar productos desde el panel de administración
- ✅ Gestionar inventario
- ✅ Realizar ventas desde el POS
- ✅ Generar reportes
- ✅ Crear backups de tus datos

¡Disfruta tu sistema de gestión! 🥖🥐🍞
