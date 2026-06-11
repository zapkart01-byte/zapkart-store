import { TouchableOpacity, Text, View } from 'react-native';

/**
 * Live earnings preview card — updates on every keystroke.
 * PRD Tasks 55–56 / Phase 3 Product Form spec.
 *
 * Uses the actual category commission_rate (not hardcoded 18%).
 * Shows: Customer Price | Commission | Payout | Profit (if cost known) | Break-even warning.
 */
export default function EarningsPreview({ storePrice, costPrice, category, settings, onSetRecommended }) {
  const sp = Number(storePrice)   || 0;
  const cp = Number(costPrice)    || 0;

  if (!sp || sp <= 0) return null;

  // Use category commission_rate if available, else fall back to 18%
  const commissionRate  = Number(category?.commission_rate) || 0.18;
  const markupPerItem   = settings?.platform_markup_per_item || 1;
  const platformMrp     = Number(category?.platform_mrp)     || 0;

  // Customer sees: min(store_price + ₹1 markup, platform_mrp) — PRD Rule 4.2
  const customerPrice   = platformMrp > 0
    ? Math.min(sp + markupPerItem, platformMrp)
    : sp + markupPerItem;

  const commission      = sp * commissionRate;
  const payout          = sp - commission;

  const profit          = cp > 0 ? payout - cp : null;
  const profitMargin    = profit !== null ? ((profit / payout) * 100).toFixed(1) : null;
  const breakEven       = cp > 0 ? Math.ceil(cp / (1 - commissionRate)) : null;
  const isLoss          = profit !== null && profit < 0;

  const commissionPct   = Math.round(commissionRate * 100);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: isLoss ? '#FECACA' : '#BBF7D0',
        backgroundColor: isLoss ? '#FFF1F2' : '#F0FDF4',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0D0D0D', marginBottom: 12 }}>
        💰 Earnings Preview
      </Text>

      {/* Customer Will See */}
      <Row label="Customer will see" value={`₹${customerPrice.toFixed(2)}`} valueColor="#FF6B00" bold />

      {/* Commission */}
      <Row
        label={`Platform commission (${commissionPct}%)`}
        value={`-₹${commission.toFixed(2)}`}
        valueColor="#6B7280"
      />

      {/* Payout */}
      <Row
        label="Your payout per unit"
        value={`₹${payout.toFixed(2)}`}
        valueColor="#16A34A"
        bold
      />

      {/* Profit section (only if cost price entered) */}
      {cp > 0 && (
        <>
          <View style={{ height: 1, backgroundColor: isLoss ? '#FECACA' : '#BBF7D0', marginVertical: 10 }} />
          <Row label="Your cost" value={`-₹${cp.toFixed(2)}`} valueColor="#6B7280" />
          <Row
            label="Your profit"
            value={`₹${profit?.toFixed(2)}`}
            valueColor={isLoss ? '#EF4444' : '#16A34A'}
            bold
          />
          {profitMargin !== null && (
            <Row
              label="Profit margin"
              value={`${profitMargin}%`}
              valueColor={parseFloat(profitMargin) < 5 ? '#F59E0B' : '#16A34A'}
            />
          )}
        </>
      )}

      {/* Loss warning — PRD Task 56 */}
      {isLoss && (
        <View
          style={{
            marginTop: 12,
            padding: 12,
            backgroundColor: '#FEE2E2',
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '600', lineHeight: 18 }}>
            ⚠️ You may lose money at this price.{'\n'}
            Minimum break-even price: ₹{breakEven}
          </Text>
          {onSetRecommended && breakEven && (
            <TouchableOpacity
              onPress={() => onSetRecommended(breakEven + 5)}
              style={{ marginTop: 8 }}
            >
              <Text style={{ fontSize: 12, color: '#DC2626', fontWeight: '700', textDecorationLine: 'underline' }}>
                Set recommended price (₹{breakEven + 5})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

/** Reusable row for label + value pairs */
function Row({ label, value, valueColor = '#0D0D0D', bold = false }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <Text style={{ fontSize: 12, color: '#6B7280', flex: 1, paddingRight: 8 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: valueColor, fontWeight: bold ? '700' : '500' }}>
        {value}
      </Text>
    </View>
  );
}
