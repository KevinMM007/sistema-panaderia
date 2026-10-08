// Tipos de usuarios
export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
}

// Tipos de productos
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

// Tipos de ventas
export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  amountPaid: number;
  change: number;
  cashierId: string;
  cashierName: string;
  timestamp: Date;
}

// Tipos de inventario
export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  adjustment: number;
  reason: string;
  userId: string;
  userName: string;
  timestamp: Date;
}

// Tipos de backup
export interface BackupData {
  version: string;
  timestamp: Date;
  users: User[];
  products: Product[];
  categories: Category[];
  sales: Sale[];
  inventoryAdjustments: InventoryAdjustment[];
}

// Tipos de reportes
export interface DailySalesReport {
  date: Date;
  totalSales: number;
  totalAmount: number;
  topProducts: {
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }[];
  salesByHour: {
    hour: number;
    sales: number;
    amount: number;
  }[];
}

export interface ProductSalesStats {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePerSale: number;
  lastSold?: Date;
}
