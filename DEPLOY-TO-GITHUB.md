# 🚀 Deploy SignalMap to GitHub + Vercel

## ✅ Step 1: Create GitHub Repository

1. **Go to:** https://github.com/new

2. **Fill in:**
   - **Repository name:** `signalmap`
   - **Description:** "AI-powered recruiting intelligence platform - map the signals that matter"
   - **Visibility:** **Private** (recommended for internal use)
   - **DON'T check:** "Add a README file", "Add .gitignore", or "Choose a license" (we already have these)

3. **Click:** "Create repository"

---

## 📤 Step 2: Push Code to GitHub

After creating the repo, GitHub will show you a page with commands. You'll see something like:

```
…or push an existing repository from the command line

git remote add origin https://github.com/YOUR-USERNAME/signalmap.git
git branch -M main
git push -u origin main
```

**Copy your repository URL**, then run:

```bash
cd /Users/scott.dicke/Downloads/SignalMap

# Add GitHub as remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR-USERNAME/signalmap.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Enter your GitHub credentials when prompted.**

---

## 🎯 Step 3: Deploy to Vercel

1. **Go to:** https://vercel.com/new

2. **Login** with GitHub (or Email)

3. **Import your GitHub repository:**
   - Click "Import Git Repository"
   - Search for "signalmap"
   - Click "Import"

4. **Configure Project:**
   - **Project Name:** `signalmap` (auto-filled)
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** Leave default
   - **Output Directory:** Leave default

5. **Add Environment Variables:**
   Click "Environment Variables" and add these:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Value: https://xuffardumjlfpcgcdeaj.supabase.co

   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZmZhcmR1bWpsZnBjZ2NkZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDg1OTcsImV4cCI6MjA3NTAyNDU5N30.yGe4S_1CiTnc5ecvPUKGugyHXvE1cjWsaRQQChVikJE
   ```

   **Optional (add later):**
   - `GLEAN_API_KEY` (when you get it)
   - `OPENAI_API_KEY` (for AI features)
   - `ASHBY_API_KEY` (for Ashby integration)

6. **Click "Deploy"**

---

## 🎉 Step 4: Get Your Live URL

After deployment (takes ~2 minutes), you'll get a URL like:

```
https://signalmap.vercel.app
```

Or:

```
https://signalmap-YOUR-USERNAME.vercel.app
```

**Share this URL with anyone** - they can access SignalMap!

---

## 🔄 Future Updates

Every time you push to GitHub, Vercel will **automatically redeploy**:

```bash
cd /Users/scott.dicke/Downloads/SignalMap

# Make changes...

git add .
git commit -m "Update feature X"
git push

# Vercel auto-deploys!
```

---

## 🌐 Custom Domain (Optional)

Want to use `signalmap.joinhandshake.com` or `intake.joinhandshake.com`?

1. Go to Vercel dashboard → SignalMap project
2. Settings → Domains
3. Add your domain
4. Follow DNS instructions from Vercel
5. SSL is automatic!

---

## 📊 What's Included in Deployment

✅ **Features:**
- Full SignalMap platform
- Supabase database (cloud-hosted)
- Authentication (Supabase Auth)
- Auto-save
- Sharing & Comments
- Smart Upload (PDF/DOCX/TXT/MD)
- Template Library
- Glean AI integration (UI ready, add API key later)
- Click-to-add AI suggestions

✅ **Performance:**
- CDN-hosted (fast globally)
- Automatic caching
- SSL/HTTPS
- Serverless functions

---

## 🔐 Security

- Environment variables encrypted
- `.env.local` never committed to Git
- Supabase RLS policies protect data
- HTTPS everywhere

---

## 💰 Cost

**Vercel Free Tier:**
- Unlimited deployments
- 100 GB bandwidth/month
- SSL certificates included
- Should be plenty for internal use!

---

## ✅ Ready to Deploy!

**Next Steps:**

1. Create GitHub repo: https://github.com/new
2. Push code (see Step 2 above)
3. Deploy on Vercel: https://vercel.com/new
4. Get your live URL!

**Total time: ~5 minutes** 🚀

