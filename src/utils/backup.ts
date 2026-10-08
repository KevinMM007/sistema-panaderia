import { db } from '../db';
import { BackupData } from '../types';

const BACKUP_VERSION = '1.0.0';

/**
 * Exporta toda la base de datos a un objeto JSON
 */
export async function exportBackup(): Promise<BackupData> {
  try {
    const [users, products, categories, sales, inventoryAdjustments] = await Promise.all([
      db.users.toArray(),
      db.products.toArray(),
      db.categories.toArray(),
      db.sales.toArray(),
      db.inventoryAdjustments.toArray(),
    ]);

    const backup: BackupData = {
      version: BACKUP_VERSION,
      timestamp: new Date(),
      users,
      products,
      categories,
      sales,
      inventoryAdjustments,
    };

    return backup;
  } catch (error) {
    console.error('Error al exportar backup:', error);
    throw new Error('No se pudo crear el backup');
  }
}

/**
 * Descarga un backup como archivo JSON
 */
export async function downloadBackup(): Promise<void> {
  try {
    const backup = await exportBackup();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const filename = `panaderia-backup-${timestamp}.json`;
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    URL.revokeObjectURL(url);
    console.log('✅ Backup descargado:', filename);
  } catch (error) {
    console.error('Error al descargar backup:', error);
    throw error;
  }
}

/**
 * Valida la estructura de un backup
 */
function validateBackup(data: any): data is BackupData {
  return (
    data &&
    typeof data === 'object' &&
    'version' in data &&
    'timestamp' in data &&
    'users' in data &&
    'products' in data &&
    'categories' in data &&
    'sales' in data &&
    'inventoryAdjustments' in data &&
    Array.isArray(data.users) &&
    Array.isArray(data.products) &&
    Array.isArray(data.categories) &&
    Array.isArray(data.sales) &&
    Array.isArray(data.inventoryAdjustments)
  );
}

/**
 * Importa un backup desde un objeto JSON
 */
export async function importBackup(backupData: BackupData): Promise<void> {
  try {
    // Validar estructura del backup
    if (!validateBackup(backupData)) {
      throw new Error('El archivo de backup no tiene el formato correcto');
    }

    // Confirmar con el usuario
    const confirmed = confirm(
      '⚠️ ADVERTENCIA: Esta acción eliminará todos los datos actuales y los reemplazará con los del backup.\n\n¿Estás seguro de continuar?'
    );

    if (!confirmed) {
      return;
    }

    // Limpiar todas las tablas
    await db.transaction('rw', db.users, db.products, db.categories, db.sales, db.inventoryAdjustments, async () => {
      await db.users.clear();
      await db.products.clear();
      await db.categories.clear();
      await db.sales.clear();
      await db.inventoryAdjustments.clear();

      // Importar datos del backup
      if (backupData.users.length > 0) await db.users.bulkAdd(backupData.users);
      if (backupData.products.length > 0) await db.products.bulkAdd(backupData.products);
      if (backupData.categories.length > 0) await db.categories.bulkAdd(backupData.categories);
      if (backupData.sales.length > 0) await db.sales.bulkAdd(backupData.sales);
      if (backupData.inventoryAdjustments.length > 0) {
        await db.inventoryAdjustments.bulkAdd(backupData.inventoryAdjustments);
      }
    });

    console.log('✅ Backup importado exitosamente');
    alert('✅ Backup restaurado exitosamente. La página se recargará.');
    window.location.reload();
  } catch (error) {
    console.error('Error al importar backup:', error);
    throw new Error('No se pudo importar el backup: ' + (error as Error).message);
  }
}

/**
 * Lee un archivo JSON y retorna su contenido parseado
 */
export async function readBackupFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        if (!validateBackup(data)) {
          reject(new Error('El archivo no es un backup válido'));
          return;
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Error al leer el archivo: archivo JSON inválido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Crea un backup automático en localStorage como respaldo temporal
 */
export async function createAutoBackup(): Promise<void> {
  try {
    const backup = await exportBackup();
    const jsonStr = JSON.stringify(backup);
    localStorage.setItem('panaderia-auto-backup', jsonStr);
    localStorage.setItem('panaderia-auto-backup-date', new Date().toISOString());
    console.log('✅ Backup automático creado');
  } catch (error) {
    console.error('Error al crear backup automático:', error);
  }
}

/**
 * Obtiene la fecha del último backup automático
 */
export function getLastAutoBackupDate(): Date | null {
  const dateStr = localStorage.getItem('panaderia-auto-backup-date');
  return dateStr ? new Date(dateStr) : null;
}
