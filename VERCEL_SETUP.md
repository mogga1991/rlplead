# Vercel Environment Variables Setup

## Quick Fix for Current Production Error

### Step 1: Update NEXTAUTH_URL
1. Go to https://vercel.com/dashboard
2. Select your `rlplead` project
3. Click **Settings** in the top menu
4. Click **Environment Variables** in the left sidebar
5. Find `NEXTAUTH_URL`
6. Click the **Edit** button (pencil icon)
7. Change value from `rlplead.vercel.app` to `https://rlplead.vercel.app`
8. Click **Save**

### Step 2: Redeploy
1. Click **Deployments** in the top menu
2. Click the **three dots (...)** on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete (usually 1-2 minutes)

### Step 3: Test
1. Go to https://rlplead.vercel.app
2. Login
3. Try searching - errors should be gone!

---

## Complete Environment Variables Reference

### Required Variables (Must Set)

```bash
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
NEXTAUTH_URL=https://rlplead.vercel.app
NEXTAUTH_SECRET=zK8vXmPqR2wN9tY3hC7jL5sF1dG6bM4nA0eU8iO2pQ4=
APIFY_API_KEY=apify_api_xxxxxxxxxxxxxxxxx
```

### Optional Variables (Can Add Later)

```bash
# Redis for caching and rate limiting
REDIS_URL=redis://default:password@host:6379

# Or separate Redis config
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379

# OAuth Providers (if you add them)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# Monitoring
SENTRY_DSN=

# Future features
SENDGRID_API_KEY=
OPENAI_API_KEY=
```

## Environment-Specific Values

### Development (.env.local)
```bash
NEXTAUTH_URL=http://localhost:3000
```

### Production (Vercel)
```bash
NEXTAUTH_URL=https://rlplead.vercel.app
```

**Important**:
- Development uses `http://localhost:3000`
- Production MUST use `https://your-domain.vercel.app`
- Never commit `.env` files to git
- Use `.env.example` as a template

## Verification Checklist

After setting environment variables:

- [ ] NEXTAUTH_URL starts with `https://` (not `http://`)
- [ ] NEXTAUTH_URL has no trailing slash
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] DATABASE_URL includes `sslmode=require`
- [ ] All values are saved in Vercel
- [ ] Application has been redeployed
- [ ] Login works in production
- [ ] Search works in production
- [ ] No console errors

## Common Issues

### "NEXTAUTH_URL is invalid"
- Make sure it includes `https://`
- Remove any trailing slashes
- Use the exact Vercel domain

### "Authentication failed"
- Verify NEXTAUTH_SECRET is set
- Make sure it's the same value used to encrypt existing sessions
- Clear browser cookies and try again

### "Database connection failed"
- Check DATABASE_URL is correct
- Verify Neon database is accessible
- Ensure `sslmode=require` is in the connection string

### "Redis connection failed"
- Redis is optional - app works without it
- If using Redis, verify REDIS_URL is correct
- Check Redis instance is accessible from Vercel
