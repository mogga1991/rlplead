# FedLeads Deployment Guide

## Quick Start

### 1. Vercel Deployment

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to Vercel
vercel

# Or deploy to production
vercel --prod
```

### 2. GitHub Setup

```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Production-ready deployment with 100% test coverage"

# Push to GitHub
git push origin main
```

---

## Environment Variables

### Required Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

#### Database
```env
DATABASE_URL=postgresql://user:password@host:5432/database
# Get from: Neon, Supabase, or your PostgreSQL provider
```

#### Redis (for caching & rate limiting)
```env
REDIS_URL=redis://default:password@host:6379
# Get from: Upstash, Redis Cloud, or your Redis provider
```

#### NextAuth (Authentication)
```env
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
# Generate secret: openssl rand -base64 32
```

---

## Vercel Configuration

### Build Settings in Vercel Dashboard

1. **Framework Preset**: Next.js
2. **Build Command**: `npm run build`
3. **Output Directory**: `.next` (auto-detected)
4. **Install Command**: `npm install`
5. **Node Version**: 18.x (specified in package.json)

---

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] All tests passing (150/150 - 100%)
- [x] Build successful
- [x] No TypeScript errors
- [x] Security headers configured

### Database
- [ ] Database created (Neon/Supabase/etc.)
- [ ] DATABASE_URL added to Vercel
- [ ] Migrations run (if any)

### Redis
- [ ] Redis instance created (Upstash recommended)
- [ ] REDIS_URL added to Vercel

### Authentication
- [ ] NEXTAUTH_URL set to production domain
- [ ] NEXTAUTH_SECRET generated and set

### Git Repository
- [ ] Code pushed to GitHub
- [ ] .env files NOT committed (.gitignore configured)
- [ ] Repository connected to Vercel

---

## Recommended Services

### Database: Neon (Recommended)
- **Why**: Serverless PostgreSQL, auto-scaling, generous free tier
- **Setup**: https://neon.tech
- **Free Tier**: 0.5 GB storage, 100 hours compute

### Redis: Upstash (Recommended)
- **Why**: Serverless Redis, pay-per-request, HTTP-based
- **Setup**: https://upstash.com
- **Free Tier**: 10,000 requests/day

---

*Last Updated: February 3, 2026*
