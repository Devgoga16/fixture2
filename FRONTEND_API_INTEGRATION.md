# Frontend API Integration Guide

## Overview

This document explains how the frontend is structured to integrate with your backend API and how to configure it to point to your backend server.

## Quick Start

### 1. Set Your Backend URL

Edit `.env.local` in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Change this to match your backend server:
- Local: `http://localhost:3000/api`
- Production: `https://api.yourcompany.com/api`
- Docker: `http://backend-service:3000/api`

That's it! The frontend will now use this URL for all API requests.

## Architecture

### Files Structure

```
client/
├── config/
│   └── api.ts                 # Centralized API configuration
├── services/
│   └── tournament.ts          # API service functions
├── components/
│   ├── TournamentSetup.tsx    # Create tournament form
│   └── TournamentDashboard.tsx # Tournament view & updates
└── pages/
    └── Index.tsx              # Main app router

shared/
└── api.ts                     # Shared types (used by client & server)
```

### Configuration: `client/config/api.ts`

This file is the **single point of configuration** for all API requests:

```typescript
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function apiCall<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Makes HTTP requests to API_BASE_URL + endpoint
  // Handles JSON serialization, headers, error handling
}
```

**Key Features:**
- ✅ Reads from `VITE_API_URL` environment variable
- ✅ Falls back to `http://localhost:3000/api` if not set
- ✅ Generic `apiCall<T>()` function for type-safe requests
- ✅ Automatic JSON headers and error handling

### Services: `client/services/tournament.ts`

All API operations are defined here:

```typescript
// Create a tournament
await createTournament({ name: "My Tournament", teams: [...] })

// Get a tournament
await getTournament(tournamentId)

// Update a match result
await updateMatchResult(tournamentId, matchId, { score1, score2 })

// Reset tournament
await resetTournament(tournamentId)

// List tournaments
await listTournaments()

// Delete tournament
await deleteTournament(tournamentId)
```

Each function:
- Uses `apiCall()` from the config
- Automatically adds `/api` prefix
- Returns type-safe responses
- Handles errors with meaningful messages

### Components Integration

#### `TournamentSetup.tsx` - Creating Tournaments

```typescript
const handleStart = async () => {
  try {
    // Calls API to create tournament
    const tournamentData = await createTournament({
      name: `Torneo ${new Date().toLocaleDateString()}`,
      teams: teams.map((t) => ({ name: t.name })),
    });
    
    // Passes data to parent component
    onTournamentStart(teams, teamCount, tournamentData);
  } catch (error) {
    // Shows error toast notification
    toast({ title: "Error", description: error.message });
  }
};
```

#### `TournamentDashboard.tsx` - Updating Matches

```typescript
const handleSaveResult = async (score1: number, score2: number) => {
  try {
    // Calls API to update match result
    const response = await updateMatchResult(
      tournamentId,
      selectedMatch.id,
      { score1, score2 },
    );
    
    // Updates local state with new bracket
    setBracket(response.bracket);
    onBracketUpdate(response.bracket);
  } catch (error) {
    toast({ title: "Error", description: error.message });
  }
};
```

#### `Index.tsx` - State Management

```typescript
export default function Index() {
  const [tournament, setTournament] = useState<{
    id: string;           // Tournament ID from backend
    bracket: Bracket;     // Current bracket state
    teams: Team[];
    size: number;
  } | null>(null);

  // Receives tournament data from API
  const handleTournamentStart = (teams, size, tournamentData) => {
    setTournament({
      id: tournamentData.id,           // ← From backend
      bracket: tournamentData.bracket, // ← From backend
      teams,
      size,
    });
  };

  // Updates bracket when matches are saved
  const handleBracketUpdate = (bracket: Bracket) => {
    setTournament({ ...tournament, bracket });
  };
}
```

## Data Flow

### Creating a Tournament

```
User fills form & clicks "Iniciar Torneo"
           ↓
TournamentSetup.handleStart()
           ↓
createTournament() [API call]
           ↓
POST /api/tournaments
           ↓
Backend: Create tournament in DB, generate bracket
           ↓
Backend responds: { id, name, teams, bracket, ... }
           ↓
TournamentSetup passes to onTournamentStart()
           ↓
Index.tsx stores tournament state
           ↓
TournamentDashboard renders with tournament data
```

### Updating a Match Result

```
User clicks match & enters scores
           ↓
MatchResultDialog.onSave(score1, score2)
           ↓
TournamentDashboard.handleSaveResult()
           ↓
updateMatchResult() [API call]
           ↓
PUT /api/tournaments/:id/matches/:matchId
           ↓
Backend: Update scores, determine winner, propagate to next round
           ↓
Backend responds: { bracket, match }
           ↓
TournamentDashboard.setBracket(response.bracket)
           ↓
BracketDisplay re-renders with updated matches
```

## Shared Types

Types are defined once in `shared/api.ts` and used by both client and server:

```typescript
// shared/api.ts
export interface Team {
  id: string;
  name: string;
}

export interface TournamentData {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed';
  total_teams: number;
  teams: Team[];
  bracket: Bracket;
  created_at: string;
  updated_at: string;
}

// client/services/tournament.ts
import type { TournamentData } from "@shared/api";

export async function getTournament(id: string): Promise<TournamentData> {
  return apiCall<TournamentData>(`/tournaments/${id}`);
}
```

**Benefits:**
- ✅ Single source of truth for types
- ✅ Type safety across client-server boundary
- ✅ Easy to keep in sync during changes
- ✅ Backend can import same types

## Error Handling

All API errors show user-friendly toast notifications:

```typescript
try {
  const data = await createTournament(...);
} catch (error) {
  // Error object has message from backend or generic error
  toast({
    title: "Error",
    description: error instanceof Error 
      ? error.message 
      : "Something went wrong",
    variant: "destructive",
  });
}
```

## Environment Variables

### Development

Create `.env.local`:
```env
VITE_API_URL=http://localhost:3000/api
```

### Production

Set environment variable when deploying:
```bash
# Docker
docker run -e VITE_API_URL=https://api.example.com/api ...

# Vercel
vercel env add VITE_API_URL

# Netlify
# Set in Build & Deploy settings → Environment
```

## Testing API Integration

### 1. Verify Configuration

Open DevTools Console:
```javascript
console.log(import.meta.env.VITE_API_URL)
// Should output: http://localhost:3000/api
```

### 2. Test API Call

```javascript
// In browser console
fetch('http://localhost:3000/api/tournaments')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 3. Monitor Network Requests

- Open DevTools → Network tab
- Create a tournament or update a match
- Verify requests go to correct URL
- Check response status and data

## Common Issues

### API calls fail with 404

**Problem:** `API Error: 404`

**Solutions:**
1. Check `VITE_API_URL` is set correctly: `.env.local`
2. Verify backend server is running on the port
3. Ensure endpoint paths match backend implementation

### CORS errors

**Problem:** "No 'Access-Control-Allow-Origin' header"

**Solutions:**
1. Backend must include CORS headers:
   ```javascript
   app.use(cors());
   ```
2. Or for specific origin:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }));
   ```

### Connection refused

**Problem:** "Failed to fetch" or "Connection refused"

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000/api/health`
2. Check firewall/network settings
3. Verify `VITE_API_URL` protocol (http vs https)
4. Check for network proxy/VPN issues

### Timeout errors

**Problem:** Request hangs and times out

**Solutions:**
1. Verify backend responds quickly
2. Check for infinite loops in backend
3. Increase fetch timeout if needed
4. Check server logs for errors

## Adding New API Operations

### 1. Add endpoint to service

```typescript
// client/services/tournament.ts
export async function myNewOperation(param: string): Promise<MyResult> {
  return apiCall<MyResult>(`/tournaments/${param}`, {
    method: "POST",
    body: JSON.stringify({ ... }),
  });
}
```

### 2. Use in component

```typescript
import { myNewOperation } from "@/services/tournament";

const handleClick = async () => {
  try {
    const result = await myNewOperation("value");
    // Use result
  } catch (error) {
    toast({ title: "Error", description: error.message });
  }
};
```

### 3. Backend implements endpoint

Implement matching route in your backend.

## Performance Considerations

- **Caching**: Consider adding React Query to cache tournament data
- **Real-time**: Consider WebSockets for live updates if multiple users
- **Pagination**: Add pagination for listing tournaments if many
- **Debouncing**: Add debounce for frequent API calls

## Security Notes

- ✅ Never commit API keys to repository
- ✅ Use HTTPS in production
- ✅ Validate all inputs on backend
- ✅ Implement authentication if needed
- ✅ Use environment variables for secrets

## Next Steps

1. **Set `VITE_API_URL`** in `.env.local`
2. **Implement backend** following `BACKEND_IMPLEMENTATION_EXAMPLE.md`
3. **Test API** with browser DevTools
4. **Add authentication** if needed
5. **Deploy** to production servers
