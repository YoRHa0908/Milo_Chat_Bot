# Fix: Users Should Not Appear as Matches for Themselves

## Problem Analysis:

### Current Match Structure:
```
Match {
  id: string
  user_id: string        // User who initiated/getting the match
  matched_user_id: string // User being matched with
  match_score: number
  status: string
}
```

### The Issue:
When User A gets matches:
1. Match is created: `user_id = UserA`, `matched_user_id = UserB`
2. When displaying matches for UserA, we show `matched_user` (UserB) ✓
3. When displaying matches for UserB (if they get matches), we might show UserA as `matched_user` ✓

But there's a potential issue: If the match relationship is bidirectional, we need to ensure UserB doesn't see UserA as a match if UserA already matched with UserB.

## Root Causes:

1. **Match creation logic** might be creating duplicate/reverse matches
2. **Match display logic** might not filter out the current user correctly
3. **Database query** might return matches where user is either `user_id` OR `matched_user_id`

## The Fix:

### 1. Match Creation (POST /api/matches):
- Already excludes current user from `potentialMatches`
- Creates match: `currentUser → matchedUser`
- Should NOT create reverse match: `matchedUser → currentUser`

### 2. Match Retrieval (GET /api/matches):
- Gets matches where user is either `user_id` OR `matched_user_id`
- Needs to identify the "other user" correctly
- Should filter out any matches where "other user" is the current user (safety check)

### 3. Chat Sidebar Display:
- Should filter out any matches where `matched_user_id === currentUserId`
- Should display `matched_user` name (not current user)

## Implementation:

### Fixed in matches API GET:
```typescript
const otherUserId = match.user_id === userId ? match.matched_user_id : match.user_id
const matchedUser = db.users.getById(otherUserId)
```

### Fixed in chat sidebar:
```typescript
.filter(match => {
  // Safety check: Don't show matches where matched user is the current user
  if (match.matched_user_id === userId) {
    console.warn('Filtered out self-match:', match)
    return false
  }
  return true
})
```

### Fixed in database matches.create:
```typescript
// Prevent users from matching with themselves
if (userId === matchedUserId) {
  console.error('CRITICAL ERROR: Attempted to create self-match')
  throw new Error('Cannot create match with yourself')
}
```

## Verification:

1. **User creates profile** → Should be saved to database
2. **User gets matches** → Should see other users (not themselves)
3. **Match scores** → Calculated based on shared interests
4. **Admin page** → Should show all users and matches

## Expected Behavior:
- User A creates profile
- User A gets matches → Sees User B, User C (not User A)
- User B gets matches → Sees User A, User C (not User B)
- No user ever sees themselves as a match