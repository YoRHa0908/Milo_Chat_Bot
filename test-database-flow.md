# Database Flow Test

## The Question:
**"Does the user who created the profile not get entered into the database?"**

## Current Flow:

### 1. Onboarding Page (`app/onboarding/page.tsx`)
```typescript
// Sends POST request to /api/users
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
})
```

### 2. Users API (`app/api/users/route.ts`)
```typescript
// Calls database create function
const user = db.users.create({
  name: body.name,
  email: body.email || null,
  // ... other fields
})
```

### 3. Database (`lib/localStorageDb.ts`)
```typescript
create: (userData): UserProfile => {
  const users = loadData<UserProfile>('milo_users', [])
  const newUser: UserProfile = {
    id: generateId(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...userData
  }
  users.push(newUser)
  saveData('milo_users', users)  // ← THIS IS THE CRITICAL PART
  return newUser
}
```

### 4. Save Data Function
```typescript
const saveData = <T>(key: string, data: T[]) => {
  if (typeof window === 'undefined') {
    // Server-side: save to in-memory storage
    serverData[key] = data
    return
  }
  
  // Client-side: save to localStorage
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
  }
}
```

## THE POTENTIAL ISSUE:

When the **API route runs on the server** (Vercel serverless function):
- `typeof window === 'undefined'` is TRUE
- Data is saved to `serverData` (in-memory)
- **Server memory resets** when the serverless function stops!

When the **chat page runs in the browser**:
- `typeof window === 'undefined'` is FALSE  
- It tries to load from `localStorage`
- **But the user was saved to server memory, not localStorage!**

## The Mismatch:
1. **User created via API** → Saved to **server memory**
2. **Chat page loads users** → Looks in **browser localStorage**
3. **Result**: User appears to be "missing"

## How to Test This:

### Test 1: Check localStorage
```javascript
// In browser console
console.log('Users in localStorage:', JSON.parse(localStorage.getItem('milo_users') || '[]'))
```

### Test 2: Check API directly
```bash
# Get all users via API
curl http://localhost:3000/api/users
```

### Test 3: Check admin page
Visit `/admin` with password `milo-admin-2024`

## Possible Solutions:

1. **Fix the database to sync between server and client** (complex)
2. **Always create users in browser localStorage** (simpler)
3. **Use a real database** (Supabase, PostgreSQL, etc.)

## Current Status:
The user **IS being saved**, but possibly to the wrong storage location (server memory instead of browser localStorage), making them appear "missing" when viewed from the browser.