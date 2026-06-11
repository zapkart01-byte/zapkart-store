-- ═══════════════════════════════════════════════════
-- ZAPKART SUPABASE COMPLETE SETUP
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- ────────────────────────────────────────────────────
-- 1. ROW LEVEL SECURITY (RLS) POLICIES
-- ────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE riders ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────
-- PRODUCTS TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Anyone can view active products from active stores
CREATE POLICY "Anyone can view active products"
ON products FOR SELECT
USING (
  is_active = true 
  AND stock > 0
);

-- Stores can insert their own products
CREATE POLICY "Stores can insert their own products"
ON products FOR INSERT
WITH CHECK (
  store_id IN (
    SELECT id FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- Stores can update their own products
CREATE POLICY "Stores can update their own products"
ON products FOR UPDATE
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- Stores can delete their own products
CREATE POLICY "Stores can delete their own products"
ON products FOR DELETE
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- ────────────────────────────────────────────────────
-- STORES TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Anyone can view active stores
CREATE POLICY "Anyone can view active stores"
ON stores FOR SELECT
USING (status = 'active');

-- Store owners can view their own store
CREATE POLICY "Store owners can view their store"
ON stores FOR SELECT
USING (owner_phone = auth.jwt() ->> 'phone');

-- Store owners can update their own store
CREATE POLICY "Store owners can update their store"
ON stores FOR UPDATE
USING (owner_phone = auth.jwt() ->> 'phone');

-- ────────────────────────────────────────────────────
-- ORDERS TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Customers can view their own orders
CREATE POLICY "Customers can view their orders"
ON orders FOR SELECT
USING (customer_id = auth.uid());

-- Customers can create orders
CREATE POLICY "Customers can create orders"
ON orders FOR INSERT
WITH CHECK (customer_id = auth.uid());

-- Stores can view orders for their store
CREATE POLICY "Stores can view their orders"
ON orders FOR SELECT
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- Stores can update orders for their store
CREATE POLICY "Stores can update their orders"
ON orders FOR UPDATE
USING (
  store_id IN (
    SELECT id FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- Riders can view their assigned orders
CREATE POLICY "Riders can view their orders"
ON orders FOR SELECT
USING (
  rider_id IN (
    SELECT id FROM riders WHERE phone = auth.jwt() ->> 'phone'
  )
);

-- Riders can update their assigned orders
CREATE POLICY "Riders can update their orders"
ON orders FOR UPDATE
USING (
  rider_id IN (
    SELECT id FROM riders WHERE phone = auth.jwt() ->> 'phone'
  )
);

-- ────────────────────────────────────────────────────
-- CUSTOMERS TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Customers can view their own profile
CREATE POLICY "Customers can view their profile"
ON customers FOR SELECT
USING (id = auth.uid());

-- Customers can update their own profile
CREATE POLICY "Customers can update their profile"
ON customers FOR UPDATE
USING (id = auth.uid());

-- ────────────────────────────────────────────────────
-- RIDERS TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Riders can view their own profile
CREATE POLICY "Riders can view their profile"
ON riders FOR SELECT
USING (phone = auth.jwt() ->> 'phone');

-- Riders can update their own profile
CREATE POLICY "Riders can update their profile"
ON riders FOR UPDATE
USING (phone = auth.jwt() ->> 'phone');

-- ────────────────────────────────────────────────────
-- CATEGORIES TABLE POLICIES
-- ────────────────────────────────────────────────────

-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
ON categories FOR SELECT
USING (true);

-- ────────────────────────────────────────────────────
-- PLATFORM SETTINGS POLICIES
-- ────────────────────────────────────────────────────

-- Anyone can view platform settings
CREATE POLICY "Anyone can view platform settings"
ON platform_settings FOR SELECT
USING (true);

-- ────────────────────────────────────────────────────
-- 2. STORAGE BUCKET SETUP
-- ────────────────────────────────────────────────────

-- Create storage bucket for product images (run in Storage UI)
-- Bucket name: product-images
-- Public: true
-- File size limit: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- Storage policies for product-images bucket
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Stores can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

CREATE POLICY "Stores can update their product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

CREATE POLICY "Stores can delete their product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM stores WHERE owner_phone = auth.jwt() ->> 'phone'
  )
);

-- ────────────────────────────────────────────────────
-- 3. REALTIME SETUP
-- ────────────────────────────────────────────────────

-- Enable realtime on critical tables
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE stores;
ALTER PUBLICATION supabase_realtime ADD TABLE riders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- ────────────────────────────────────────────────────
-- 4. INDEXES FOR PERFORMANCE
-- ────────────────────────────────────────────────────

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active_stock ON products(is_active, stock) WHERE is_active = true AND stock > 0;

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(rider_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);
CREATE INDEX IF NOT EXISTS idx_stores_owner_phone ON stores(owner_phone);

-- ────────────────────────────────────────────────────
-- 5. REQUIRED COLUMNS CHECK
-- ────────────────────────────────────────────────────

-- Add missing columns if they don't exist

-- Products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_urls text[];
ALTER TABLE products ADD COLUMN IF NOT EXISTS cost_price numeric DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS units_sold_total integer DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_group_id uuid;
ALTER TABLE products ADD COLUMN IF NOT EXISTS variant_label text;

-- Stores table
ALTER TABLE stores ADD COLUMN IF NOT EXISTS expo_push_token text;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS is_open boolean DEFAULT true;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 0.18;

-- Riders table
ALTER TABLE riders ADD COLUMN IF NOT EXISTS expo_push_token text;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS is_online boolean DEFAULT false;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS cod_balance numeric DEFAULT 0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS cod_limit_reached boolean DEFAULT false;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS weekly_delivery_earnings numeric DEFAULT 0;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS lat numeric;
ALTER TABLE riders ADD COLUMN IF NOT EXISTS lng numeric;

-- Orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS commission_amount numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS rider_payout numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zapkart_net_profit numeric DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_markup_amount numeric DEFAULT 0;

-- Categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 0.18;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS emoji text DEFAULT '📦';

-- Platform settings table
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS platform_markup_per_item numeric DEFAULT 1;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_profit_tier1 numeric DEFAULT 12;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_profit_tier2 numeric DEFAULT 14;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_profit_tier3 numeric DEFAULT 15;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_profit_tier4 numeric DEFAULT 10;
ALTER TABLE platform_settings ADD COLUMN IF NOT EXISTS min_profit_tier5 numeric DEFAULT 8;

-- ────────────────────────────────────────────────────
-- 6. SAMPLE DATA (Optional - for testing)
-- ────────────────────────────────────────────────────

-- Insert default platform settings if not exists
INSERT INTO platform_settings (
  id,
  rider_payout_under_2km,
  rider_payout_2_to_4km,
  rider_payout_above_4km,
  min_delivery_fee,
  max_delivery_fee,
  free_delivery_above,
  minimum_order_value,
  platform_markup_per_item
) VALUES (
  1,
  25,
  35,
  50,
  15,
  45,
  499,
  99,
  1
) ON CONFLICT (id) DO NOTHING;

-- Insert default categories if not exists
INSERT INTO categories (name, emoji, commission_rate, sort_order, is_active) VALUES
  ('Dairy & Eggs', '🥛', 0.03, 1, true),
  ('Staples', '🌾', 0.06, 2, true),
  ('Bread & Bakery', '🍞', 0.08, 3, true),
  ('Beverages', '🥤', 0.08, 4, true),
  ('Snacks', '🍿', 0.10, 5, true),
  ('Vegetables', '🥬', 0.12, 6, true),
  ('Fruits', '🍎', 0.12, 7, true),
  ('Household', '🧹', 0.15, 8, true),
  ('Meat & Fish', '🍗', 0.15, 9, true),
  ('Organic', '🌱', 0.20, 10, true)
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────
-- 7. FUNCTIONS (Optional - for advanced features)
-- ────────────────────────────────────────────────────

-- Function to update order totals
CREATE OR REPLACE FUNCTION update_order_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calculate commission, markup, and profit when order is created/updated
  NEW.commission_amount = NEW.subtotal * 0.15; -- Example: 15% commission
  NEW.total_markup_amount = (SELECT COUNT(*) FROM jsonb_array_elements(NEW.items::jsonb)) * 1; -- ₹1 per item
  NEW.zapkart_net_profit = NEW.commission_amount + NEW.total_markup_amount + NEW.delivery_fee - COALESCE(NEW.rider_payout, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update order totals
DROP TRIGGER IF EXISTS trigger_update_order_totals ON orders;
CREATE TRIGGER trigger_update_order_totals
BEFORE INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_totals();

-- ────────────────────────────────────────────────────
-- SETUP COMPLETE!
-- ────────────────────────────────────────────────────

-- Next steps:
-- 1. Go to Storage in Supabase dashboard
-- 2. Create bucket: product-images (public, 5MB limit)
-- 3. Go to Database → Replication
-- 4. Enable realtime for: orders, stores, riders, products
-- 5. Test by adding a product in store app
-- 6. Verify product appears in customer app
