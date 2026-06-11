import { create } from 'zustand';

interface OrderState {
  orders: any[];
  pendingOrders: any[];
  activeOrder: any | null;
  setOrders: (orders: any[]) => void;
  setPendingOrders: (orders: any[]) => void;
  setActiveOrder: (order: any | null) => void;
}

// Global order state store for tracking live incoming and packed orders
export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  pendingOrders: [],
  activeOrder: null,
  setOrders: (orders) => set({ 
    orders, 
    pendingOrders: orders.filter((o) => o.status === 'pending') 
  }),
  setPendingOrders: (pendingOrders) => set({ pendingOrders }),
  setActiveOrder: (activeOrder) => set({ activeOrder }),
}));
