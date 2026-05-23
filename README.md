# Milo - AI-Powered Matchmaking Assistant

A production-grade chat-first AI product that helps users discover and get matched with relevant people based on information they submit. Built for the Lythe.ai full-stack developer interview challenge.

## Features

✅ **Public-facing web app** - Beautiful, responsive interface  
✅ **User onboarding flow** - Collects relevant profile information  
✅ **Database integration** - Stores real user data (Supabase)  
✅ **Chat interface** - Powered by Mistral AI free model  
✅ **Matching experience** - AI-powered match suggestions  
✅ **Admin/internal view** - Monitor users and matches  
✅ **Deployable** - Ready for Vercel deployment  

## Tech Stack

- **Frontend**: Next.js 15 (React) with TypeScript & Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Mistral AI (free tier)
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Mistral AI API key (free tier)

### 2. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Configure your environment variables in `.env.local`:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Mistral AI Configuration
   MISTRAL_API_KEY=your_mistral_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase_schema.sql` in the Supabase SQL editor
3. Get your project URL and anon key from Supabase settings → API

### 4. Mistral AI Setup

1. Sign up at [mistral.ai](https://mistral.ai)
2. Get your API key from the dashboard
3. Add it to your `.env.local` file

### 5. Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
milo-app/
├── app/                    # Next.js app router
│   ├── api/               # API routes
│   │   ├── users/         # User management
│   │   ├── chat/          # Chat with Mistral AI
│   │   ├── matches/       # Match generation
│   │   └── admin/         # Admin endpoints
│   ├── onboarding/        # User onboarding page
│   ├── chat/              # Chat interface
│   ├── matches/           # Matches view
│   ├── admin/             # Admin panel
│   └── page.tsx           # Landing page
├── lib/                   # Shared utilities
│   ├── supabase.ts        # Supabase client
│   └── mistral.ts         # Mistral AI client
├── public/                # Static assets
└── supabase_schema.sql    # Database schema
```

## API Endpoints

- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `POST /api/chat` - Chat with Milo (Mistral AI)
- `GET /api/matches` - Get user matches
- `POST /api/matches` - Generate new matches
- `GET /api/admin` - Admin dashboard data (protected)

## Deployment

### Environment Variables Setup

Before deploying, you MUST set the following environment variables in your deployment platform:

#### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (from Supabase Dashboard → Project Settings → API)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key (from same location)

#### Optional but Recommended:
- `MISTRAL_API_KEY` - Your Mistral AI API key (from console.mistral.ai → API Keys)
- `NEXT_PUBLIC_APP_URL` - Your deployed app URL (e.g., `https://your-app.vercel.app`)

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository
3. In project settings, go to **Environment Variables** and add all required variables
4. Deploy!

### Troubleshooting Deployment Errors

If you see this error: `"Invalid request: env.NEXT_PUBLIC_SUPABASE_URL should be string"`

1. **Check your environment variables** in your deployment platform
2. **Verify Supabase credentials** are correct:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings → API
   - Copy the exact "Project URL" and "anon/public" key
3. **Redeploy** after updating environment variables

### Other Platforms

The app is compatible with:
- **Render** - Use Node.js environment, add environment variables in Dashboard → Environment
- **Railway** - Use Node.js + PostgreSQL, add variables in Project → Variables
- **Fly.io** - Use Docker deployment, set variables with `fly secrets set`
- **Netlify** - Use Next.js build, add variables in Site Settings → Environment variables

## Testing the Application

1. **Landing Page** (`/`) - Overview and stats
2. **Onboarding** (`/onboarding`) - Create user profile
3. **Chat** (`/chat`) - Talk to Milo AI assistant
4. **Matches** (`/matches`) - View and manage matches
5. **Admin** (`/admin`) - Internal view (password: `milo-admin-2024`)

## Key Features Implemented

### AI-Powered Chat
- Real-time conversation with Mistral AI
- Context-aware responses based on user profile
- Session management and history

### Smart Matching
- AI analyzes conversations for compatibility
- Match suggestions based on shared interests
- Match scoring and status management

### User Management
- Complete onboarding flow
- Profile creation and editing
- Interest-based matching preferences

### Admin Dashboard
- User and match monitoring
- System statistics
- Growth tracking

## Development Notes

- Uses localStorage for user session (demo purposes)
- In production, implement proper authentication
- Mistral AI free tier has rate limits
- Supabase free tier is sufficient for MVP

## License

Built for the Lythe.ai interview challenge. Not for commercial use.