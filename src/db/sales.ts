import { db } from '../db';
import { Sale, SaleItem } from '../types';
import { generateId } from '../utils/auth';
import { reduceStock } from './products';

/**
 * Registra una nueva venta
 */
export async function createSale(
  items: SaleItem[],
  total: number,
  amountPaid: number,
  change: number,
  cashierId: string,
  cashierName: string
): Promise<Sale> {
  if (items.length === 0) {
    throw new Error('No hay productos en la venta');
  }

  if (amountPaid < total) {
    throw new Error('El monto pagado es insuficiente');
  }

  const sale: Sale = {
    id: generateId('sale'),
    items,
    total,
    amountPaid,
    change,
    cashierId,
    cashierName,
    timestamp: new Date(),
  };

  try {
    // Usar una transacción para garantizar integridad
    await db.transaction('rw', db.sales, db.products, async () => {
      // Reducir el stock de los productos
      await reduceStock(
        items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      // Registrar la venta
      await db.sales.add(sale);
    });

    console.log('✅ Venta registrada:', sale.id);
    return sale;
  } catch (error) {
    console.error('❌ Error al registrar venta:', error);
    throw error;
  }
}

/**
 * Obtiene ventas de un día específico
 */
export async function getSalesByDate(date: Date): Promise<Sale[]> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return db.sales
    .where('timestamp')
    .between(startOfDay, endOfDay, true, true)
    .toArray();
}

/**
 * Obtiene ventas en un rango de fechas
 */
export async function getSalesInRange(startDate: Date, endDate: Date): Promise<Sale[]> {
  return db.sales
    .where('timestamp')
    .between(startDate, endDate, true, true)
    .reverse()
    .toArray();
}

/**
 * Calcula el total de ventas de un día
 */
export async function getDailySalesTotal(date: Date = new Date()): Promise<number> {
  const sales = await getSalesByDate(date);
  return sales.reduce((sum, sale) => sum + sale.total, 0);
}

/**
 * Calcula el total de ventas por cajero
 */
export async function getSalesTotalByCashier(cashierId: string, date: Date): Promise<number> {
  const sales = await getSalesByDate(date);
  const cashierSales = sales.filter(sale => sale.cashierId === cashierId);
  return cashierSales.reduce((sum, sale) => sum + sale.total, 0);
}

/**
 * Obtiene estadísticas de ventas por hora
 */
export async function getSalesByHour(date: Date): Promise<{
  hour: number;
  sales: number;
  amount: number;
}[]> {
  const sales = await getSalesByDate(date);
  
  // Agrupar por hora
  const salesByHour = new Map<number, { count: number; total: number }>();
  
  for (let hour = 0; hour < 24; hour++) {
    salesByHour.set(hour, { count: 0, total: 0 });
  }

  sales.forEach(sale => {
    const hour = sale.timestamp.getHours();
    const current = salesByHour.get(hour)!;
    salesByHour.set(hour, {
      count: current.count + 1,
      total: current.total + sale.total,
    });
  });

  return Array.from(salesByHour.entries()).map(([hour, data]) => ({
    hour,
    sales: data.count,
    amount: data.total,
  }));
}

/**
 * Obtiene los productos más vendidos
 */
export async function getTopSellingProducts(
  startDate: Date,
  endDate: Date,
  limit: number = 10
): Promise<{
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
}[]> {
  const sales = await getSalesInRange(startDate, endDate);
  
  // Agrupar por producto
  const productStats = new Map<string, {
    name: string;
    quantity: number;
    revenue: number;
  }>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productStats.get(item.productId) || {
        name: item.productName,
        quantity: 0,
        revenue: 0,
      };

      productStats.set(item.productId, {
        name: item.productName,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.subtotal,
      });
    });
  });

  // Convertir a array y ordenar
  return Array.from(productStats.entries())
    .map(([productId, stats]) => ({
      productId,
      productName: stats.name,
      quantitySold: stats.quantity,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}

/**
 * Genera un corte de caja
 */
export async function generateCashClosing(date: Date = new Date()): Promise<{
  date: Date;
  totalSales: number;
  totalAmount: number;
  salesCount: number;
  topProducts: {
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  salesByHour: {
    hour: number;
    sales: number;
    amount: number;
  }[];
}> {
  const sales = await getSalesByDate(date);
  const salesByHour = await getSalesByHour(date);
  
  // Calcular totales
  const totalAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
  const salesCount = sales.length;

  // Productos más vendidos del día
  const productStats = new Map<string, { quantity: number; revenue: number }>();

  sales.forEach(sale => {
    sale.items.forEach(item => {
      const current = productStats.get(item.productName) || {
        quantity: 0,
        revenue: 0,
      };

      productStats.set(item.productName, {
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.subtotal,
      });
    });
  });

  const topProducts = Array.from(productStats.entries())
    .map(([name, stats]) => ({
      productName: name,
      quantity: stats.quantity,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    date,
    totalSales: salesCount,
    totalAmount,
    salesCount,
    topProducts,
    salesByHour,
  };
}

/**
 * Elimina una venta (solo para admin, en caso de error)
 */
export async function deleteSale(saleId: string): Promise<void> {
  const sale = await db.sales.get(saleId);
  
  if (!sale) {
    throw new Error('Venta no encontrada');
  }

  const confirmed = confirm(
    '⚠️ ADVERTENCIA: Eliminar una venta NO restaurará el inventario.\n\n' +
    'Esta acción solo debe usarse para corregir errores de registro.\n\n' +
    '¿Estás seguro de continuar?'
  );

  if (!confirmed) return;

  await db.sales.delete(saleId);
  console.log('✅ Venta eliminada:', saleId);
}
