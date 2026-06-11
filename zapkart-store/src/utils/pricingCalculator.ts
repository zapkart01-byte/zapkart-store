// Calculates billing pricing for a cart based on parameters
export function calculateOrderPricing(cartValue: number, distanceKm: number, settings: any) {
  // Determine rider payout based on delivery distance
  let riderPayout: number;
  if (distanceKm < 2) {
    riderPayout = Number(settings.rider_payout_under_2km);
  } else if (distanceKm < 4) {
    riderPayout = Number(settings.rider_payout_2_to_4km);
  } else {
    riderPayout = Number(settings.rider_payout_above_4km);
  }

  // Calculate platform commission from cart value
  const commissionEarned = cartValue * Number(settings.commission_rate);

  // Calculate total revenue needed to guarantee minimum profit
  const revenueNeeded = riderPayout + Number(settings.minimum_profit);

  // Dynamic delivery fee fills the gap between commission and needed revenue
  let deliveryFee = revenueNeeded - commissionEarned;

  // Apply free delivery threshold — show free to customer
  if (cartValue >= Number(settings.free_delivery_above)) {
    deliveryFee = 0;
  }

  // Clamp delivery fee between minimum and maximum allowed
  deliveryFee = Math.max(deliveryFee, Number(settings.min_delivery_fee));
  deliveryFee = Math.min(deliveryFee, Number(settings.max_delivery_fee));
  deliveryFee = Math.round(deliveryFee);

  const commissionAmount = Math.round(commissionEarned);
  const zapkartNetProfit = Math.round(commissionEarned + deliveryFee - riderPayout);

  return {
    deliveryFee,
    riderPayout,
    commissionAmount,
    storeReceives:     Math.round(cartValue - commissionAmount),
    zapkartNetProfit,
    isFreeDelivery:    cartValue >= Number(settings.free_delivery_above),
    totalCustomerPays: cartValue + deliveryFee,
  };
}
