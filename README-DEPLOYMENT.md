# Vercel Deployment Guide

This guide explains how to deploy the Blocklane Tenant Intake app to Vercel.

## Prerequisites

1. **GitHub Repository**: Ensure your code is pushed to GitHub
2. **Supabase Project**: Set up a Supabase project with authentication enabled
3. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Deployment Steps

### 1. Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Select the `blocklane-tree` directory if it's in a monorepo

### 2. Configure Build Settings

Vercel should auto-detect the Vite framework, but verify these settings:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables

In Vercel dashboard, go to Project Settings > Environment Variables and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_BACKEND=supabase
```

**Important**: 
- Get these values from your Supabase project dashboard
- Only add `VITE_` prefixed variables (client-side)
- Never add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (server-side only)

### 4. Supabase Configuration

In your Supabase dashboard:

1. **Authentication Settings**:
   - Enable "Email OTP" 
   - Set Site URL to your Vercel domain: `https://your-app.vercel.app`
   - Add redirect URLs if needed

2. **RLS Policies**: Ensure your database policies are properly configured

3. **Edge Functions** (if using): Deploy using Supabase CLI

### 5. Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Test the deployed application

## Troubleshooting

### Build Errors
- Check that all dependencies are in `package.json`
- Ensure TypeScript types are correct
- Verify import paths use `@/` alias correctly

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check Site URL matches your Vercel domain
- Ensure Email OTP is enabled in Supabase

### Environment Variables
- Only `VITE_` prefixed variables work in the browser
- Restart deployment after changing environment variables
- Check browser console for missing environment variable errors

## Files Added for Deployment

- `vercel.json`: Vercel configuration for SPA routing
- `.env.example`: Template for required environment variables
- This deployment guide

## Security Notes

- Never commit `.env` files to GitHub
- Use Vercel's environment variables for secrets
- Ensure Supabase RLS policies are properly configured
- Test authentication flow on the deployed site

## Post-Deployment Checklist

- [ ] Authentication works (OTP email sending/verification)
- [ ] Environment variables are set correctly
- [ ] Supabase connection is working
- [ ] All routes are accessible (SPA routing works)
- [ ] No console errors in production
- [ ] Mobile responsiveness works
