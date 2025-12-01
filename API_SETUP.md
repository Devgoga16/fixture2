# API Integration Setup

## Overview

This frontend application is designed to work with a backend API server that manages tournament data, teams, matches, and results.

## Configuration

### 1. Set the API Base URL

The API base URL is configured via environment variables. You have two options:

#### Option A: Using `.env.local` (Recommended for Development)

Create or edit the `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

Change the URL to match your backend API server:
- **Local development**: `http://localhost:3000/api`
- **Production**: `https://api.example.com/api`
- **Docker container**: `http://backend-service:3000/api`

#### Option B: Using `client/config/api.ts`

Edit `client/config/api.ts` directly (not recommended for production):

```typescript
export const API_BASE_URL = "http://localhost:3000/api";
```

## API Endpoints

The application expects the following endpoints on your backend:

### 1. Create Tournament
```
POST /api/tournaments
```

**Request Body:**
```json
{
  "name": "Tournament Name",
  "teams": [
    { "name": "Team A" },
    { "name": "Team B" },
    ...
  ]
}
```

**Response:**
```json
{
  "id": "tournament-uuid",
  "name": "Tournament Name",
  "status": "draft",
  "total_teams": 8,
  "teams": [
    { "id": "team-uuid-1", "name": "Team A" },
    { "id": "team-uuid-2", "name": "Team B" },
    ...
  ],
  "bracket": {
    "totalTeams": 8,
    "rounds": [
      [
        {
          "id": "match-0-0",
          "round": 0,
          "position": 0,
          "team1": { "id": "team-uuid-1", "name": "Team A" },
          "team2": { "id": "team-uuid-2", "name": "Team B" },
          "score1": null,
          "score2": null,
          "winner": null,
          "completed": false
        },
        ...
      ],
      ...
    ]
  },
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 2. Get Tournament
```
GET /api/tournaments/:id
```

Returns the same structure as Create Tournament response.

### 3. Update Match Result
```
PUT /api/tournaments/:id/matches/:matchId
```

**Request Body:**
```json
{
  "score1": 3,
  "score2": 2
}
```

**Response:**
```json
{
  "bracket": { ... },
  "match": {
    "id": "match-uuid",
    "round": 0,
    "position": 0,
    "team1": { ... },
    "team2": { ... },
    "score1": 3,
    "score2": 2,
    "winner": { ... },
    "completed": true
  }
}
```

### 4. Reset Tournament
```
POST /api/tournaments/:id/reset
```

Clears all match results and resets the tournament to initial state.

**Response:** Same as Get Tournament response.

### 5. List Tournaments
```
GET /api/tournaments
```

**Response:**
```json
[
  { ... },
  { ... }
]
```

### 6. Delete Tournament
```
DELETE /api/tournaments/:id
```

## Database Schema

Required tables for your backend:

```sql
-- Tournaments Table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  status VARCHAR(50), -- 'draft', 'in_progress', 'completed'
  total_teams INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  tournament_id UUID FOREIGN KEY REFERENCES tournaments(id),
  name VARCHAR(255),
  position INTEGER,
  created_at TIMESTAMP
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  tournament_id UUID FOREIGN KEY REFERENCES tournaments(id),
  round INTEGER, -- -1 for preliminary, 0+, for main rounds
  position INTEGER,
  team1_id UUID FOREIGN KEY REFERENCES teams(id),
  team2_id UUID FOREIGN KEY REFERENCES teams(id),
  score1 INTEGER,
  score2 INTEGER,
  winner_id UUID FOREIGN KEY REFERENCES teams(id),
  completed BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Frontend Architecture

### API Services

All API calls are handled through the service layer in `client/services/`:

- **`client/services/tournament.ts`**: Tournament CRUD operations and match result updates
- **`client/config/api.ts`**: Centralized API configuration and HTTP client

### Usage in Components

Components use React hooks and the tournament service:

```typescript
import { createTournament, updateMatchResult } from "@/services/tournament";
import { useToast } from "@/hooks/use-toast";

// Create a tournament
const data = await createTournament({
  name: "My Tournament",
  teams: [{ name: "Team 1" }, { name: "Team 2" }]
});

// Update a match result
const result = await updateMatchResult(tournamentId, matchId, {
  score1: 3,
  score2: 2
});
```

## Testing the Connection

1. Start your backend server (should be running on `http://localhost:3000`)
2. Start the frontend dev server: `npm run dev`
3. Create a new tournament with a few teams
4. Check your browser's Network tab to verify API calls are reaching the correct URL
5. Check your backend logs to ensure requests are being received

## Error Handling

The frontend handles API errors gracefully:

- **Network errors**: Show toast notification
- **Validation errors**: Display error message from backend
- **Server errors (5xx)**: Display generic error message

All errors show user-friendly messages via the toast notification system.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:3000/api` | Base URL for your backend API |

## Troubleshooting

### "API Error: 404"
- Verify your backend is running on the correct port
- Check that `VITE_API_URL` environment variable is set correctly
- Ensure the endpoint paths match your backend implementation

### "API Error: 500"
- Check backend server logs for errors
- Verify database connection is working
- Check that all required tables exist

### CORS Errors
- Ensure your backend has CORS headers configured correctly
- The frontend should be able to make requests to your API URL

### Connection Timeout
- Verify backend server is running and accessible
- Check firewall/network settings
- Try accessing the API URL directly in your browser

## Next Steps

1. Implement your backend API following the endpoints and schema described above
2. Set `VITE_API_URL` to your backend URL
3. Test the application by creating a tournament and recording results
4. Deploy backend and frontend to production servers
