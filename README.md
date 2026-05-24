# Milo - AI-Powered Matchmaking Assistant

A production-grade chat-first AI product that helps users discover and get matched with relevant people based on information they submit. Built for the Lythe.ai full-stack developer interview challenge.

## Features

✅ **Public-facing web app** - Beautiful, responsive interface  
✅ **User onboarding flow** - Collects relevant profile information  
✅ **Local storage database** - Stores user data in browser localStorage  
✅ **Chat interface** - Powered by Mistral AI free model (optional)  
✅ **Matching experience** - AI-powered match suggestions  
✅ **Admin/internal view** - Monitor users and matches  
✅ **Deployable** - Ready for Vercel deployment (no database required)  

## Tech Stack

- **Frontend**: Next.js 15 (React) with TypeScript & Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: localStorage (browser storage) - no external database needed!
- **AI**: Mistral AI (free tier, optional)
- **Deployment**: Vercel (recommended)

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- (Optional) Mistral AI API key (free tier)

### 2. Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.local.example .env.local
   ```

2. Configure your environment variables in `.env.local`:

   ```env
   # Mistral AI Configuration (Optional)
   MISTRAL_API_KEY=your_mistral_api_key

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

   **Note**: No Supabase required! The app uses localStorage for data storage.

### 3. Installation & Running

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
│   ├── localStorageDb.ts  # localStorage-based database
│   └── mistral.ts         # Mistral AI client
└── public/                # Static assets
```

## API Endpoints

- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `POST /api/chat` - Chat with Milo (Mistral AI or fallback responses)
- `GET /api/matches` - Get user matches
- `POST /api/matches` - Generate new matches
- `GET /api/admin` - Admin dashboard data (protected)

## Deployment

### Environment Variables Setup

Before deploying, you can set the following environment variables in your deployment platform:

#### Optional Variables:
- `MISTRAL_API_KEY` - Your Mistral AI API key (from console.mistral.ai → API Keys)
- `NEXT_PUBLIC_APP_URL` - Your deployed app URL (e.g., `https://your-app.vercel.app`)

#### Important: No Supabase Required!
The app uses localStorage, so you don't need to set `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository
3. In project settings, go to **Environment Variables** and add optional variables
4. Deploy!

### Troubleshooting Deployment Errors

If you see this error: `"Invalid request: env.NEXT_PUBLIC_SUPABASE_URL should be string"`

1. **This means old Supabase configuration is still referenced**
2. **Solution**: The app no longer needs Supabase! It uses localStorage
3. **Remove** any references to `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from your deployment platform
4. **Redeploy** after removing these variables

### Other Platforms

The app is compatible with:
- **Render** - Use Node.js environment
- **Railway** - Use Node.js environment
- **Fly.io** - Use Docker deployment
- **Netlify** - Use Next.js build

## Testing the Application

1. **Landing Page** (`/`) - Overview and stats
2. **Onboarding** (`/onboarding`) - Create user profile (stored in localStorage)
3. **Chat** (`/chat`) - Talk to Milo AI assistant (works with or without API key)
4. **Matches** (`/matches`) - View and manage matches
5. **Admin** (`/admin`) - Internal view (password: `milo-admin-2024`)

## Key Features Implemented

### AI-Powered Chat
- Real-time conversation with Mistral AI (optional)
- Fallback responses when no API key is provided
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
- **Data stored in browser localStorage** - no database required!

### Admin Dashboard
- User and match monitoring
- System statistics
- Growth tracking

## Development Notes

- Uses localStorage for user data persistence (resets on browser clear)
- Mistral AI is optional - chat works with fallback responses
- No external database dependencies
- Easy to deploy on any platform

## License

Built for the Lythe.ai interview challenge. Not for commercial use.