# Deployment Guide

This guide walks you through deploying the Auto Resume Tailor application to production.

## Architecture

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: FastAPI app with LaTeX deployed on Render.com

## Prerequisites

- [x] GitHub account
- [x] Vercel account (free tier available)
- [x] Render account (free tier available)
- [x] OpenAI API key

## Backend Deployment (Render.com)

### Option 1: Using Render Dashboard (Recommended)

1. **Create Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure Service**
   ```
   Name: auto-resume-backend
   Region: Oregon (US West) or closest to your users
   Branch: master
   Root Directory: backend
   Environment: Docker
   Dockerfile Path: ./Dockerfile
   
   Instance Type: Free (or Starter $7/month for always-on)
   ```

4. **Add Environment Variables**
   - Click "Environment" tab
   - Add variable:
     ```
     Key: OPENAI_API_KEY
     Value: your-actual-api-key
     ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment (LaTeX installation)
   - Note your service URL: `https://auto-resume-backend.onrender.com`

6. **Test Backend**
   - Visit: `https://your-backend-url.onrender.com/health`
   - Should return: `{"status": "ok"}`
   - Visit: `https://your-backend-url.onrender.com/docs` for API docs

### Option 2: Using render.yaml (Infrastructure as Code)

1. Push the `render.yaml` file to your repository
2. In Render dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and deploy based on `render.yaml`
5. Set the `OPENAI_API_KEY` environment variable in the dashboard

### Important Notes for Render Free Tier

⚠️ **Free tier sleeps after 15 minutes of inactivity**
- First request after sleep: 30-60 seconds to wake up
- Subsequent requests: Normal speed (7-15 seconds)
- **Solution**: Upgrade to Starter plan ($7/month) for always-on service

## Frontend Deployment (Vercel)

### Step 1: Prepare Environment Variable

1. Copy your Render backend URL
2. Format: `https://auto-resume-backend.onrender.com` (without trailing slash)

### Step 2: Deploy to Vercel

1. **Create Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Build Settings**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   ```

4. **Add Environment Variable**
   - Expand "Environment Variables"
   - Add:
     ```
     Name: NEXT_PUBLIC_API_URL
     Value: https://your-backend-url.onrender.com
     Environments: Production, Preview, Development
     ```

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your URL: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. **Update `backend/app.py`** with your actual Vercel URL:
   ```python
   allow_origins=[
       "http://localhost:3000",
       "https://your-actual-app.vercel.app",  # Your production URL
       "https://*.vercel.app",  # All preview deployments
   ]
   ```

2. **Push changes** to trigger Render redeployment

## Verification

### Test Backend
```bash
# Health check
curl https://your-backend.onrender.com/health

# API documentation
open https://your-backend.onrender.com/docs
```

### Test Frontend
1. Visit your Vercel URL
2. Upload a resume PDF
3. Paste a job description
4. Click "Tailor Resume"
5. Should process and return results

### Test End-to-End
1. Open browser DevTools → Network tab
2. Upload resume and submit
3. Verify API calls to backend are successful
4. Check for CORS errors (should be none)

## Environment Variables Summary

### Backend (Render)
- `OPENAI_API_KEY` - Your OpenAI API key (required)
- `PORT` - Auto-set by Render to 8000

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Your backend URL (required)

## Custom Domain Setup (Optional)

### Frontend (Vercel)
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Backend (Render)
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Update DNS with CNAME record
4. Update frontend `NEXT_PUBLIC_API_URL` to use new domain
5. Update backend CORS to include new domain

## Monitoring & Logs

### Render Logs
- Dashboard → Your Service → Logs
- View real-time logs
- Filter by date/time

### Vercel Logs
- Dashboard → Your Project → Deployments
- Click deployment → View Function Logs

## Troubleshooting

### Backend Issues

**Build fails:**
- Check Render logs for errors
- LaTeX installation takes 3-5 minutes (normal)
- Verify all dependencies in `requirements.txt`

**API returns 500:**
- Check Render logs
- Verify `OPENAI_API_KEY` is set correctly
- Test `/health` endpoint

**CORS errors:**
- Verify Vercel URL is in `allow_origins`
- Push changes to trigger redeploy
- Clear browser cache

**Slow first request:**
- Normal on free tier (service sleeps)
- Consider upgrading to Starter plan

### Frontend Issues

**Build fails:**
- Check Vercel build logs
- Verify `package.json` dependencies
- Test build locally: `npm run build`

**API calls fail:**
- Verify `NEXT_PUBLIC_API_URL` is set
- Check backend is running
- Test backend URL directly

**404 errors:**
- Verify root directory is set to `frontend`
- Check routes in `app/` directory

## Scaling & Performance

### Backend Optimization
- Upgrade to Render Starter plan for better performance
- Use Redis for caching (Render add-on)
- Consider increasing instance size

### Frontend Optimization
- Next.js automatically optimizes
- Vercel provides global CDN
- Enable Vercel Analytics (optional)

## Cost Estimation

| Service | Free Tier | Paid Option |
|---------|-----------|-------------|
| Render Backend | ✅ Free with sleep | $7/mo Starter (always-on) |
| Vercel Frontend | ✅ Generous free tier | $20/mo Pro (optional) |
| **Total** | **$0/month** | **$7-27/month** |

## Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use environment variables** - Configured in hosting platforms
3. **Keep dependencies updated** - Run `npm audit` and `pip-audit`
4. **Enable HTTPS** - Automatic on Vercel and Render
5. **Set up rate limiting** - Consider adding to backend
6. **Monitor API usage** - Check OpenAI dashboard regularly

## Continuous Deployment

Both Vercel and Render support automatic deployment:

- **Push to `master`** → Auto-deploy to production
- **Pull requests** → Vercel creates preview deployments
- **Manual deploys** → Available in both dashboards

## Support & Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **LaTeX Issues**: See `LATEX_SETUP.md`
- **Frontend Issues**: See `frontend/README.md`

## Next Steps After Deployment

1. Test thoroughly with various resumes
2. Set up monitoring/alerting
3. Add custom domain (optional)
4. Configure analytics (optional)
5. Set up backup/recovery plan
6. Document API for users

---

**Deployed successfully?** 🎉

Don't forget to:
- Update the main `README.md` with your deployment URLs
- Share with users
- Monitor logs regularly
- Keep dependencies updated

