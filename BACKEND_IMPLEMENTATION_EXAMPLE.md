# Backend Implementation Example

This document provides a complete example implementation of the API endpoints in Node.js with Express. You can use this as a reference for implementing the API in your preferred backend technology.

## Prerequisites

```bash
npm install express cors uuid
npm install -D typescript ts-node @types/node @types/express
```

## Database Models

First, define the database models/types (TypeScript):

```typescript
// src/types/index.ts
export interface Team {
  id: string;
  name: string;
}

export interface Match {
  id: string;
  round: number;
  position: number;
  team1: Team | null;
  team2: Team | null;
  score1: number | null;
  score2: number | null;
  winner: Team | null;
  completed: boolean;
}

export interface Bracket {
  rounds: Match[][];
  totalTeams: number;
}

export interface Tournament {
  id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed';
  total_teams: number;
  teams: Team[];
  bracket: Bracket;
  created_at: string;
  updated_at: string;
}

export interface CreateTournamentRequest {
  name: string;
  teams: Array<{ name: string }>;
}

export interface UpdateMatchRequest {
  score1: number;
  score2: number;
}
```

## Tournament Service

Create a service to handle tournament logic:

```typescript
// src/services/tournamentService.ts
import { v4 as uuidv4 } from 'uuid';
import {
  Tournament,
  Team,
  Match,
  Bracket,
  CreateTournamentRequest,
  UpdateMatchRequest,
} from '../types';

// In-memory storage (replace with database)
const tournaments = new Map<string, Tournament>();

function largestPowerOf2LessThanOrEqual(n: number): number {
  if (n < 1) return 1;
  let power = 1;
  while (power * 2 <= n) {
    power *= 2;
  }
  return power;
}

function calculatePreliminaryRound(teamCount: number): {
  preliminaryMatches: number;
  byes: number;
} {
  if (teamCount <= 0) {
    return { preliminaryMatches: 0, byes: 0 };
  }

  let largestPowerBelow = 1;
  while (largestPowerBelow * 2 <= teamCount) {
    largestPowerBelow *= 2;
  }

  const mainBracketSize = largestPowerBelow;

  if (teamCount <= mainBracketSize) {
    return { preliminaryMatches: 0, byes: 0 };
  }

  const extraTeams = teamCount - mainBracketSize;
  const preliminaryMatches = Math.ceil(extraTeams / 2);
  const byes = extraTeams % 2;

  return { preliminaryMatches, byes };
}

function generateBracket(teams: Team[]): Bracket {
  const teamCount = teams.length;
  const rounds: Match[][] = [];
  const preliminary = calculatePreliminaryRound(teamCount);

  if (preliminary.preliminaryMatches > 0) {
    // Generate preliminary round
    const prelimRound: Match[] = [];
    for (let i = 0; i < preliminary.preliminaryMatches; i++) {
      prelimRound.push({
        id: `prelim-${i}`,
        round: -1,
        position: i,
        team1: teams[i * 2],
        team2: teams[i * 2 + 1],
        score1: null,
        score2: null,
        winner: null,
        completed: false,
      });
    }
    rounds.push(prelimRound);

    // Build first round of main bracket
    const mainBracketSize = largestPowerOf2LessThanOrEqual(teamCount);
    const firstRoundMatches: Match[] = [];
    let matchPosition = 0;
    let prelimWinnerIndex = 0;
    let nonPrelimTeamIndex = preliminary.preliminaryMatches * 2;

    for (let i = 0; i < mainBracketSize / 2; i++) {
      let team1: Team | null = null;
      let team2: Team | null = null;

      if (prelimWinnerIndex < preliminary.preliminaryMatches) {
        team1 = null;
        prelimWinnerIndex++;
      } else if (nonPrelimTeamIndex < teamCount) {
        team1 = teams[nonPrelimTeamIndex];
        nonPrelimTeamIndex++;
      }

      if (prelimWinnerIndex < preliminary.preliminaryMatches) {
        team2 = null;
        prelimWinnerIndex++;
      } else if (nonPrelimTeamIndex < teamCount) {
        team2 = teams[nonPrelimTeamIndex];
        nonPrelimTeamIndex++;
      }

      firstRoundMatches.push({
        id: `match-0-${matchPosition}`,
        round: 0,
        position: matchPosition,
        team1,
        team2,
        score1: null,
        score2: null,
        winner: null,
        completed: false,
      });
      matchPosition++;
    }

    rounds.push(firstRoundMatches);

    // Generate remaining rounds
    let currentRoundTeams = Array(firstRoundMatches.length).fill(null);
    let roundNum = 1;

    while (currentRoundTeams.length > 1) {
      const round: Match[] = [];
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        round.push({
          id: `match-${roundNum}-${i / 2}`,
          round: roundNum,
          position: Math.floor(i / 2),
          team1: currentRoundTeams[i],
          team2: currentRoundTeams[i + 1],
          score1: null,
          score2: null,
          winner: null,
          completed: false,
        });
      }
      rounds.push(round);
      currentRoundTeams = Array(round.length).fill(null);
      roundNum++;
    }
  } else {
    // No preliminary round
    let currentRoundTeams = teams;
    let roundNum = 0;

    while (currentRoundTeams.length > 1) {
      const round: Match[] = [];
      for (let i = 0; i < currentRoundTeams.length; i += 2) {
        round.push({
          id: `match-${roundNum}-${i / 2}`,
          round: roundNum,
          position: Math.floor(i / 2),
          team1: currentRoundTeams[i],
          team2: currentRoundTeams[i + 1],
          score1: null,
          score2: null,
          winner: null,
          completed: false,
        });
      }
      rounds.push(round);
      currentRoundTeams = Array(round.length).fill(null);
      roundNum++;
    }
  }

  return { rounds, totalTeams: teamCount };
}

export class TournamentService {
  static createTournament(data: CreateTournamentRequest): Tournament {
    const id = uuidv4();
    const teams: Team[] = data.teams.map((t, idx) => ({
      id: uuidv4(),
      name: t.name,
    }));

    const bracket = generateBracket(teams);

    const tournament: Tournament = {
      id,
      name: data.name,
      status: 'draft',
      total_teams: teams.length,
      teams,
      bracket,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    tournaments.set(id, tournament);
    return tournament;
  }

  static getTournament(id: string): Tournament | null {
    return tournaments.get(id) || null;
  }

  static listTournaments(): Tournament[] {
    return Array.from(tournaments.values());
  }

  static updateMatchResult(
    tournamentId: string,
    matchId: string,
    data: UpdateMatchRequest,
  ): { bracket: Bracket; match: Match } | null {
    const tournament = tournaments.get(tournamentId);
    if (!tournament) return null;

    let targetMatch: Match | null = null;
    let roundIndex = -1;
    let matchIndex = -1;

    for (let r = 0; r < tournament.bracket.rounds.length; r++) {
      for (let m = 0; m < tournament.bracket.rounds[r].length; m++) {
        if (tournament.bracket.rounds[r][m].id === matchId) {
          targetMatch = tournament.bracket.rounds[r][m];
          roundIndex = r;
          matchIndex = m;
          break;
        }
      }
      if (targetMatch) break;
    }

    if (!targetMatch) return null;

    const winner =
      data.score1 > data.score2 ? targetMatch.team1 : targetMatch.team2;

    targetMatch.score1 = data.score1;
    targetMatch.score2 = data.score2;
    targetMatch.winner = winner;
    targetMatch.completed = true;
    tournament.status = 'in_progress';
    tournament.updated_at = new Date().toISOString();

    // Propagate winner to next round
    if (
      roundIndex + 1 < tournament.bracket.rounds.length &&
      winner
    ) {
      const nextRound = tournament.bracket.rounds[roundIndex + 1];

      if (roundIndex === 0 && tournament.bracket.rounds[0][0]?.round === -1) {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        if (nextRound[nextMatchIndex]) {
          if (matchIndex % 2 === 0) {
            nextRound[nextMatchIndex].team1 = winner;
          } else {
            nextRound[nextMatchIndex].team2 = winner;
          }
        }
      } else {
        const nextMatchIndex = Math.floor(matchIndex / 2);
        if (nextRound[nextMatchIndex]) {
          if (matchIndex % 2 === 0) {
            nextRound[nextMatchIndex].team1 = winner;
          } else {
            nextRound[nextMatchIndex].team2 = winner;
          }
        }
      }
    }

    return { bracket: tournament.bracket, match: targetMatch };
  }

  static resetTournament(id: string): Tournament | null {
    const tournament = tournaments.get(id);
    if (!tournament) return null;

    // Reset all matches
    for (const round of tournament.bracket.rounds) {
      for (const match of round) {
        match.score1 = null;
        match.score2 = null;
        match.winner = null;
        match.completed = false;

        // Reset team assignments except for preliminary matches with preset teams
        if (match.round !== -1) {
          match.team1 = null;
          match.team2 = null;
        }
      }
    }

    tournament.status = 'draft';
    tournament.updated_at = new Date().toISOString();

    return tournament;
  }

  static deleteTournament(id: string): boolean {
    return tournaments.delete(id);
  }
}
```

## Express Routes

Create the API routes:

```typescript
// src/routes/tournaments.ts
import express from 'express';
import { TournamentService } from '../services/tournamentService';

const router = express.Router();

// POST /api/tournaments - Create tournament
router.post('/', (req, res) => {
  try {
    const tournament = TournamentService.createTournament(req.body);
    res.status(201).json(tournament);
  } catch (error) {
    res.status(400).json({ message: 'Invalid tournament data' });
  }
});

// GET /api/tournaments - List all tournaments
router.get('/', (req, res) => {
  const tournaments = TournamentService.listTournaments();
  res.json(tournaments);
});

// GET /api/tournaments/:id - Get tournament
router.get('/:id', (req, res) => {
  const tournament = TournamentService.getTournament(req.params.id);
  if (!tournament) {
    return res.status(404).json({ message: 'Tournament not found' });
  }
  res.json(tournament);
});

// PUT /api/tournaments/:id/matches/:matchId - Update match result
router.put('/:id/matches/:matchId', (req, res) => {
  const result = TournamentService.updateMatchResult(
    req.params.id,
    req.params.matchId,
    req.body,
  );
  if (!result) {
    return res.status(404).json({ message: 'Match not found' });
  }
  res.json(result);
});

// POST /api/tournaments/:id/reset - Reset tournament
router.post('/:id/reset', (req, res) => {
  const tournament = TournamentService.resetTournament(req.params.id);
  if (!tournament) {
    return res.status(404).json({ message: 'Tournament not found' });
  }
  res.json(tournament);
});

// DELETE /api/tournaments/:id - Delete tournament
router.delete('/:id', (req, res) => {
  const deleted = TournamentService.deleteTournament(req.params.id);
  if (!deleted) {
    return res.status(404).json({ message: 'Tournament not found' });
  }
  res.status(204).send();
});

export default router;
```

## Main Server

Create the main Express server:

```typescript
// src/server.ts
import express from 'express';
import cors from 'cors';
import tournamentRoutes from './routes/tournaments';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tournaments', tournamentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
```

## Running the Server

```bash
# Development
npx ts-node src/server.ts

# Production (with TypeScript compiled to JavaScript)
npm run build
node dist/server.js
```

## Notes

- This example uses in-memory storage. For production, implement with a real database (PostgreSQL, MongoDB, etc.)
- Add input validation before processing requests
- Add authentication/authorization as needed
- Add error handling and logging
- Use environment variables for configuration
- Add database migrations for schema management
- Implement proper error messages and HTTP status codes

## Next Steps

1. Replace in-memory storage with your database of choice
2. Add input validation using libraries like `joi` or `zod`
3. Add authentication (JWT, OAuth, etc.)
4. Add logging and error tracking
5. Add database migrations
6. Add unit tests
7. Deploy to production environment
