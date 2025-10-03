# 🚀 Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Git repository initialized
- [x] Initial commit made
- [x] Vercel CLI available (via npx)

---

## 🔑 Environment Variables to Set in Vercel

When prompted during deployment, you'll need to add these environment variables:

### **Required:**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xuffardumjlfpcgcdeaj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1ZmZhcmR1bWpsZnBjZ2NkZWFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NDg1OTcsImV4cCI6MjA3NTAyNDU5N30.yGe4S_1CiTnc5ecvPUKGugyHXvE1cjWsaRQQChVikJE
```

### **Optional (add when you get them):**

```bash
GLEAN_API_KEY=your_glean_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
ASHBY_API_KEY=your_ashby_api_key_here
CONFLUENCE_API_TOKEN=your_confluence_token_here
```

---

## 📝 Deployment Steps

### **1. Login to Vercel**
```bash
npx vercel login
```

Follow the prompts to login with:
- GitHub
- GitLab
- Bitbucket
- Email

### **2. Deploy**
```bash
cd /Users/scott.dicke/Downloads/SmartIntake-AI
npx vercel
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Choose your account
- **Link to existing project?** → No
- **Project name?** → `smartintake-ai` (or your choice)
- **Directory?** → `.` (current directory)
- **Build settings?** → Accept defaults (Next.js detected)

### **3. Add Environment Variables**

After initial deployment, go to:
https://vercel.com/dashboard

1. Click on your project
2. Go to **Settings** → **Environment Variables**
3. Add the variables listed above
4. **Save**

### **4. Redeploy with Environment Variables**
```bash
npx vercel --prod
```

---

## 🎉 After Deployment

You'll get a URL like:
```
https://smartintake-ai.vercel.app
```

Or with a custom domain:
```
https://intake.joinhandshake.com
```

---

## 🔄 Future Deployments

Every time you want to deploy updates:

```bash
# Preview deployment (test first)
npx vercel

# Production deployment
npx vercel --prod
```

Or set up **Auto Deploy from Git:**
1. Push to GitHub
2. Connect Vercel to GitHub repo
3. Auto deploys on every push to main

---

## 🐛 Troubleshooting

### **Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors

### **Runtime Errors:**
- Check **Logs** in Vercel dashboard
- Verify environment variables are set
- Check Supabase is accessible

### **Database Issues:**
- Verify Supabase URL and keys
- Check RLS policies allow public access where needed
- Test database connection locally first

---

## 📊 What Gets Deployed

✅ **Included:**
- All React components
- API routes
- Supabase integration
- Authentication
- Sharing/Comments features
- Smart Upload
- Glean AI integration (UI ready)

❌ **Not Included (add later):**
- Glean API key (add when available)
- OpenAI API key (for AI features)
- Ashby/Confluence keys (for integrations)

---

## 🔐 Security Notes

- `.env.local` is **not** committed to Git (in `.gitignore`)
- Environment variables are stored securely in Vercel
- Supabase handles authentication
- RLS policies protect data

---

## 🚀 Custom Domain (Optional)

To use `intake.joinhandshake.com`:

1. Go to Vercel dashboard → your project
2. Settings → Domains
3. Add `intake.joinhandshake.com`
4. Follow DNS instructions
5. Vercel auto-provisions SSL

---

## 📈 Monitoring

Vercel provides:
- **Analytics** (page views, performance)
- **Logs** (runtime errors, API calls)
- **Speed Insights** (Core Web Vitals)
- **Function Logs** (API route executions)

All free on the Hobby plan!

---

## 💰 Cost

**Free Tier Includes:**
- Unlimited deployments
- 100 GB bandwidth/month
- 100 hours serverless function execution
- SSL certificates
- Preview deployments

Should be plenty for internal use!

---

## ✅ Ready to Deploy!

Run:
```bash
npx vercel login
```

Then follow the prompts!

