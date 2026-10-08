import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Product, Category, Sale } from '../types';

/**
 * Hook para obtener todos los productos en tiempo real
 */
export function useProducts() {
  const products = useLiveQuery(() => db.products.toArray(), []);
  return products ?? [];
}

/**
 * Hook para obtener un producto por ID
 */
export function useProduct(id: string) {
  const product = useLiveQuery(() => db.products.get(id), [id]);
  return product;
}

/**
 * Hook para obtener productos por categoría
 */
export function useProductsByCategory(category: string) {
  const products = useLiveQuery(
    () => db.products.where('category').equals(category).toArray(),
    [category]
  );
  return products ?? [];
}

/**
 * Hook para obtener todas las categorías en tiempo real
 */
export function useCategories() {
  const categories = useLiveQuery(
    () => db.categories.orderBy('order').toArray(),
    []
  );
  return categories ?? [];
}

/**
 * Hook para obtener ventas del día actual
 */
export function useTodaySales() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const sales = useLiveQuery(
    () => db.sales
      .where('timestamp')
      .above(today)
      .toArray(),
    []
  );
  
  return sales ?? [];
}

/**
 * Hook para obtener ventas en un rango de fechas
 */
export function useSalesInRange(startDate: Date, endDate: Date) {
  const sales = useLiveQuery(
    () => db.sales
      .where('timestamp')
      .between(startDate, endDate, true, true)
      .toArray(),
    [startDate, endDate]
  );
  
  return sales ?? [];
}

/**
 * Hook para obtener productos con stock bajo (menos de 10)
 */
export function useLowStockProducts() {
  const products = useLiveQuery(
    () => db.products.where('stock').below(10).toArray(),
    []
  );
  return products ?? [];
}

/**
 * Hook para obtener productos sin stock
 */
export function useOutOfStockProducts() {
  const products = useLiveQuery(
    () => db.products.where('stock').equals(0).toArray(),
    []
  );
  return products ?? [];
}

/**
 * Hook para obtener estadísticas rápidas
 */
export function useQuickStats() {
  const stats = useLiveQuery(async () => {
    const [totalProducts, totalStock, lowStock, outOfStock, todaySales] = await Promise.all([
      db.products.count(),
      db.products.toArray().then(products => 
        products.reduce((sum, p) => sum + p.stock, 0)
      ),
      db.products.where('stock').below(10).count(),
      db.products.where('stock').equals(0).count(),
      db.sales.where('timestamp').above(new Date().setHours(0, 0, 0, 0)).toArray(),
    ]);

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      totalProducts,
      totalStock,
      lowStock,
      outOfStock,
      todaySalesCount: todaySales.length,
      todayRevenue,
    };
  }, []);

  return stats ?? {
    totalProducts: 0,
    totalStock: 0,
    lowStock: 0,
    outOfStock: 0,
    todaySalesCount: 0,
    todayRevenue: 0,
  };
}
