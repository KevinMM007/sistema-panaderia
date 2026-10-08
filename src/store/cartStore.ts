import { create } from 'zustand';
import { SaleItem, Product } from '../types';

interface CartState {
  items: SaleItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (product: Product, quantity: number = 1) => {
    const { items } = get();
    const existingItem = items.find((item) => item.productId === product.id);

    if (existingItem) {
      // Si el producto ya está en el carrito, incrementar cantidad
      set({
        items: items.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * item.unitPrice,
              }
            : item
        ),
      });
    } else {
      // Agregar nuevo producto al carrito
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity,
      };
      set({ items: [...items, newItem] });
    }
  },

  removeItem: (productId: string) => {
    const { items } = get();
    set({ items: items.filter((item) => item.productId !== productId) });
  },

  updateQuantity: (productId: string, quantity: number) => {
    const { items } = get();
    
    if (quantity <= 0) {
      // Si la cantidad es 0 o negativa, eliminar el item
      get().removeItem(productId);
      return;
    }

    set({
      items: items.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice,
            }
          : item
      ),
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.subtotal, 0);
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));
