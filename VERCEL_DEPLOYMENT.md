# Vercel Deployment Guide for RWA-DEX

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Environment Variables**: Configure the required environment variables

## Deployment Steps

### 1. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Import Project" and select your repository
3. Vercel will automatically detect it's a Vite project

### 2. Configure Environment Variables

In your Vercel dashboard, go to Settings → Environment Variables and add the following:

#### Required Variables:
```
VITE_APP_NAME=RWA-DEX
VITE_APP_URL=https://your-app.vercel.app
NODE_ENV=production
VITE_CHAIN_ID=5009
VITE_RPC_URL=https://rpc.sepolia.mantle.xyz
VITE_EXPLORER_URL=https://sepolia.mantlescan.info
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

#### Contract Addresses (update after contract deployment):
```
VITE_RWA_FACTORY_ADDRESS=0x...
VITE_DEX_CORE_ADDRESS=0x...
VITE_PRICE_ORACLE_ADDRESS=0x...
VITE_LENDING_PROTOCOL_ADDRESS=0x...
VITE_COMPLIANCE_REGISTRY_ADDRESS=0x...
VITE_YIELD_DISTRIBUTOR_ADDRESS=0x...
```

#### Optional (for enhanced features):
```
DATABASE_URL=postgresql://...  # if using database
REDIS_URL=redis://...         # if using caching
JWT_SECRET=your_secret        # if using authentication
COINGECKO_API_KEY=...         # for price feeds
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Configure Build Settings

The `vercel.json` file is already configured with:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework**: Vite (auto-detected)
- **Node.js Runtime**: 18.x

### 4. API Routes

The API routes are configured as serverless functions:
- All API calls go through `/api/[...path].ts`
- CORS is properly configured
- Routes include: health, profile, market, trade, portfolio, liquidity, analytics

### 5. Deploy

1. Push your changes to GitHub
2. Vercel will automatically trigger a deployment
3. Monitor the deployment in the Vercel dashboard

## Post-Deployment Checklist

### 1. Test Core Functionality
- [ ] Website loads correctly
- [ ] Wallet connection works
- [ ] API endpoints respond
- [ ] Routing works for all pages

### 2. Performance Optimization
- [ ] Check Lighthouse scores
- [ ] Verify bundle size
- [ ] Test loading times

### 3. SEO & Social
- [ ] Update meta tags with correct URLs
- [ ] Test social media sharing
- [ ] Verify Open Graph images

### 4. Security
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Security headers are configured
- [ ] API rate limiting is active

## Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check environment variables are set
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **API Routes Not Working**
   - Verify `/api/[...path].ts` file is present
   - Check function logs in Vercel dashboard
   - Ensure CORS headers are set

3. **Environment Variables**
   - Use `VITE_` prefix for client-side variables
   - Server-side variables don't need the prefix
   - Redeploy after changing environment variables

4. **Routing Issues**
   - SPA routing is configured in vercel.json
   - All routes should fall back to index.html

## Advanced Configuration

### Custom Domain
1. Go to Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Preview Deployments
- Every push to non-main branches creates a preview deployment
- Perfect for testing features before production

### Analytics
- Enable Vercel Analytics in the dashboard
- Monitor performance and user behavior

## AI Engine Deployment (Optional)

The AI engine in the `ai-engine/` folder needs separate deployment:

1. **Option 1**: Deploy to Vercel as a separate project
2. **Option 2**: Use external services like Railway, Render, or AWS Lambda
3. Update `VITE_AI_ENGINE_URL` environment variable accordingly

## Support

For deployment issues:
- Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
- Review build logs in Vercel dashboard
- Check GitHub Actions for CI/CD issues