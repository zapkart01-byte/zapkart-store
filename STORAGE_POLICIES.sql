-- ═══════════════════════════════════════════════════════════
-- ZAPKART - STORAGE POLICIES FOR product-images BUCKET
-- ═══════════════════════════════════════════════════════════
-- 
-- Run this in Supabase SQL Editor to allow image uploads
-- 
-- Steps:
-- 1. Make sure "product-images" bucket exists and is PUBLIC
-- 2. Go to SQL Editor in Supabase
-- 3. Copy and paste this entire file
-- 4. Click "Run"
-- 5. Should see "Success. No rows returned"
--
-- ═══════════════════════════════════════════════════════════

-- Clean up existing policies (if any)
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- ────────────────────────────────────────────────────────────
-- POLICY 1: Public Read Access
-- Anyone can view/download images (for customer app)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Public Read Access"
ON storage.objects 
FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- ────────────────────────────────────────────────────────────
-- POLICY 2: Authenticated Upload
-- Logged-in users (stores) can upload images
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Authenticated Upload"
ON storage.objects 
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- ────────────────────────────────────────────────────────────
-- POLICY 3: Authenticated Update
-- Users can update their uploaded images
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Authenticated Update"
ON storage.objects 
FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

-- ────────────────────────────────────────────────────────────
-- POLICY 4: Authenticated Delete
-- Users can delete their uploaded images
-- ────────────────────────────────────────────────────────────
CREATE POLICY "Authenticated Delete"
ON storage.objects 
FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ═══════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════

-- Check policies were created successfully
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN roles = '{public}' THEN 'public'
    WHEN roles = '{authenticated}' THEN 'authenticated'
    ELSE array_to_string(roles, ', ')
  END as roles,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%Public Read Access%' 
  OR policyname LIKE '%Authenticated%'
ORDER BY policyname;

-- ═══════════════════════════════════════════════════════════
-- EXPECTED OUTPUT:
-- ═══════════════════════════════════════════════════════════
-- 
-- Should show 4 policies:
-- 1. Authenticated Delete   | authenticated | DELETE
-- 2. Authenticated Update   | authenticated | UPDATE  
-- 3. Authenticated Upload   | authenticated | INSERT
-- 4. Public Read Access     | public        | SELECT
--
-- If you see these 4 rows, ✅ SUCCESS!
--
-- ═══════════════════════════════════════════════════════════

-- NEXT STEPS:
-- 1. ✅ Verify bucket is public:
--    Storage → product-images → Settings → "Public bucket" = ON
--
-- 2. ✅ Test upload in Store app:
--    Add product → Click camera → Select image → Save
--
-- 3. ✅ Verify image shows in Customer app:
--    Home → Should see product with image
--
-- ═══════════════════════════════════════════════════════════
