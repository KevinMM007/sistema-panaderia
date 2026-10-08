# Sistema de Gestión y Punto de Venta - Panadería

Sistema 100% offline diseñado como PWA para gestionar ventas, inventario y reportes de una panadería local.

## 🚀 Características

- ✅ 100% Offline - No requiere internet
- ✅ PWA - Instalable en tablets Android y PC Windows
- ✅ Sistema de usuarios (Admin/Cajero)
- ✅ Punto de Venta táctil e intuitivo
- ✅ Gestión de inventario en tiempo real
- ✅ Reportes y análisis de ventas
- ✅ Sistema de respaldos manual

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **Dexie.js** - Base de datos local (IndexedDB)
- **Zustand** - Gestión de estado
- **Workbox** - Service Worker y offline capabilities

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/       # Componentes React reutilizables
├── pages/           # Páginas principales (POS, Admin, Login)
├── db/              # Configuración de Dexie/IndexedDB
├── store/           # Stores de Zustand
├── types/           # Tipos TypeScript
├── utils/           # Funciones auxiliares
└── hooks/           # Custom hooks
```

## 👥 Usuarios por Defecto

- **Admin**: PIN `1234`
- **Cajero**: PIN `0000`

(Cambiar después del primer inicio)

## 📱 Uso

1. **Primer Inicio**: Ingresar como Admin y configurar productos
2. **Gestión de Inventario**: Actualizar stock diario
3. **Ventas**: El cajero usa el módulo POS
4. **Cierre de Día**: Generar corte de caja y backup

## 🔐 Seguridad

- Contraseñas hasheadas con bcrypt
- Sin conexión externa de datos
- Backups manuales recomendados diariamente
- Auditoría de todas las acciones

## 📊 Reportes Disponibles

- Corte de caja diario
- Productos más/menos vendidos
- Análisis de horas pico
- Historial de ventas

---

Desarrollado para panadería local - 2025
