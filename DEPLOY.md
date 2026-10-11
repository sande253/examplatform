# 🚀 Quick Deployment Guide

## Deploy to Vercel (Frontend) - 5 Minutes

### Step 1: Push to GitHub

1. Create a new repository on GitHub: https://github.com/new
   - Name: `examprep-ai` (or your preferred name)
   - **DO NOT** initialize with README
   - Make it public or private

2. Copy the repository URL (e.g., `https://github.com/yourusername/examprep-ai.git`)

3. Run these commands:
```powershell
cd c:\examplatform
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin master
```

### Step 2: Deploy to Vercel

**Option A: Web Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Sign in with GitHub
3. Click "Import Project"
4. Select your `examprep-ai` repository
5. Configure:
   - **Root Directory**: `frontend` ⚠️ IMPORTANT!
   - **Framework**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Add Environment Variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:8000` (change after backend deployment)
7. Click **Deploy**
8. Wait 2-3 minutes ⏳

**Option B: Vercel CLI**

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd c:\examplatform\frontend
vercel

# Follow prompts:
# Set up and deploy? Y
# Which scope? (select your account)
# Link to existing project? N
# Project name? examprep-ai
# Directory? ./
# Override settings? N

# For production:
vercel --prod
```

### Step 3: Deploy Backend (Choose One)

#### 🚂 Railway (Recommended)

1. Go to https://railway.app/new
2. Click "Deploy from GitHub repo"
3. Select your repository
4. Click "Add variables" and add:
   ```
   DATABASE_URL=postgresql://... (Railway will auto-generate)
   SECRET_KEY=your-secret-key-generate-one
   GROQ_API_KEY=your-groq-api-key
   CORS_ORIGINS=https://your-vercel-url.vercel.app
   ```
5. Click "Deploy"
6. Copy your backend URL
7. Update Vercel environment variable `NEXT_PUBLIC_API_URL` with this URL

#### 🎨 Render

1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - Name: `examprep-backend`
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables (same as Railway)
6. Add PostgreSQL database from dashboard
7. Deploy!

### Step 4: Update Frontend API URL

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with your Railway/Render backend URL
3. Redeploy frontend (automatic after saving)

### Step 5: Run Database Migrations

On Railway/Render console, run:
```bash
alembic upgrade head
python scripts/seed_db.py
```

## ✅ You're Done!

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend.railway.app
- **API Docs**: https://your-backend.railway.app/docs

## 🔐 Default Login Credentials

- **Admin**: admin@examplatform.com / Admin@123
- **Student**: student@example.com / Student@123

## 🐛 Troubleshooting

**Frontend won't build?**
- Make sure Root Directory is set to `frontend` in Vercel
- Check build logs for missing dependencies

**Backend won't start?**
- Verify environment variables are set
- Check DATABASE_URL is correct
- Ensure all CORS origins include your Vercel URL

**Can't connect to API?**
- Check NEXT_PUBLIC_API_URL in Vercel env vars
- Verify CORS_ORIGINS in backend includes your frontend URL
- Test backend API docs directly: `https://your-backend.railway.app/docs`

## 🎉 Success!

Your ExamPrep AI platform is now live on the internet! 🌍
