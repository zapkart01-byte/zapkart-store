# 🚨 URGENT: User Table Database Fix

## ❌ ERROR YOU'RE SEEING

```
verifyOTP error: Error: Failed to retrieve user
```

This means the backend **cannot access the `users` table** in Supabase.

---

## 🔍 ROOT CAUSE

One of these issues:

1. ❌ `users` table doesn't exist in database
2. ❌ RLS (Row Level Security) is blocking access
3. ❌ Service role key is wrong/missing in backend env
4. ❌ Table columns don't match expected schema

---

## ✅ SOLUTION: Check & Fix Database

### Step 1: Check if Users Table Exists

Go to **Supabase Dashboard** → **SQL Editor** → Run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'users';
```

**Expected**: Should return `users`
**If empty**: Table doesn't exist, follow Step 2

---

### Step 2: Create Users Table (If Missing)

Run this in **Supabase SQL Editor**:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'store_owner', 'rider', 'superadmin')),
  name TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Service role has full access" ON public.users;

-- Policy: Service role (backend) has full access
CREATE POLICY "Service role has full access"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Users can view own data
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = id::text OR role = 'superadmin');

-- Policy: Users can update own data
CREATE POLICY "Users can update own data"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);
```

---

### Step 3: Verify Service Role Key in Backend

Go to **Render Dashboard** → **zapkart-backend** → **Environment**

Check these variables exist:

```env
SUPABASE_URL=https://blnbrwdxmifjjrnkraec.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Get the correct keys:**
1. Supabase Dashboard → Settings → API
2. Copy **service_role** key (secret, starts with `eyJ...`)
3. Copy **anon/public** key (starts with `eyJ...`)
4. Update on Render if missing/wrong

**After updating env vars:**
- Render will auto-redeploy
- Wait 2-3 minutes for restart

---

### Step 4: Test User Creation Manually

Run in **Supabase SQL Editor**:

```sql
-- Test insert (should work)
INSERT INTO public.users (phone, email, role)
VALUES ('+919999999999', 'test@zapkart.phone', 'customer')
ON CONFLICT (phone) DO NOTHING
RETURNING *;

-- Check if user was created
SELECT * FROM public.users WHERE phone = '+919999999999';
```

**Expected**: Should return the created user
**If error**: Check the error message, likely RLS or permissions

---

### Step 5: Check RLS Policies

Run in **Supabase SQL Editor**:

```sql
-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';
```

**Expected**: Should see "Service role has full access" policy

**If empty or wrong**: Re-run the CREATE POLICY commands from Step 2

---

## 🧪 QUICK TEST

After fixing database:

### Test Backend Directly:

**1. Send OTP:**
```bash
curl -X POST https://zapkart-backend-eyve.onrender.com/auth/mobile/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+918639742553"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "session_id": "..."
}
```

**2. Verify OTP:** (Use real OTP from SMS)
```bash
curl -X POST https://zapkart-backend-eyve.onrender.com/auth/mobile/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+918639742553", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "phone": "+918639742553",
    "email": "user_918639742553@zapkart.phone",
    "role": "customer"
  },
  "tokens": {
    "access_token": "eyJ...",
    "refresh_token": "eyJ..."
  },
  "isNewUser": true
}
```

**If you get "Failed to retrieve user"**: Database/RLS issue not fixed yet

---

## 🔧 ALTERNATIVE: Disable RLS Temporarily

**Only if above doesn't work:**

```sql
-- TEMPORARY: Disable RLS for testing
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
```

**Test login again**. If it works:
- RLS policies are the problem
- Re-enable RLS: `ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;`
- Fix policies using Step 2

---

## 🐛 DEBUGGING

### Check Backend Logs on Render:

1. Go to Render Dashboard
2. Click **zapkart-backend**
3. Click **Logs** tab
4. Look for errors like:
   - `Database error fetching user`
   - `Failed to create user`
   - `permission denied for table users`

### Common Issues:

**"permission denied for table users"**
→ Service role key is wrong or RLS is blocking

**"relation public.users does not exist"**
→ Users table not created, run Step 2

**"duplicate key value violates unique constraint"**
→ User already exists (this is OK, should return existing user)

**"column does not exist"**
→ Table schema is wrong, drop and recreate table

---

## 📋 COMPLETE USERS TABLE SCHEMA

If you need to drop and recreate:

```sql
-- Drop existing table (CAUTION: deletes all users!)
DROP TABLE IF EXISTS public.users CASCADE;

-- Create fresh table
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'store_owner', 'rider', 'superadmin')),
  name TEXT,
  profile_image_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access"
ON public.users FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Authenticated users can view own data
CREATE POLICY "Users can view own data"
ON public.users FOR SELECT TO authenticated
USING (auth.uid()::text = id::text OR role = 'superadmin');

-- Authenticated users can update own data
CREATE POLICY "Users can update own data"
ON public.users FOR UPDATE TO authenticated
USING (auth.uid()::text = id::text)
WITH CHECK (auth.uid()::text = id::text);
```

---

## ✅ SUCCESS INDICATORS

After fixing:

1. ✅ SQL queries run without errors
2. ✅ Can manually insert test user
3. ✅ Backend curl test returns user + tokens
4. ✅ Customer app OTP verification works
5. ✅ Console shows "Token saved: YES"
6. ✅ App navigates to home screen

---

## 🆘 IF STILL FAILING

### Share These Details:

1. **Supabase SQL error** (if any) from Step 2
2. **Backend logs** from Render dashboard
3. **curl test results** from Quick Test section
4. **Screenshot** of Render environment variables (hide sensitive parts)

### Emergency Workaround:

If you need to test other features while debugging database:

**Option 1**: Use mock authentication (NOT for production)
**Option 2**: Manually create user in Supabase UI
**Option 3**: Fix service role key first, then test

---

## 📞 WHAT TO CHECK FIRST

Priority order:

1. ✅ **Does users table exist?** → Run Step 1
2. ✅ **Does service role key exist in Render env?** → Step 3
3. ✅ **Are RLS policies correct?** → Step 5
4. ✅ **Can backend connect to Supabase?** → Check logs
5. ✅ **Is 2Factor.in sending OTP?** → Check 2Factor dashboard

---

## 🎯 MOST LIKELY CAUSE

Based on the error, it's probably **one of these**:

1. **Users table doesn't exist** (70% chance)
   → Fix: Run CREATE TABLE from Step 2

2. **Service role key missing** (20% chance)
   → Fix: Add to Render environment variables

3. **RLS blocking service role** (10% chance)
   → Fix: Re-create RLS policies from Step 2

---

**Start with Step 1 and 2 - that will likely fix it!** 🚀

---

## 📝 AFTER FIXING

Once database is fixed:

1. Test login in customer app
2. Should work perfectly
3. Token will save
4. Can proceed to test other features

**Let me know which step fixed it or share the error message if still failing!**
