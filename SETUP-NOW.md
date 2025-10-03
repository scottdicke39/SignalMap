# 🚀 Enable SmartIntake Platform - Do This Now!

## Step 1: Create Supabase Project (2 minutes)

1. **Go to**: https://supabase.com
2. **Sign in** with GitHub or create account
3. Click **"New Project"**
4. Fill in:
   - **Name**: `smartintake-ai`
   - **Database Password**: (Click generate or create strong password - SAVE THIS!)
   - **Region**: Choose closest to you (e.g., `us-west-1`)
5. Click **"Create new project"**
6. ☕ Wait ~2 minutes while Supabase sets up

---

## Step 2: Run Database Schema (1 minute)

Once your project is ready:

1. In Supabase dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. **Open the file**: `supabase/schema.sql` from your project
4. **Copy ALL the contents**
5. **Paste** into the SQL Editor
6. Click **"Run"** (or press Cmd+Enter)
7. ✅ You should see "Success. No rows returned"

---

## Step 3: Get Your API Keys (1 minute)

1. In Supabase dashboard, click **"Project Settings"** (gear icon in sidebar)
2. Click **"API"** in the settings menu
3. You'll see two values - **COPY BOTH**:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   (very long string)
   ```

---

## Step 4: Add to Environment Variables (1 minute)

**Paste your values below and I'll add them:**

```bash
# Replace with YOUR values from Supabase:

NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**Once you paste these, I'll:**
1. Add them to `.env.local`
2. Restart the dev server
3. Test the connection!

---

## ⏱️ Estimated Time
- Step 1: 2 minutes (waiting for Supabase)
- Step 2: 1 minute (run SQL)
- Step 3: 1 minute (copy keys)
- Step 4: 30 seconds (paste here)

**Total: ~5 minutes** ⚡

---

## 🆘 Need Help?

**Can't find SQL Editor?**
- Look for "SQL Editor" in the left sidebar
- Or go to: `https://app.supabase.com/project/YOUR_PROJECT_ID/sql`

**SQL Error?**
- Make sure you copied the ENTIRE contents of `supabase/schema.sql`
- Try running it in sections if needed

**Can't find API keys?**
- Settings (gear icon) → API → Copy "Project URL" and "anon public" key

---

## ✅ Once Complete

After pasting your keys here, you'll be able to:
- ✅ Sign up at `/login`
- ✅ View dashboard at `/dashboard`
- ✅ Create & save intakes
- ✅ Collaborate with team
- ✅ Track versions
- ✅ Full platform features!

**Ready? Let's go!** 🎯

1. Open https://supabase.com in a new tab
2. Complete steps 1-3 above
3. Come back and paste your credentials

I'll be waiting! 😊

