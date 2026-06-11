import { supabase } from './supabase';

// Checks if a store exists in Supabase by the owner's phone number
export async function getStoreByOwnerPhone(phone: string) {
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_phone', phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Retrieves summary metrics for a store dashboard
export async function getStoreDashboard(storeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('subtotal, status')
    .eq('store_id', storeId)
    .gte('created_at', today.toISOString());

  if (ordersError) throw ordersError;

  const { data: store, error: storeError } = await supabase
    .from('stores')
    .select('rating')
    .eq('id', storeId)
    .single();

  if (storeError) throw storeError;

  const completedToday = orders.filter((o) => o.status === 'delivered');
  const todayRevenue = completedToday.reduce((sum, o) => sum + Number(o.subtotal), 0);

  return {
    todayRevenue,
    todayOrdersCount: orders.length,
    rating: Number(store?.rating || 5.0),
  };
}

// Submits a store registration payload via the backend API
export async function registerStore(storePayload: any) {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const response = await fetch(`${apiUrl}/stores/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(storePayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to register store');
  }

  return response.json();
}
