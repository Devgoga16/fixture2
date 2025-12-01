export type TeamSize = number;

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

/**
 * Calculate preliminary round matches for teams that don't fit into a power of 2 bracket
 * For example: 17 teams → 1 preliminary match (17 - 16 = 1 extra) → 16-team main bracket
 * For example: 20 teams → 2 preliminary matches (20 - 16 = 4 extra) → 16-team main bracket
 */
export function calculatePreliminaryRound(teamCount: number): {
  preliminaryMatches: number;
  byes: number;
} {
  if (teamCount <= 0) {
    return { preliminaryMatches: 0, byes: 0 };
  }

  // Find the largest power of 2 that is <= teamCount
  let largestPowerBelow = 1;
  while (largestPowerBelow * 2 <= teamCount) {
    largestPowerBelow *= 2;
  }

  const mainBracketSize = largestPowerBelow;

  if (teamCount <= mainBracketSize) {
    return { preliminaryMatches: 0, byes: 0 };
  }

  // Teams that exceed the main bracket size need preliminary matches
  const extraTeams = teamCount - mainBracketSize;
  const preliminaryMatches = Math.ceil(extraTeams / 2);
  const byes = extraTeams % 2; // If odd number of extra teams, one team gets a bye in preliminary

  return { preliminaryMatches, byes };
}

/**
 * Generate a knockout bracket structure
 */
export function generateBracket(teams: Team[]): Bracket {
  const teamCount = teams.length;
  const rounds: Match[][] = [];
  const preliminary = calculatePreliminaryRound(teamCount);

  // Generate preliminary round if needed
  let firstRoundTeamsCount = teamCount;
  if (preliminary.preliminaryMatches > 0) {
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

    // First round will have preliminary winners + bye teams
    // Number of teams in first main round = preliminary winners + byes
    firstRoundTeamsCount = preliminary.preliminaryMatches + preliminary.byes;

    // Build first round with placeholder structure
    // Preliminary winners will be in team1 positions (filled as matches are completed)
    // Bye teams will be in team2 positions
    const firstRoundMatches: Match[] = [];

    // Create matches pairing preliminary winners
    for (let i = 0; i < preliminary.preliminaryMatches; i += 2) {
      const position = Math.floor(i / 2);
      firstRoundMatches.push({
        id: `match-0-${position}`,
        round: 0,
        position: position,
        team1: null, // Will be filled with prelim winner i
        team2: i + 1 < preliminary.preliminaryMatches ? null : null, // Will be filled with prelim winner i+1 or bye team
        score1: null,
        score2: null,
        winner: null,
        completed: false,
      });
    }

    // Handle bye teams if there's an odd number of preliminary winners
    if (preliminary.byes > 0) {
      const byeTeam = teams[preliminary.preliminaryMatches * 2];
      // The bye team goes to the last match's team2 (or creates a new match if needed)
      const lastMatch = firstRoundMatches[firstRoundMatches.length - 1];
      if (lastMatch && lastMatch.team2 === null) {
        lastMatch.team2 = byeTeam;
      }
    }

    rounds.push(firstRoundMatches);

    // Generate remaining bracket rounds
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
    // No preliminary round - just generate the standard bracket
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

/**
 * Update match result and propagate winner to next round
 */
export function updateMatchResult(
  bracket: Bracket,
  matchId: string,
  score1: number,
  score2: number,
): Bracket {
  const newBracket = JSON.parse(JSON.stringify(bracket)) as Bracket;

  // Find the match
  let targetMatch: Match | null = null;
  let roundIndex = -1;
  let matchIndex = -1;

  for (let r = 0; r < newBracket.rounds.length; r++) {
    for (let m = 0; m < newBracket.rounds[r].length; m++) {
      if (newBracket.rounds[r][m].id === matchId) {
        targetMatch = newBracket.rounds[r][m];
        roundIndex = r;
        matchIndex = m;
        break;
      }
    }
    if (targetMatch) break;
  }

  if (!targetMatch) return bracket;

  const winner = score1 > score2 ? targetMatch.team1 : targetMatch.team2;

  targetMatch.score1 = score1;
  targetMatch.score2 = score2;
  targetMatch.winner = winner;
  targetMatch.completed = true;

  // Propagate winner to next round
  if (roundIndex + 1 < newBracket.rounds.length && winner) {
    const nextRound = newBracket.rounds[roundIndex + 1];
    const nextMatchIndex = Math.floor(matchIndex / 2);

    if (nextRound[nextMatchIndex]) {
      if (matchIndex % 2 === 0) {
        nextRound[nextMatchIndex].team1 = winner;
      } else {
        nextRound[nextMatchIndex].team2 = winner;
      }
    }
  }

  return newBracket;
}

/**
 * Get round name for display
 */
export function getRoundName(roundNum: number, totalRounds: number): string {
  if (roundNum === -1) return "Fase Previa";
  if (roundNum === totalRounds - 1) return "Final";
  if (roundNum === totalRounds - 2) return "Semifinal";
  if (roundNum === totalRounds - 3) return "Cuartos de Final";
  if (roundNum === totalRounds - 4) return "Octavos de Final";
  return `Ronda ${roundNum + 1}`;
}
