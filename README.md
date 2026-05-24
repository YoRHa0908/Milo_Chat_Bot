# Milo - AI-Powered Matchmaking Assistant

A production-grade chat-first AI product that helps users discover and get matched with relevant people based on information they submit. Built for the Lythe.ai full-stack developer interview challenge.

## Features

✅ **Public-facing web app** - Beautiful, responsive interface  
✅ **User onboarding flow** - Collects relevant profile information  
✅ **PostgreSQL Database** - Persistent data storage with PostgreSQL  
✅ **Chat interface** - Powered by Mistral AI free model (optional)  
✅ **Matching experience** - AI-powered match suggestions  
✅ **Admin/internal view** - Monitor users and matches  
✅ **Deployable** - Ready for Vercel deployment with PostgreSQL  

## Tech Stack

- **Frontend**: Next.js 15 (React) with TypeScript & Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (persistent storage) with localStorage fallback
- **AI**: Mistral AI (free tier, optional)
- **Deployment**: Vercel (recommended) with PostgreSQL add-on

## Getting Started

### 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)
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

   # PostgreSQL Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/milo_db
   ```

   **Note**: The app now uses PostgreSQL for persistent data storage.

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
│   ├── localStorageDb.ts  # Database interface (PostgreSQL with localStorage fallback)
│   ├── postgresDb.ts      # PostgreSQL database implementation
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

Before deploying, you must set the following environment variables in your deployment platform:

#### Required Variables:
- `DATABASE_URL` - PostgreSQL database connection string

#### Optional Variables:
- `MISTRAL_API_KEY` - Your Mistral AI API key (from console.mistral.ai → API Keys)
- `NEXT_PUBLIC_APP_URL` - Your deployed app URL (e.g., `https://your-app.vercel.app`)

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository
3. Add a PostgreSQL database:
   - Go to **Storage** → **Create Database** → **PostgreSQL**
   - Or use an external PostgreSQL provider (Neon, Supabase, Railway, etc.)
4. In project settings, go to **Environment Variables** and add:
   - `DATABASE_URL` - Your PostgreSQL connection string
   - Optional: `MISTRAL_API_KEY` and `NEXT_PUBLIC_APP_URL`
5. Deploy!

### Setting Up PostgreSQL Database

You can use any PostgreSQL provider:

1. **Vercel Postgres** (integrated)
2. **Neon** (neon.tech) - Free tier available
3. **Supabase** (supabase.com) - Free tier available
4. **Railway** (railway.app) - Free tier available
5. **Local PostgreSQL** - For development

### Other Platforms

The app is compatible with:
- **Render** - Use Node.js environment with PostgreSQL add-on
- **Railway** - Use Node.js environment with PostgreSQL
- **Fly.io** - Use Docker deployment with PostgreSQL
- **Netlify** - Use Next.js build with external PostgreSQL

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
- **Self-match prevention** - Users cannot match with themselves

### User Management
- Complete onboarding flow
- Profile creation and editing
- Interest-based matching preferences
- **Data stored in PostgreSQL** - persistent storage across sessions

### Admin Dashboard
- User and match monitoring
- System statistics
- Growth tracking

## Development Notes

- Uses PostgreSQL for persistent data storage with localStorage fallback
- Mistral AI is optional - chat works with fallback responses
- Self-match prevention at multiple levels (database, API, UI)
- Easy to deploy on any platform with PostgreSQL support

## License

Built for the Lythe.ai interview challenge. Not for commercial use.