import { db } from './index';
import { hashPassword } from '../utils/auth';
import { User, Category } from '../types';

export async function initializeDatabase(): Promise<void> {
  try {
    // Verificar si ya hay usuarios
    const userCount = await db.users.count();
    
    if (userCount === 0) {
      console.log('Inicializando base de datos...');
      
      // Crear usuarios por defecto
      const defaultUsers: User[] = [
        {
          id: 'admin-1',
          username: 'admin',
          passwordHash: await hashPassword('1234'),
          role: 'admin',
          createdAt: new Date(),
        },
        {
          id: 'cashier-1',
          username: 'cajero',
          passwordHash: await hashPassword('0000'),
          role: 'cashier',
          createdAt: new Date(),
        },
      ];
      
      await db.users.bulkAdd(defaultUsers);
      console.log('✅ Usuarios creados');
      
      // Crear categorías por defecto
      const defaultCategories: Category[] = [
        { id: 'cat-1', name: 'Pan Blanco', order: 1 },
        { id: 'cat-2', name: 'Feité', order: 2 },
        { id: 'cat-3', name: 'Fina', order: 3 },
        { id: 'cat-4', name: 'Migajón', order: 4 },
        { id: 'cat-5', name: 'Dulce', order: 5 },
        { id: 'cat-6', name: 'Especial', order: 6 },
      ];
      
      await db.categories.bulkAdd(defaultCategories);
      console.log('✅ Categorías creadas');
      
      console.log('✅ Base de datos inicializada correctamente');
    }
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    throw error;
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    await db.delete();
    await db.open();
    await initializeDatabase();
    console.log('✅ Base de datos reiniciada');
  } catch (error) {
    console.error('❌ Error al reiniciar la base de datos:', error);
    throw error;
  }
}
