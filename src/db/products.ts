import { db } from '../db';
import { Product, InventoryAdjustment } from '../types';
import { generateId } from '../utils/auth';

/**
 * Crea un nuevo producto
 */
export async function createProduct(
  productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Product> {
  const now = new Date();
  const product: Product = {
    ...productData,
    id: generateId('prod'),
    createdAt: now,
    updatedAt: now,
  };

  await db.products.add(product);
  console.log('✅ Producto creado:', product.name);
  return product;
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'createdAt'>>
): Promise<void> {
  const product = await db.products.get(id);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  await db.products.update(id, {
    ...updates,
    updatedAt: new Date(),
  });

  console.log('✅ Producto actualizado:', product.name);
}

/**
 * Elimina un producto
 */
export async function deleteProduct(id: string): Promise<void> {
  const product = await db.products.get(id);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  // Verificar si hay ventas con este producto
  const salesWithProduct = await db.sales
    .filter(sale => sale.items.some(item => item.productId === id))
    .count();

  if (salesWithProduct > 0) {
    const confirmed = confirm(
      `Este producto tiene ${salesWithProduct} ventas asociadas.\n\n` +
      '¿Estás seguro de eliminarlo? Las ventas no se eliminarán.'
    );
    
    if (!confirmed) return;
  }

  await db.products.delete(id);
  console.log('✅ Producto eliminado:', product.name);
}

/**
 * Actualiza el stock de un producto
 */
export async function updateStock(
  productId: string,
  newStock: number,
  reason: string,
  userId: string,
  userName: string
): Promise<void> {
  const product = await db.products.get(productId);
  
  if (!product) {
    throw new Error('Producto no encontrado');
  }

  const previousStock = product.stock;
  const adjustment = newStock - previousStock;

  // Actualizar el stock
  await db.products.update(productId, {
    stock: newStock,
    updatedAt: new Date(),
  });

  // Registrar el ajuste de inventario
  const inventoryAdjustment: InventoryAdjustment = {
    id: generateId('inv'),
    productId,
    productName: product.name,
    previousStock,
    newStock,
    adjustment,
    reason,
    userId,
    userName,
    timestamp: new Date(),
  };

  await db.inventoryAdjustments.add(inventoryAdjustment);
  
  console.log(`✅ Stock actualizado: ${product.name} (${previousStock} → ${newStock})`);
}

/**
 * Reduce el stock de múltiples productos (usado al realizar una venta)
 */
export async function reduceStock(items: { productId: string; quantity: number }[]): Promise<void> {
  await db.transaction('rw', db.products, async () => {
    for (const item of items) {
      const product = await db.products.get(item.productId);
      
      if (!product) {
        throw new Error(`Producto no encontrado: ${item.productId}`);
      }

      if (product.stock < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${product.name}. ` +
          `Disponible: ${product.stock}, Solicitado: ${item.quantity}`
        );
      }

      await db.products.update(item.productId, {
        stock: product.stock - item.quantity,
        updatedAt: new Date(),
      });
    }
  });
}

/**
 * Busca productos por nombre
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const allProducts = await db.products.toArray();
  const lowercaseQuery = query.toLowerCase();
  
  return allProducts.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery)
  );
}

/**
 * Obtiene productos con stock bajo (menos de un umbral)
 */
export async function getLowStockProducts(threshold: number = 10): Promise<Product[]> {
  return db.products.where('stock').below(threshold).toArray();
}

/**
 * Obtiene el total de valor del inventario
 */
export async function getInventoryValue(): Promise<number> {
  const products = await db.products.toArray();
  return products.reduce((total, product) => {
    return total + (product.price * product.stock);
  }, 0);
}
