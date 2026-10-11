# Deployment Guide - ExamPrep AI Platform

## 🚀 Deploy Frontend to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Git installed on your machine

### Step 1: Initialize Git Repository

```bash
cd c:\examplatform
git init
git add .
git commit -m "Initial commit - ExamPrep AI Platform"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., "examprep-ai")
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### Step 3: Push to GitHub

```bash
git remote add origin YOUR_GITHUB_REPO_URL
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL` = Your backend API URL (see backend deployment below)

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd c:\examplatform\frontend
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name? examprep-ai
# - Directory? ./
# - Override settings? N

# For production deployment
vercel --prod
```

### Step 5: Configure Environment Variables in Vercel

After deployment, add environment variables in Vercel Dashboard:

1. Go to your project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.com
   ```

## 🔧 Deploy Backend

### Option 1: Deploy to Railway (Recommended for FastAPI + PostgreSQL)

1. Go to https://railway.app/new
2. Connect your GitHub repository
3. Select "Deploy from GitHub repo"
4. Choose the `examplatform` repository
5. Add a PostgreSQL database
6. Configure environment variables:
   ```
   DATABASE_URL=postgresql://...
   SECRET_KEY=your-secret-key
   GROQ_API_KEY=your-groq-key
   CORS_ORIGINS=https://your-frontend.vercel.app
   ```
7. Deploy!

### Option 2: Deploy to Render

1. Go to https://render.com
2. Create "New Web Service"
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database
6. Set environment variables

### Option 3: Deploy to Heroku

```bash
# Install Heroku CLI
# Create Procfile in backend directory
cd c:\examplatform\backend
echo "web: uvicorn app.main:app --host 0.0.0.0 --port $PORT" > Procfile

# Deploy
heroku create examprep-backend
heroku addons:create heroku-postgresql:mini
heroku config:set SECRET_KEY=your-secret-key
heroku config:set GROQ_API_KEY=your-key
git push heroku main
```

## 📦 Database Setup

After backend deployment:

```bash
# Run migrations
heroku run alembic upgrade head
# OR on Railway/Render, use their console

# Seed database (optional)
python scripts/seed_db.py
```

## 🔐 Environment Variables Reference

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=your-super-secret-key-change-this
GROQ_API_KEY=your-groq-api-key
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
USE_MOCK_EXTRACTOR=false
USE_MOCK_PAYMENT=true
REDIS_URL=redis://localhost:6379
```

## ✅ Post-Deployment Checklist

- [ ] Frontend deployed successfully on Vercel
- [ ] Backend deployed with database
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS configured correctly
- [ ] Test login/signup functionality
- [ ] Test paper upload (if using real Groq)
- [ ] Test payment flow (if using real Juspay)
- [ ] Custom domain configured (optional)

## 🌐 Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Backend Custom Domain
- Railway: Add custom domain in settings
- Render: Add custom domain in settings
- Update CORS_ORIGINS and frontend NEXT_PUBLIC_API_URL

## 🔄 Continuous Deployment

Both Vercel and Railway/Render support automatic deployments:
- Push to `main` branch → Automatic production deployment
- Push to other branches → Preview deployments

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Vercel/Railway dashboard
- Verify all dependencies are in package.json/requirements.txt
- Check Node.js version (Next.js 14 requires Node 18+)

### API Connection Issues
- Verify NEXT_PUBLIC_API_URL is set correctly
- Check CORS configuration in backend
- Verify backend is running and accessible

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is running
- Check firewall/network settings

## 📞 Support

For issues, check:
- Vercel Documentation: https://vercel.com/docs
- Railway Documentation: https://docs.railway.app
- Next.js Documentation: https://nextjs.org/docs
- FastAPI Documentation: https://fastapi.tiangolo.com

## 🎉 Success!

Your ExamPrep AI platform should now be live!
- Frontend: https://your-project.vercel.app
- Backend API: https://your-backend.railway.app
- API Docs: https://your-backend.railway.app/docs
