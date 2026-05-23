# Milo - Setup Checklist

## ✅ **Phase 1: Supabase Setup**
- [ ] **1.1** Create Supabase account at [supabase.com](https://supabase.com)
- [ ] **1.2** Create new project named "milo-app"
- [ ] **1.3** Save database password securely
- [ ] **1.4** Get credentials from Project Settings → API:
  - Project URL: `https://xxxxxxxx.supabase.co`
  - anon/public key: `eyJhbGci...`
  - service_role key: `eyJhbGci...`
- [ ] **1.5** Go to SQL Editor and run `supabase_setup.sql`
- [ ] **1.6** Verify tables were created

## ✅ **Phase 2: Environment Configuration**
- [ ] **2.1** Copy `.env.local.example` to `.env.local`
- [ ] **2.2** Update `.env.local` with your Supabase values:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_project_url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
  ```
- [ ] **2.3** (Optional) Get Mistral AI key at [mistral.ai](https://mistral.ai)
- [ ] **2.4** Add Mistral key to `.env.local`:
  ```
  MISTRAL_API_KEY=your_mistral_key
  ```

## ✅ **Phase 3: Test Connection**
- [ ] **3.1** Run test: `node test-supabase.js`
- [ ] **3.2** Fix any errors shown
- [ ] **3.3** Start app: `npm run dev`
- [ ] **3.4** Open http://localhost:3000

## ✅ **Phase 4: Verify Application**
- [ ] **4.1** Landing page loads
- [ ] **4.2** Onboarding form works (creates user in Supabase)
- [ ] **4.3** Chat interface works (with/without Mistral key)
- [ ] **4.4** Matches page shows data
- [ ] **4.5** Admin panel accessible (password: `milo-admin-2024`)

## 🔧 **Troubleshooting**

### **Supabase Connection Issues:**
1. **"JWT invalid" error**: Wrong API key - check Project Settings → API
2. **"relation does not exist"**: Tables not created - run `supabase_setup.sql`
3. **"permission denied"**: RLS policies - check SQL setup

### **Mistral AI Issues:**
1. **No API key**: Chat will use fallback responses
2. **Rate limit exceeded**: Free tier has limits - wait or upgrade
3. **Invalid key**: Get new key from mistral.ai dashboard

### **Application Issues:**
1. **"Cannot read properties"**: Check browser console for errors
2. **LocalStorage issues**: Clear browser cache or use incognito
3. **Port 3000 in use**: Change port: `npm run dev -- -p 3001`

## 🚀 **Quick Start Commands:**
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# Edit .env.local with your keys

# 3. Test Supabase
node test-supabase.js

# 4. Start development
npm run dev

# 5. Open browser
# http://localhost:3000
```

## 📞 **Need Help?**
- **Supabase Docs**: https://supabase.com/docs
- **Mistral AI Docs**: https://docs.mistral.ai
- **Next.js Docs**: https://nextjs.org/docs

## 🎯 **Success Indicators:**
- ✅ Users can sign up via onboarding
- ✅ Chat messages are stored in database
- ✅ Matches are generated based on user data
- ✅ Admin panel shows real statistics
- ✅ No hardcoded example users (uses real data)