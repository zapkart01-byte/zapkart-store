export interface OrderStatusConfig {
  label: string;
  bgClass: string;
  textClass: string;
  hexColor: string;
}

// Maps order statuses to styling properties and user-friendly labels
export const ORDER_STATUSES: Record<string, OrderStatusConfig> = {
  placed: {
    label: 'Placed',
    bgClass: 'bg-[#DBEAFE]',
    textClass: 'text-[#1D4ED8]',
    hexColor: '#1D4ED8',
  },
  confirmed: {
    label: 'Confirmed',
    bgClass: 'bg-[#F5F3FF]',
    textClass: 'text-[#7C3AED]',
    hexColor: '#7C3AED',
  },
  packed: {
    label: 'Packed',
    bgClass: 'bg-[#FEF3C7]',
    textClass: 'text-[#D97706]',
    hexColor: '#D97706',
  },
  picked: {
    label: 'Picked Up',
    bgClass: 'bg-[#FFF0E6]',
    textClass: 'text-[#FF6B00]',
    hexColor: '#FF6B00',
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    bgClass: 'bg-[#FFF0E6]',
    textClass: 'text-[#FF6B00]',
    hexColor: '#FF6B00',
  },
  delivered: {
    label: 'Delivered',
    bgClass: 'bg-[#DCFCE7]',
    textClass: 'text-[#16A34A]',
    hexColor: '#16A34A',
  },
  cancelled: {
    label: 'Cancelled',
    bgClass: 'bg-[#FEE2E2]',
    textClass: 'text-[#EF4444]',
    hexColor: '#EF4444',
  },
};

// Represents the sequential status flow
export const ORDER_STATUS_FLOW = [
  'placed',
  'confirmed',
  'packed',
  'picked',
  'out_for_delivery',
  'delivered'
];

// Customer-facing tracking steps
export const CUSTOMER_TRACKING_STEPS = [
  'Placed',
  'Store Confirmed',
  'Being Packed',
  'Out for Delivery',
  'Delivered'
];
