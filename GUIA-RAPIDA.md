# 🎯 Guía Rápida - Sistema Panadería

## 🚀 Inicio Rápido (5 minutos)

### 1️⃣ Instalar y Ejecutar
```bash
cd C:\Users\moral\Documents\SistemaPanaderia
npm install
npm run dev
```
Abre: http://localhost:3000

### 2️⃣ Primer Login
- Usuario: `admin`
- Contraseña: `1234`

### 3️⃣ Cargar Productos de Ejemplo
1. Ve a: **Configuración** → **Datos de Prueba**
2. Click en "Cargar Productos de Ejemplo"
3. ¡Listo! Ya tienes 20+ productos

### 4️⃣ Hacer tu Primera Venta
1. Cierra sesión y entra como `cajero` / `0000`
2. Click en productos para agregarlos al carrito
3. Click en "Cobrar"
4. Ingresa el monto pagado
5. ¡Venta completada!

---

## 📚 Flujos de Trabajo

### 📦 Agregar Productos (Admin)
1. **Productos** → **Nuevo Producto**
2. Llenar formulario
3. Elegir emoji/icono
4. Guardar

### 📊 Actualizar Inventario (Admin)
1. **Inventario** → Click en "Actualizar" del producto
2. Ingresar nuevo stock
3. Seleccionar razón (ej: "Horneada del día")
4. Confirmar

### 💰 Realizar Venta (Cajero)
1. Seleccionar productos del catálogo
2. Ajustar cantidades con +/-
3. Click en "Cobrar"
4. Ingresar monto pagado
5. Sistema muestra el cambio

### 📈 Ver Reportes (Admin)
1. **Reportes** → "Generar Corte de Caja"
2. Ver estadísticas del día
3. Productos más vendidos
4. Ventas por hora

### 💾 Crear Backup (Admin)
1. **Configuración** → "Descargar Backup"
2. Guardar archivo .json en lugar seguro
3. **¡Hacer esto DIARIAMENTE!**

---

## ⌨️ Atajos Útiles

| Acción | Atajo |
|--------|-------|
| Abrir DevTools | `F12` |
| Recargar página | `F5` o `Ctrl+R` |
| Limpiar caché | `Ctrl+Shift+Delete` |
| Cerrar sesión | Botón "Salir" |

---

## 🔧 Solución Rápida de Problemas

### ❌ No aparecen productos
**Solución:** Cargar productos de ejemplo o agregar manualmente

### ❌ Error al vender (stock insuficiente)
**Solución:** Actualizar stock del producto en Inventario

### ❌ La página no carga
**Solución:** 
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
npm run dev
```

### ❌ Base de datos corrupta
**Solución:**
1. F12 → Application → IndexedDB
2. Eliminar "PanaderiaDB"
3. Recargar página (F5)
4. Importar último backup

---

## 📱 Instalar como App

### En PC (Chrome/Edge)
1. Click en ícono ⊕ en barra de direcciones
2. "Instalar Sistema Panadería"
3. ¡Listo! Ahora es una app

### En Tablet Android
1. Abrir en Chrome
2. Menú ⋮ → "Agregar a pantalla de inicio"
3. Confirmar instalación

---

## 🎨 Personalización

### Cambiar Colores
Editar: `tailwind.config.js`
```js
colors: {
  primary: {
    500: '#tu-color-aqui'
  }
}
```

### Cambiar Logo/Nombre
Editar: `index.html` y `vite.config.ts`

---

## 📞 Usuarios del Sistema

| Usuario | Contraseña | Rol | Acceso |
|---------|-----------|-----|--------|
| admin | 1234 | Administrador | TODO |
| cajero | 0000 | Cajero | Solo POS |

⚠️ **CAMBIAR ESTAS CONTRASEÑAS DESPUÉS DEL PRIMER USO**

---

## ✅ Checklist Diario

### Al Abrir (Mañana)
- [ ] Login como Admin
- [ ] Actualizar stock (productos horneados)
- [ ] Cambiar a usuario Cajero
- [ ] ¡Listo para vender!

### Al Cerrar (Noche)
- [ ] Login como Admin
- [ ] Generar Corte de Caja
- [ ] Comparar con efectivo físico
- [ ] Crear Backup del día
- [ ] Guardar backup en USB/correo

---

## 🆘 Contacto de Emergencia

Si algo sale mal y no puedes resolverlo:

1. **SIEMPRE** ten un backup reciente
2. Toma captura del error (F12 → Console)
3. No reinicies la BD sin backup

---

## 🎓 Tips Pro

💡 **Usa filtros de categoría** para encontrar productos más rápido

💡 **Mantén el stock actualizado** cada mañana

💡 **Revisa "Stock Bajo"** en el dashboard de Inventario

💡 **Genera reportes semanalmente** para analizar tendencias

💡 **Haz backups automáticos** guardándolos en 3 lugares diferentes

---

## 🌟 Características Destacadas

✨ **100% Offline** - Funciona sin internet
✨ **Instantáneo** - Sin delays ni esperas
✨ **Seguro** - Datos solo en tu dispositivo
✨ **Simple** - Interfaz intuitiva
✨ **Completo** - Todo lo que necesitas

---

**¿Listo para empezar? ¡Adelante! 🚀🥖**
