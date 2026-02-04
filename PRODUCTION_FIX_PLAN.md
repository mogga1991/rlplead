# Production Fix Plan - Search JSON Parsing Errors

## Issue Summary
Production app at https://rlplead.vercel.app shows these errors:
- **Search Error**: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"
- **Console Error**: `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
- **405 Errors**: Multiple "Method Not Allowed" errors for resources

## Root Cause
**NEXTAUTH_URL environment variable is missing the `https://` protocol**

Current value in Vercel: `rlplead.vercel.app`
Required value: `https://rlplead.vercel.app`

### Why This Causes the Errors
1. Malformed NEXTAUTH_URL prevents NextAuth from initializing correctly
2. Authentication middleware fails to validate requests
3. Next.js returns HTML error pages instead of JSON responses
4. Frontend tries to parse HTML as JSON → parsing errors

## Required Fixes

### 1. Fix NEXTAUTH_URL (CRITICAL)
**In Vercel Dashboard → rlplead project → Settings → Environment Variables:**

Update `NEXTAUTH_URL` to: `https://rlplead.vercel.app`

**Important**:
- Remove any trailing slashes
- Use `https://` (not `http://`)
- After updating, redeploy the application

### 2. Verify All Required Environment Variables
Ensure these are set in Vercel:

#### Required Variables:
- ✅ `DATABASE_URL` - PostgreSQL connection string (already set)
- ✅ `NEXTAUTH_SECRET` - Already set to generated value
- ❌ `NEXTAUTH_URL` - **NEEDS FIX**: Add `https://` protocol
- ✅ `APIFY_API_KEY` - Already set

#### Optional Variables (for future features):
- `REDIS_URL` - For caching and rate limiting (can add later)
- `REDIS_HOST` - Redis host (can add later)
- `REDIS_PORT` - Redis port (can add later)

### 3. Redeploy After Fix
After updating NEXTAUTH_URL:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

## Verification Steps

After redeploying, test these in production:

### Test 1: Authentication
1. Go to https://rlplead.vercel.app
2. Should see login page (not error page)
3. Login with credentials
4. Should redirect to dashboard

### Test 2: Search Functionality
1. After login, go to dashboard
2. Enter search filters
3. Click "Search"
4. Should see:
   - No JSON parsing errors
   - Search job starts
   - Progress indicator shows
   - Results load successfully

### Test 3: API Endpoints
Open browser console and verify:
- `/api/search-contractors` returns JSON (not HTML)
- `/api/csrf-token` returns JSON
- `/api/companies` returns JSON
- No 405 errors

## Technical Details

### Files Involved
- [middleware.ts](middleware.ts#L17) - Auth middleware that validates requests
- [lib/auth.ts](lib/auth.ts#L5) - NextAuth configuration with trustHost
- [app/page.tsx](app/page.tsx#L38-L46) - Frontend search that calls API
- [app/api/search-contractors/route.ts](app/api/search-contractors/route.ts) - Search API endpoint

### Why NEXTAUTH_URL Must Include Protocol
NextAuth uses NEXTAUTH_URL to:
- Generate callback URLs for OAuth
- Validate JWT tokens
- Set cookie domains
- Verify redirect URLs

Without the protocol:
- URL parsing fails
- Callback URLs are malformed
- JWT validation fails
- Middleware can't authenticate requests

## Expected Outcome
After fixing NEXTAUTH_URL and redeploying:
- ✅ Search functionality works without errors
- ✅ All API endpoints return JSON
- ✅ No HTML parsing errors
- ✅ Authentication works correctly
- ✅ No 405 errors

## If Issues Persist

If errors continue after the NEXTAUTH_URL fix:

1. **Check Browser Console** for specific error messages
2. **Verify Environment Variables** in Vercel are all saved correctly
3. **Clear Browser Cache** and cookies for rlplead.vercel.app
4. **Check Vercel Deployment Logs** for server-side errors
5. **Verify Database Connection** - DATABASE_URL is accessible from Vercel

## Additional Notes

### Security Headers
The app already has security headers configured in [middleware.ts](middleware.ts#L31-L42) - these will work correctly once NEXTAUTH_URL is fixed.

### Redis (Optional)
Redis is currently optional. The app will work without it. If you want to add Redis for caching and rate limiting:
1. Set up Redis instance (e.g., Upstash)
2. Add `REDIS_URL` to Vercel environment variables
3. Uncomment Redis config in code

### Database
Using Neon PostgreSQL - connection is already configured correctly via DATABASE_URL.
