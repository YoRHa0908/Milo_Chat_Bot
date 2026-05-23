# Milo Deployment Checklist

## Before Deployment

### 1. Get Your Supabase Credentials
- [ ] Go to [supabase.com](https://supabase.com) and log in
- [ ] Open your project dashboard
- [ ] Go to **Project Settings → API**
- [ ] Copy:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Get Your Mistral AI API Key (Optional)
- [ ] Go to [console.mistral.ai](https://console.mistral.ai)
- [ ] Sign up/log in
- [ ] Go to **API Keys**
- [ ] Create a new API key → `MISTRAL_API_KEY`

### 3. Choose Deployment Platform
- [ ] **Vercel** (Recommended): [vercel.com](https://vercel.com)
- [ ] **Netlify**: [netlify.com](https://netlify.com)
- [ ] **Render**: [render.com](https://render.com)
- [ ] **Railway**: [railway.app](https://railway.app)

## Deployment Steps

### For Vercel:
1. [ ] Push code to GitHub
2. [ ] Go to [vercel.com/new](https://vercel.com/new)
3. [ ] Import your GitHub repository
4. [ ] Click **Configure Project**
5. [ ] Set **Build Command**: `npm run build`
6. [ ] Set **Output Directory**: `.next`
7. [ ] Click **Environment Variables**
8. [ ] Add variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)
   - `MISTRAL_API_KEY` = (your Mistral API key) - Optional
   - `NEXT_PUBLIC_APP_URL` = `https://your-app.vercel.app`
9. [ ] Click **Deploy**

### For Netlify:
1. [ ] Push code to GitHub
2. [ ] Go to [app.netlify.com](https://app.netlify.com)
3. [ ] Click **Add new site → Import from Git**
4. [ ] Select your repository
5. [ ] Set **Build command**: `npm run build`
6. [ ] Set **Publish directory**: `out`
7. [ ] Click **Show advanced → New variable**
8. [ ] Add all environment variables
9. [ ] Click **Deploy site**

## Troubleshooting

### Error: "Invalid request: `env.NEXT_PUBLIC_SUPABASE_URL` should be string"
- [ ] Check if environment variables are set in deployment platform
- [ ] Verify Supabase URL is correct (ends with `.supabase.co`)
- [ ] Check for typos in variable names
- [ ] Redeploy after fixing variables

### Error: "Failed to fetch" or API errors
- [ ] Check browser console for specific errors
- [ ] Verify Supabase tables are created (run `supabase_setup.sql`)
- [ ] Check CORS settings in Supabase if needed

### Chat not working
- [ ] Check if `MISTRAL_API_KEY` is set
- [ ] Verify Mistral API key is valid
- [ ] Check rate limits on Mistral free tier

## Post-Deployment
- [ ] Test onboarding flow
- [ ] Test chat functionality
- [ ] Test match generation
- [ ] Test admin panel (password: `milo-admin-2024`)
- [ ] Check mobile responsiveness

## Security Notes
- Never commit `.env.local` to GitHub
- Use different Supabase projects for development and production
- Consider adding authentication for production use
- Monitor API usage and costs

## Support
If issues persist:
1. Check deployment platform logs
2. Check Supabase logs
3. Check browser console errors
4. Review environment variable configuration