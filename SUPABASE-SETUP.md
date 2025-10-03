# 🗄️ Supabase Setup for SmartIntake AI

## Quick Start (5 minutes)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create a new organization (or use existing)
4. Create a new project:
   - Name: `smartintake-ai`
   - Database Password: (generate strong password)
   - Region: Choose closest to you
5. Wait 2 minutes for project to spin up

### 2. Run Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/schema.sql`
4. Paste and click "Run"
5. ✅ Tables created!

### 3. Get API Keys

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)

### 4. Add to Environment Variables

Create `.env.local` (if not exists) and add:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Test Connection

```bash
npm run dev
```

Visit http://localhost:3000 - you're ready to go! 🎉

---

## What's Included

### Tables Created:
- ✅ `intakes` - Main intake documents
- ✅ `intake_versions` - Version history
- ✅ `intake_comments` - Comments & discussions
- ✅ `intake_approvals` - Approval workflow
- ✅ `intake_activity` - Activity log
- ✅ `intake_shares` - Sharing & permissions

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only see their own intakes
- ✅ Shared intakes respect permissions
- ✅ Automatic timestamp updates

### Performance:
- ✅ Indexes on common queries
- ✅ Optimized for search
- ✅ Fast lookups by user/status

---

## Optional: Enable Email Auth

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Users can now sign up!

## Optional: Enable Google OAuth

1. Create Google OAuth credentials
2. Add to Supabase: **Authentication** → **Providers** → **Google**
3. Add redirect URL from Supabase
4. Users can sign in with Google!

---

## Production Deployment

### Cloud Run (Current):
Already configured! Just add environment variables:

```bash
# In Google Cloud Console
gcloud run services update smartintake-ai \
  --update-env-vars NEXT_PUBLIC_SUPABASE_URL=xxx \
  --update-env-vars NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
```

### Vercel (Recommended):
1. Deploy to Vercel
2. Add environment variables in project settings
3. Done!

---

## Troubleshooting

### "relation does not exist" error:
- Run the schema.sql script in Supabase SQL Editor

### "JWT expired" error:
- Refresh the page or sign in again

### Can't connect:
- Check API keys in .env.local
- Verify project URL is correct
- Ensure project is not paused

---

## Next Steps

✅ Database is ready!  
✅ Now let's build the features:
- Dashboard page
- Save/load functionality
- Sharing & permissions
- Real-time collaboration

Check `PLATFORM-IMPLEMENTATION-PLAN.md` for the roadmap!

