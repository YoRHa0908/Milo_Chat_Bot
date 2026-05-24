# PostgreSQL Database Setup Guide

This guide explains how to set up PostgreSQL for the Milo application.

## Option 1: Local PostgreSQL (Development)

### 1. Install PostgreSQL

#### Windows:
1. Download from [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set during installation
4. PostgreSQL will run as a service on port 5432

#### macOS:
```bash
# Using Homebrew
brew install postgresql@16
brew services start postgresql@16

# Or using Postgres.app
# Download from: https://postgresapp.com/
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE milo_db;

# Create user (optional, you can use postgres user)
CREATE USER milo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE milo_db TO milo_user;

# Exit
\q
```

### 3. Update Environment Variables

In `.env.local`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/milo_db
```

## Option 2: Cloud PostgreSQL Providers (Production)

### 1. Vercel Postgres (Recommended for Vercel deployment)

1. Go to your Vercel project
2. Click **Storage** → **Create Database** → **PostgreSQL**
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

### 2. Neon (Free Tier Available)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add as `DATABASE_URL` environment variable

### 3. Supabase (Free Tier Available)

1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **Database** → **Connection string**
4. Copy the connection string (use the pooled connection for better performance)
5. Add as `DATABASE_URL` environment variable

### 4. Railway (Free Tier Available)

1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add **PostgreSQL** service
4. Copy the connection string
5. Add as `DATABASE_URL` environment variable

## Option 3: Docker (Development)

### 1. Run PostgreSQL with Docker

```bash
# Create a Docker container
docker run --name milo-postgres \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=milo_db \
  -p 5432:5432 \
  -d postgres:16

# Check if it's running
docker ps
```

### 2. Update Environment Variables

In `.env.local`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/milo_db
```

## Testing the Connection

### 1. Run the test script:

```bash
# Set DATABASE_URL first
export DATABASE_URL=postgresql://postgres:your_password@localhost:5432/milo_db

# Run test
node test-postgres.js
```

### 2. Expected output:
```
Testing PostgreSQL connection...
Connection string: postgresql://postgres:****@localhost:5432/milo_db
✓ Connected to PostgreSQL successfully
✓ PostgreSQL version: PostgreSQL 16.0
✓ Created test_users table
✓ Inserted test data
✓ Retrieved test data: 1 rows
✓ Cleaned up test table

✅ All PostgreSQL tests passed!
```

## Troubleshooting

### 1. Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Make sure PostgreSQL is running:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list                # macOS
# Windows: Check Services (services.msc) for "postgresql"
```

### 2. Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution**: Check your password in the connection string.

### 3. Database Doesn't Exist
```
Error: database "milo_db" does not exist
```
**Solution**: Create the database:
```bash
createdb milo_db
# Or via psql:
psql -U postgres -c "CREATE DATABASE milo_db;"
```

### 4. SSL/TLS Issues
```
Error: no pg_hba.conf entry for host
```
**Solution**: For local development, you can disable SSL in the connection:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/milo_db?sslmode=disable
```

## Environment Variables for Deployment

### Vercel:
1. Go to **Project Settings** → **Environment Variables**
2. Add `DATABASE_URL` with your PostgreSQL connection string
3. Deploy

### Other Platforms:
- Add `DATABASE_URL` to your platform's environment variables
- Make sure the database is accessible from the platform's network

## Database Schema

The application automatically creates these tables on first run:

1. **users** - User profiles
2. **chat_sessions** - Chat sessions
3. **chat_messages** - Chat messages
4. **matches** - User matches

The schema includes:
- Proper indexes for performance
- Foreign key constraints
- JSONB columns for arrays (interests, looking_for)
- Timestamps for all records
- Self-match prevention constraint

## Migration from localStorage

The application includes a fallback to localStorage if PostgreSQL is not available, but for production use, PostgreSQL is required for:
- Data persistence across sessions
- Multi-user support
- Scalability
- Backup and recovery