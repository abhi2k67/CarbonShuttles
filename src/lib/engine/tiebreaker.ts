import { FinishedMatch, Match, TeamStanding, TournamentCategory } from "@/types/tournament";

/**
 * Computes round-robin standings strictly according to BWF Article 16 statutory logic:
 * 1. Total match wins
 * 2. Head-to-head match result (for 2-way ties)
 * 3. Game/Set differential (sets won - sets lost)
 * 4. Point differential (points won - points lost)
 */
export function computeStandings(
  categoryMatches: Match[],
  category: TournamentCategory,
  groupName?: string
): TeamStanding[] {
  // Filter relevant finished round-robin matches
  const roundRobinMatches = categoryMatches.filter(
    (m): m is FinishedMatch =>
      m.category === category &&
      m.stage === "round_robin" &&
      (!groupName || m.groupName === groupName) &&
      m.status === "finished"
  );

  // Collect all teams that participated in this group/category
  const teamsSet = new Set<string>();
  categoryMatches.forEach((m) => {
    if (m.category === category && (!groupName || m.groupName === groupName)) {
      teamsSet.add(m.teamA);
      teamsSet.add(m.teamB);
    }
  });

  const standingsMap: Record<string, TeamStanding> = {};
  teamsSet.forEach((team) => {
    standingsMap[team] = {
      team,
      category,
      groupName,
      played: 0,
      won: 0,
      lost: 0,
      setsWon: 0,
      setsLost: 0,
      setDifferential: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointDifferential: 0,
    };
  });

  // Track head to head winner between team pairs: key = `${team1}:::${team2}` -> winnerTeam
  const h2hMap: Record<string, string> = {};

  roundRobinMatches.forEach((m) => {
    const sA = standingsMap[m.teamA];
    const sB = standingsMap[m.teamB];
    if (!sA || !sB) return;

    sA.played += 1;
    sB.played += 1;

    let setsA = 0;
    let setsB = 0;
    let pointsA = 0;
    let pointsB = 0;

    m.finalScores.forEach((set) => {
      pointsA += set.teamA;
      pointsB += set.teamB;
      if (set.teamA > set.teamB) setsA++;
      else if (set.teamB > set.teamA) setsB++;
    });

    sA.setsWon += setsA;
    sA.setsLost += setsB;
    sA.pointsWon += pointsA;
    sA.pointsLost += pointsB;

    sB.setsWon += setsB;
    sB.setsLost += setsA;
    sB.pointsWon += pointsB;
    sB.pointsLost += pointsA;

    if (m.winnerTeam === m.teamA) {
      sA.won += 1;
      sB.lost += 1;
    } else {
      sB.won += 1;
      sA.lost += 1;
    }

    const pairKey1 = `${m.teamA}:::${m.teamB}`;
    const pairKey2 = `${m.teamB}:::${m.teamA}`;
    h2hMap[pairKey1] = m.winnerTeam;
    h2hMap[pairKey2] = m.winnerTeam;
  });

  // Compute differentials
  Object.values(standingsMap).forEach((st) => {
    st.setDifferential = st.setsWon - st.setsLost;
    st.pointDifferential = st.pointsWon - st.pointsLost;
  });

  const standingsList = Object.values(standingsMap);

  // Sort groups recursively according to BWF Article 16
  const sorted = sortStandingsBWF(standingsList, h2hMap);

  // Assign numerical ranks
  return sorted.map((st, idx) => ({
    ...st,
    rank: idx + 1,
  }));
}

function sortStandingsBWF(
  teams: TeamStanding[],
  h2hMap: Record<string, string>
): TeamStanding[] {
  if (teams.length <= 1) return teams;

  // 1. Group by total match wins
  const byWins: Record<number, TeamStanding[]> = {};
  teams.forEach((t) => {
    byWins[t.won] = byWins[t.won] || [];
    byWins[t.won].push(t);
  });

  const sortedWins = Object.keys(byWins)
    .map(Number)
    .sort((a, b) => b - a);

  const result: TeamStanding[] = [];

  for (const winCount of sortedWins) {
    const tiedGroup = byWins[winCount];

    if (tiedGroup.length === 1) {
      result.push(tiedGroup[0]);
    } else if (tiedGroup.length === 2) {
      // 2. 2-way tie: Check Total Points Scored first per tournament house rule, or Head-to-Head
      const [t1, t2] = tiedGroup;
      if (t1.pointsWon !== t2.pointsWon) {
        result.push(...[t1, t2].sort((a, b) => b.pointsWon - a.pointsWon));
      } else {
        const winner = h2hMap[`${t1.team}:::${t2.team}`];
        if (winner === t1.team) {
          result.push(t1, t2);
        } else if (winner === t2.team) {
          result.push(t2, t1);
        } else {
          result.push(...[t1, t2].sort((a, b) => b.pointDifferential - a.pointDifferential));
        }
      }
    } else {
      // 3. Multi-way tie (>2 teams): Prioritize Total Points Scored (pointsWon), then Point Differential
      const sortedByPointsScored = [...tiedGroup].sort((a, b) => {
        if (b.pointsWon !== a.pointsWon) {
          return b.pointsWon - a.pointsWon;
        }
        if (b.pointDifferential !== a.pointDifferential) {
          return b.pointDifferential - a.pointDifferential;
        }
        return b.setDifferential - a.setDifferential;
      });
      result.push(...sortedByPointsScored);
    }
  }

  return result;
}
