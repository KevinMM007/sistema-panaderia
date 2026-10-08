import { db } from '../db';
import { Product } from '../types';
import { generateId } from './auth';

/**
 * Productos de ejemplo para pruebas
 */
const sampleProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Pan Blanco
  { name: 'Bolillo', category: 'Pan Blanco', price: 3.00, stock: 50, imageUrl: '🥖' },
  { name: 'Telera', category: 'Pan Blanco', price: 4.00, stock: 40, imageUrl: '🥖' },
  { name: 'Birote', category: 'Pan Blanco', price: 4.50, stock: 30, imageUrl: '🥖' },
  
  // Feité
  { name: 'Concha Chocolate', category: 'Feité', price: 8.00, stock: 45, imageUrl: '🥐' },
  { name: 'Concha Vainilla', category: 'Feité', price: 8.00, stock: 42, imageUrl: '🥐' },
  { name: 'Oreja', category: 'Feité', price: 9.00, stock: 35, imageUrl: '🥐' },
  { name: 'Polvorón', category: 'Feité', price: 7.00, stock: 38, imageUrl: '🥐' },
  
  // Dulce
  { name: 'Dona Glaseada', category: 'Dulce', price: 12.00, stock: 28, imageUrl: '🍩' },
  { name: 'Cuerno', category: 'Dulce', price: 10.00, stock: 32, imageUrl: '🥐' },
  { name: 'Cocol', category: 'Dulce', price: 6.00, stock: 40, imageUrl: '🥐' },
  { name: 'Beso', category: 'Dulce', price: 8.00, stock: 30, imageUrl: '🥐' },
  { name: 'Empanada', category: 'Dulce', price: 11.00, stock: 25, imageUrl: '🥟' },
  
  // Fina
  { name: 'Croissant', category: 'Fina', price: 15.00, stock: 24, imageUrl: '🥐' },
  { name: 'Pan de Muerto', category: 'Fina', price: 35.00, stock: 15, imageUrl: '🍞' },
  { name: 'Rol de Canela', category: 'Fina', price: 18.00, stock: 20, imageUrl: '🥐' },
  
  // Migajón
  { name: 'Pan Blanco Grande', category: 'Migajón', price: 28.00, stock: 12, imageUrl: '🍞' },
  { name: 'Pan Integral', category: 'Migajón', price: 32.00, stock: 10, imageUrl: '🍞' },
  { name: 'Pan de Caja', category: 'Migajón', price: 25.00, stock: 15, imageUrl: '🍞' },
  
  // Especial
  { name: 'Rosca de Reyes', category: 'Especial', price: 120.00, stock: 5, imageUrl: '👑' },
  { name: 'Pastel de Tres Leches', category: 'Especial', price: 180.00, stock: 3, imageUrl: '🎂' },
];

/**
 * Carga productos de ejemplo en la base de datos
 */
export async function seedSampleProducts(): Promise<void> {
  try {
    const existingProducts = await db.products.count();
    
    if (existingProducts > 0) {
      const confirmed = confirm(
        `Ya hay ${existingProducts} productos en la base de datos.\n\n¿Deseas agregar los productos de ejemplo de todas formas?`
      );
      
      if (!confirmed) return;
    }

    const now = new Date();
    const productsWithIds: Product[] = sampleProducts.map(product => ({
      ...product,
      id: generateId('prod'),
      createdAt: now,
      updatedAt: now,
    }));

    await db.products.bulkAdd(productsWithIds);
    
    console.log(`✅ ${productsWithIds.length} productos de ejemplo agregados`);
    alert(`✅ ${productsWithIds.length} productos de ejemplo agregados exitosamente`);
  } catch (error) {
    console.error('Error al cargar productos de ejemplo:', error);
    throw error;
  }
}

/**
 * Elimina todos los productos
 */
export async function clearAllProducts(): Promise<void> {
  try {
    const count = await db.products.count();
    
    if (count === 0) {
      alert('No hay productos para eliminar');
      return;
    }

    const confirmed = confirm(
      `⚠️ ADVERTENCIA: Esta acción eliminará los ${count} productos existentes.\n\n¿Estás seguro?`
    );

    if (!confirmed) return;

    await db.products.clear();
    console.log('✅ Todos los productos eliminados');
    alert('✅ Todos los productos eliminados');
  } catch (error) {
    console.error('Error al eliminar productos:', error);
    throw error;
  }
}
