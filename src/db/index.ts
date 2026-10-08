import Dexie, { Table } from 'dexie';
import {
  User,
  Product,
  Category,
  Sale,
  InventoryAdjustment,
} from '../types';

export class PanaderiaDatabase extends Dexie {
  users!: Table<User, string>;
  products!: Table<Product, string>;
  categories!: Table<Category, string>;
  sales!: Table<Sale, string>;
  inventoryAdjustments!: Table<InventoryAdjustment, string>;

  constructor() {
    super('PanaderiaDB');
    
    this.version(1).stores({
      users: 'id, username, role',
      products: 'id, name, category, stock',
      categories: 'id, name, order',
      sales: 'id, timestamp, cashierId',
      inventoryAdjustments: 'id, productId, timestamp, userId',
    });
  }
}

export const db = new PanaderiaDatabase();
