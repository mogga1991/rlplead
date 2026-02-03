# FedLeads - Vercel Deployment Guide

Complete guide to deploying FedLeads to Vercel with secure environment variable management.

## Prerequisites

- GitHub account with the rlplead repository
- Vercel account (free tier is sufficient)
- Neon PostgreSQL database
- Apify API key (optional, app works with mock data without it)

## Security First: Environment Variables

### 🔒 IMPORTANT: Never Commit API Keys

Your API keys and database credentials are stored in `.env` which is:
- ✅ Listed in `.gitignore` (never committed to Git)
- ✅ Listed in `.vercelignore` (never deployed to Vercel)
- ✅ Only used locally on your machine

**Production secrets are managed through Vercel's secure Environment Variables dashboard.**

## Step 1: Prepare Your Repository

Your repository is already set up! The following files ensure secure deployment:

```bash
.env.example          # Template (safe to commit)
.gitignore           # Excludes .env from Git
.vercelignore        # Excludes .env from Vercel
vercel.json          # Vercel configuration
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Visit Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Project**
   - Click "Add New" → "Project"
   - Select your `rlplead` repository
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `next build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

4. **Add Environment Variables** (CRITICAL STEP)

   Click "Environment Variables" and add:

   | Name | Value | Where to Get It |
   |------|-------|-----------------|
   | `DATABASE_URL` | `postgresql://...` | Your Neon dashboard → Connection String |
   | `APIFY_API_KEY` | `apify_api_...` | Apify console → Integrations |

   **Important:**
   - Add these variables for **All** environments (Production, Preview, Development)
   - Click "Add" after each variable
   - Double-check the values are correct

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? rlplead (or your choice)
# - Directory? ./
# - Want to override settings? No

# Add environment variables
vercel env add DATABASE_URL
# Paste your Neon connection string

vercel env add APIFY_API_KEY
# Paste your Apify API key

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

### Get Your Neon Database URL

1. Go to [console.neon.tech](https://console.neon.tech)
2. Select your `neondb` project
3. Click "Connection Details"
4. Copy the **Connection String** (it looks like):
   ```
   postgresql://username:password@host.aws.neon.tech/neondb?sslmode=require
   ```

### Get Your Apify API Key (Optional)

1. Go to [console.apify.com](https://console.apify.com)
2. Navigate to "Settings" → "Integrations"
3. Copy your API Token (starts with `apify_api_`)

### Add to Vercel Dashboard

1. In your Vercel project, go to "Settings" → "Environment Variables"
2. Add each variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your Neon connection string
   - **Environments:** Select all (Production, Preview, Development)
   - Click "Save"

3. Repeat for `APIFY_API_KEY`

## Step 4: Verify Deployment

### Check Build Status

1. Go to your project's "Deployments" tab in Vercel
2. Latest deployment should show ✅ "Ready"
3. Click on the deployment to see build logs

### Test Your Application

Visit your deployment URL and verify:

- ✅ Home page loads with search interface
- ✅ Dashboard displays (navigate via sidebar)
- ✅ Search functionality works
- ✅ Database connection is working (check for saved searches/companies)
- ✅ No errors in browser console

### Common Issues & Solutions

**Build Fails with "DATABASE_URL is not set"**
- Solution: Add DATABASE_URL environment variable in Vercel dashboard
- Redeploy after adding the variable

**API Routes Return 500 Error**
- Check Vercel deployment logs for specific error
- Verify DATABASE_URL is correctly formatted
- Ensure your Neon database is active (free tier databases may sleep)

**"Failed to fetch" errors on search**
- Check browser console for CORS or network errors
- Verify APIFY_API_KEY is set (or app will use mock data)
- Check Vercel function logs for API errors

## Step 5: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `fedleads.com`)
4. Follow DNS configuration instructions
5. Vercel automatically provisions SSL certificate

## Security Best Practices

### ✅ What We've Implemented

1. **Environment Variables**
   - Stored securely in Vercel dashboard
   - Never committed to Git
   - Encrypted at rest and in transit

2. **Database Security**
   - Connection string uses SSL (`sslmode=require`)
   - Neon provides automatic SSL/TLS encryption
   - Database credentials never exposed to client

3. **API Key Protection**
   - Apify key only used in server-side API routes
   - Never sent to browser/client
   - Protected by Next.js serverless function isolation

4. **File Exclusions**
   - `.gitignore` prevents committing secrets
   - `.vercelignore` prevents deploying local configs
   - `.env.example` provides template without real values

### 🚫 Never Do This

❌ Commit `.env` file to Git
❌ Put API keys in client-side code
❌ Share your DATABASE_URL publicly
❌ Use same database for dev and production
❌ Disable SSL on database connections

### ✅ Always Do This

✅ Use environment variables for all secrets
✅ Rotate API keys periodically
✅ Use separate databases for dev/staging/prod
✅ Enable Vercel's "Protection" for production deployments
✅ Monitor Vercel logs for suspicious activity

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Add new feature"
git push origin main

# Vercel automatically:
# 1. Detects the push
# 2. Runs the build
# 3. Deploys to production
# 4. Sends you a notification
```

**Preview Deployments:**
- Every pull request gets its own preview URL
- Test changes before merging to main
- Automatic cleanup after PR is merged

## Monitoring & Logs

### View Logs

1. Go to your project in Vercel dashboard
2. Click on a deployment
3. View "Build Logs" or "Function Logs"

### Function Logs (API Routes)

See real-time logs from your API routes:
```bash
vercel logs [deployment-url]
```

### Analytics

Vercel provides:
- Page views and unique visitors
- Top pages and referrers
- Core Web Vitals performance metrics
- Edge network analytics

Access at: Project → Analytics

## Rollback

If a deployment has issues:

1. Go to "Deployments" in Vercel
2. Find the last working deployment
3. Click "..." menu → "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

## Environment-Specific Configurations

### Production
- Uses production DATABASE_URL
- Optimized build with minification
- CDN caching enabled
- Analytics enabled

### Preview (Pull Requests)
- Uses preview DATABASE_URL (or production if not set)
- Includes source maps for debugging
- Password protection available

### Development (Local)
- Uses local `.env` file
- Hot reload enabled
- Development mode errors shown

## Cost Optimization

### Vercel (Free Tier Limits)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Automatic SSL
- ✅ 100 GB-hours of serverless function execution

### Neon (Free Tier Limits)
- ✅ 3 GB storage
- ✅ 1 project
- ✅ Automatic suspend after inactivity
- ✅ Instant resume on request

**Both are sufficient for development and moderate production use.**

## Scaling for Production

When you need to scale:

1. **Upgrade Vercel to Pro** ($20/month)
   - Increased bandwidth and function execution time
   - Team collaboration features
   - Advanced analytics

2. **Upgrade Neon to Pro** ($19/month)
   - More storage and compute
   - Always-on databases
   - Read replicas for better performance

## Support & Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Neon Documentation:** https://neon.tech/docs
- **FedLeads Repository:** https://github.com/mogga1991/rlplead

## Troubleshooting

### Build succeeds but app doesn't work
**Cause:** Environment variables not set in Vercel
**Solution:**
1. Go to your project in Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon connection string
3. Add `APIFY_API_KEY` (optional, but recommended)
4. Click on your latest deployment → "..." menu → "Redeploy"

The app **will build successfully** even without environment variables (as of latest update), but **will not function** until you add them and redeploy.

### "Dynamic server usage" errors in build logs
✅ **This is completely normal** - API routes are meant to be dynamic (server-rendered on demand)
- These are indicated by ƒ symbol in build output
- Shows as "Error fetching..." in build logs but doesn't fail the build
- They work correctly in Vercel's serverless environment
- **You can safely ignore these messages**

### Database connection timeouts at runtime
- Check if your Neon database is active (free tier suspends after inactivity)
- Verify DATABASE_URL has `sslmode=require` parameter
- Check Neon dashboard for connection limits
- Wait 30 seconds and try again (Neon may be waking from sleep)

### Build fails with TypeScript errors
- Ensure `tsconfig.json` has `"target": "ES2017"` and `"downlevelIteration": true`
- Run `npm run build` locally to catch errors before deploying
- Check that all dependencies are properly installed

---

## Quick Checklist

Before deploying, ensure:

- [ ] Repository pushed to GitHub
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] Neon database is active and accessible
- [ ] You have your DATABASE_URL connection string
- [ ] You have your APIFY_API_KEY (or willing to use mock data)
- [ ] `npm run build` succeeds locally
- [ ] All environment variables added in Vercel dashboard
- [ ] First deployment completed successfully
- [ ] Application loads and basic functionality works

**Your FedLeads application is now securely deployed!** 🚀
