import { supabase } from './supabase';

// Fetches all orders belonging to a specific store
export async function getStoreOrders(storeId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, phone),
      riders (name, phone, status)
    `)
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Fetches detailed information for a single order, including items
export async function getOrderById(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers (name, phone),
      riders (name, phone, status),
      order_items (*)
    `)
    .eq('id', orderId)
    .single();

  if (error) throw error;
  return data;
}

// Calls the backend Express API to transition an order status
export async function updateOrderStatus(
  orderId: string,
  status: string,
  cancellationReason?: string
) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, cancellationReason }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to update order status');
  }

  return response.json();
}
