# Production Deployment Guide

This guide provides step-by-step instructions for deploying the AI-Powered Resume Tailor application to production.

## 🏗️ Architecture Overview

- **Backend**: FastAPI application with LaTeX → Deployed on Render.com (Docker)
- **Frontend**: Next.js application → Deployed on Vercel
- **Database**: None required (stateless application)
- **External APIs**: OpenAI API for LLM functionality

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] GitHub repository with your code
- [x] OpenAI API key
- [x] Render account (sign up at [render.com](https://render.com))
- [x] Vercel account (sign up at [vercel.com](https://vercel.com))
- [x] Tested application locally

## 🚀 Backend Deployment (Render.com)

### Why Render?
- Native Docker support (required for LaTeX)
- Generous free tier
- Auto-deployment from GitHub
- Built-in HTTPS and health checks

### Step 1: Prepare Your Repository

Ensure these files exist in your repository:
- `backend/Dockerfile` ✅
- `backend/requirements.txt` ✅
- `render.yaml` (optional, for infrastructure as code) ✅

### Step 2: Create Web Service on Render

1. **Sign in to Render**
   - Go to [render.com](https://render.com)
   - Sign up/in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service Settings**
   ```
   Name: auto-resume-backend
   Region: Oregon (US West) or closest to users
   Branch: master (or main)
   Root Directory: backend
   Environment: Docker
   Dockerfile Path: ./Dockerfile
   Instance Type: Free (or Starter $7/month for always-on)
   ```

4. **Add Environment Variables**
   
   Go to "Environment" section and add:
   ```
   Key: OPENAI_API_KEY
   Value: [your-actual-openai-api-key]
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for first deployment (LaTeX installation is time-consuming)
   - Note your service URL: `https://auto-resume-backend.onrender.com`

### Step 3: Verify Backend Deployment

Test your deployed backend:

```bash
# Health check
curl https://your-backend-url.onrender.com/health
# Expected: {"status": "ok"}

# API documentation
open https://your-backend-url.onrender.com/docs
```

### Important: Free Tier Limitations

⚠️ **Render free tier sleeps after 15 minutes of inactivity**

- First request after sleep: 30-60 seconds wake-up time
- Subsequent requests: Normal speed (8-15 seconds for resume generation)
- **Solution**: Upgrade to Starter plan ($7/month) for always-on service

### Optional: Using render.yaml (Infrastructure as Code)

The `render.yaml` file in the repository root allows automated deployment:

1. In Render dashboard, click "New +" → "Blueprint"
2. Connect your repository
3. Render will auto-detect `render.yaml` and deploy
4. Set environment variables in the dashboard
5. This creates and configures everything automatically

## 🌐 Frontend Deployment (Vercel)

### Why Vercel?
- Optimized for Next.js (creator of Next.js)
- Global CDN and edge network
- Automatic HTTPS and SSL
- Zero-config deployment

### Step 1: Prepare Frontend

Ensure `frontend/vercel.json` exists:

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

### Step 2: Deploy to Vercel

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js

3. **Configure Project Settings**
   ```
   Framework Preset: Next.js (auto-detected)
   Root Directory: frontend
   Build Command: npm run build (auto-detected)
   Output Directory: .next (auto-detected)
   Install Command: npm install (auto-detected)
   Node.js Version: 18.x or later
   ```

4. **Add Environment Variable**
   
   In "Environment Variables" section, add:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.onrender.com
   Environments: ✅ Production, ✅ Preview, ✅ Development
   ```
   
   **Important**: Replace with your actual Render backend URL (no trailing slash)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build and deployment
   - Get your URL: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

After getting your Vercel URL, update `backend/app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-actual-app.vercel.app",  # Add your production URL
        "https://*.vercel.app",  # Keeps preview deployments working
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Commit and push** this change to trigger automatic redeployment on Render.

### Step 4: Verify Frontend Deployment

1. Visit your Vercel URL
2. Try uploading a resume and tailoring it
3. Check browser DevTools Network tab for successful API calls
4. Verify no CORS errors

## 🔍 Verification & Testing

### End-to-End Testing

1. **Open frontend** at your Vercel URL
2. **Upload a PDF resume** (test with different formats)
3. **Paste a job description** (try different domains)
4. **Click "Tailor My Resume"**
5. **Verify results display** with proper formatting
6. **Download the tailored resume** (JSON format)

### Check Logs

**Backend (Render):**
- Dashboard → Your Service → Logs
- Monitor for errors or warnings

**Frontend (Vercel):**
- Dashboard → Your Project → Deployments → [Latest] → View Function Logs
- Check for build errors or runtime issues

## 🔐 Environment Variables Summary

### Backend Environment Variables (Render)
| Variable | Value | Required |
|----------|-------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | ✅ Yes |
| `PORT` | 8000 (auto-set by Render) | Auto |

### Frontend Environment Variables (Vercel)
| Variable | Value | Required |
|----------|-------|----------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL | ✅ Yes |

## 🎯 Custom Domain Setup (Optional)

### Frontend Custom Domain (Vercel)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `resume.yourdomain.com`)
3. Configure DNS:
   - Type: `CNAME`
   - Name: `resume` (or `@` for root)
   - Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)

### Backend Custom Domain (Render)

1. Go to Service Settings → Custom Domain
2. Add your domain (e.g., `api.yourdomain.com`)
3. Configure DNS:
   - Type: `CNAME`
   - Name: `api`
   - Value: Provided by Render
4. Update frontend `NEXT_PUBLIC_API_URL` to use new domain
5. Update backend CORS to include new domain

## 🐛 Troubleshooting

### Backend Issues

**"LaTeX compilation failed"**
- Check Render logs for specific LaTeX errors
- Verify Dockerfile includes all LaTeX packages
- Test locally with Docker: `docker build -t test-backend ./backend`

**"OpenAI API error"**
- Verify `OPENAI_API_KEY` is set correctly in Render dashboard
- Check OpenAI account has credits/billing enabled
- Test key locally: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

**"Service not responding"**
- Check health endpoint: `/health`
- Review Render logs for errors
- Verify service is deployed and running

**"Slow first request"**
- Normal on free tier (service sleeps)
- Upgrade to Starter plan for always-on service
- Consider implementing keep-alive ping

### Frontend Issues

**"Failed to fetch backend API"**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and accessible
- Test backend URL directly in browser
- Check browser console for CORS errors

**"CORS error"**
- Verify Vercel URL is in backend's `allow_origins`
- Commit and push backend changes
- Wait for Render auto-deployment
- Clear browser cache

**"Build failed"**
- Check Vercel build logs for errors
- Test build locally: `cd frontend && npm run build`
- Verify all dependencies in `package.json`
- Check Node.js version compatibility

### Common Deployment Errors

**Render: "Dockerfile not found"**
- Set "Root Directory" to `backend`
- Set "Dockerfile Path" to `./Dockerfile`

**Vercel: "Module not found"**
- Verify all imports use correct paths
- Check that dependencies are in `package.json`, not `devDependencies`

**Both: "Environment variable not set"**
- Double-check variable names (case-sensitive)
- Redeploy after setting environment variables
- Use `.env.example` files as reference

## 📊 Monitoring & Performance

### Render Monitoring
- Dashboard shows CPU, memory, and request metrics
- Set up email alerts for service downtime
- Monitor OpenAI API usage and costs

### Vercel Analytics (Optional)
- Enable Vercel Analytics in project settings
- Track page views, performance, and user behavior
- Free tier includes basic analytics

### Recommended Monitoring
- Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- Monitor OpenAI API usage in OpenAI dashboard
- Track error rates in application logs

## 💰 Cost Estimation

| Service | Free Tier | Paid Option | Recommendation |
|---------|-----------|-------------|----------------|
| Render Backend | ✅ Free (with sleep) | $7/mo (always-on) | Start free, upgrade if needed |
| Vercel Frontend | ✅ Generous free tier | $20/mo Pro | Free tier is sufficient |
| OpenAI API | Pay-per-use | $5-50/mo typical | Monitor usage |
| **Total** | **~$5-10/mo** | **~$27-77/mo** | Start with ~$10/mo |

### Typical OpenAI Costs
- Resume tailoring: ~$0.05-0.15 per request
- 100 requests/month: ~$5-15
- Use GPT-3.5-turbo for lower costs (optional)

## 🔄 Continuous Deployment

Both platforms support automatic deployment:

**Automatic Triggers:**
- Push to `master` branch → Deploy to production
- Pull requests → Vercel creates preview deployments
- Manual deploys available in both dashboards

**Deployment Workflow:**
1. Make changes locally and test
2. Commit and push to GitHub
3. Render auto-deploys backend (3-5 minutes)
4. Vercel auto-deploys frontend (2-3 minutes)
5. Verify changes in production

## 🔒 Security Best Practices

### Production Security Checklist

- [x] Environment variables stored securely (not in code)
- [x] HTTPS enabled on all services (automatic on Render/Vercel)
- [x] CORS properly configured with specific origins
- [x] API keys never committed to repository
- [x] Dependencies kept up-to-date
- [x] Input validation on all endpoints
- [x] Rate limiting (consider adding for production)

### Recommended Security Enhancements

1. **Add rate limiting** to prevent abuse
2. **Implement API authentication** for production use
3. **Monitor API usage** and set spending limits
4. **Regular security audits** of dependencies
5. **Set up error tracking** (e.g., Sentry)

## 📈 Scaling Considerations

### When to Scale

**Backend (Render):**
- Consistent traffic → Upgrade to Starter ($7/mo) to eliminate sleep
- High traffic → Upgrade to Standard ($25/mo) for more resources
- Very high traffic → Consider multiple instances or different platform

**Frontend (Vercel):**
- Free tier handles significant traffic
- Upgrade to Pro only if you need advanced features

### Performance Optimization

1. **Caching**: Add Redis for domain detection caching (Render add-on)
2. **CDN**: Vercel provides global CDN automatically
3. **Database**: Consider adding PostgreSQL for user data (if needed)
4. **Background Jobs**: Use Celery for async processing (if needed)

## 📝 Post-Deployment Tasks

### Immediate (Within 24 hours)

- [ ] Test all functionality in production
- [ ] Verify error handling works correctly
- [ ] Set up uptime monitoring
- [ ] Document production URLs
- [ ] Update README with deployment URLs (optional)

### Short-term (Within 1 week)

- [ ] Monitor logs for errors
- [ ] Check OpenAI API usage and costs
- [ ] Gather initial user feedback
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create backup of configuration

### Ongoing

- [ ] Monitor service health and performance
- [ ] Review and update dependencies monthly
- [ ] Monitor API costs and optimize
- [ ] Collect user feedback and iterate
- [ ] Keep documentation updated

## 🆘 Getting Help

### Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com

### Support Channels

- Check application logs first (Render/Vercel dashboards)
- Review this deployment guide and README
- Search for error messages in documentation
- Open GitHub issue for application-specific problems

---

## ✅ Deployment Success Checklist

Verify these after deployment:

- [ ] Backend health check returns `{"status": "ok"}`
- [ ] Backend API docs accessible at `/docs`
- [ ] Frontend loads and displays properly
- [ ] File upload works (drag-and-drop and click)
- [ ] Resume tailoring completes successfully
- [ ] Results page displays correctly
- [ ] No CORS errors in browser console
- [ ] LaTeX PDF generation works
- [ ] Environment variables are set correctly
- [ ] Automatic deployments work (test with a small change)

---

**Congratulations!** 🎉 Your AI-Powered Resume Tailor is now deployed and ready for users!

**Next Steps:**
- Share your application URL
- Monitor usage and performance
- Gather user feedback
- Iterate and improve

For questions or issues, refer to the troubleshooting section or open a GitHub issue.
