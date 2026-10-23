import {
  FinishedMatch,
  Match,
  OngoingMatch,
  SetScore,
} from "@/types/tournament";

export const POINTS_TO_WIN_SET = 15;
export const DEUCE_THRESHOLD = 14;
export const HARD_CAP_POINTS = 21;
export const SETS_TO_WIN_MATCH = 2;

/**
 * Checks if a given score achieves a set victory according to the
 * deuce advantage rule (15 points, 2-point lead at 14-14+, hard cap 21).
 */
export function checkSetWinner(
  scoreA: number,
  scoreB: number
): "teamA" | "teamB" | null {
  // Hard cap sudden-death at 21
  if (scoreA === HARD_CAP_POINTS) return "teamA";
  if (scoreB === HARD_CAP_POINTS) return "teamB";

  // Normal victory or deuce victory
  if (scoreA >= POINTS_TO_WIN_SET && scoreA - scoreB >= 2) {
    return "teamA";
  }
  if (scoreB >= POINTS_TO_WIN_SET && scoreB - scoreA >= 2) {
    return "teamB";
  }

  return null;
}

/**
 * Determines whether the current state is a Deuce, Game Point, or Match Point.
 */
export function calculatePointFlags(
  currentScore: SetScore,
  setScores: SetScore[],
  currentSet: 1 | 2 | 3
): {
  isDeuce: boolean;
  isGamePoint: "teamA" | "teamB" | null;
  isMatchPoint: "teamA" | "teamB" | null;
} {
  const { teamA, teamB } = currentScore;
  const isDeuce = teamA >= DEUCE_THRESHOLD && teamB >= DEUCE_THRESHOLD && teamA === teamB;

  // Count past sets won
  let setsWonA = 0;
  let setsWonB = 0;
  for (const s of setScores) {
    if (s.teamA > s.teamB) setsWonA++;
    else if (s.teamB > s.teamA) setsWonB++;
  }

  // Check if teamA is 1 point away from winning this set
  let teamAGamePoint = false;
  if (teamA === HARD_CAP_POINTS - 1 && teamB === HARD_CAP_POINTS - 1) {
    teamAGamePoint = true;
  } else if (teamA >= POINTS_TO_WIN_SET - 1 && teamA - teamB >= 1) {
    teamAGamePoint = true;
  }

  // Check if teamB is 1 point away from winning this set
  let teamBGamePoint = false;
  if (teamB === HARD_CAP_POINTS - 1 && teamA === HARD_CAP_POINTS - 1) {
    teamBGamePoint = true;
  } else if (teamB >= POINTS_TO_WIN_SET - 1 && teamB - teamA >= 1) {
    teamBGamePoint = true;
  }

  let isGamePoint: "teamA" | "teamB" | null = null;
  if (teamAGamePoint && !teamBGamePoint) isGamePoint = "teamA";
  else if (teamBGamePoint && !teamAGamePoint) isGamePoint = "teamB";

  let isMatchPoint: "teamA" | "teamB" | null = null;
  if (isGamePoint === "teamA" && setsWonA === SETS_TO_WIN_MATCH - 1) {
    isMatchPoint = "teamA";
  } else if (isGamePoint === "teamB" && setsWonB === SETS_TO_WIN_MATCH - 1) {
    isMatchPoint = "teamB";
  }

  return { isDeuce, isGamePoint, isMatchPoint };
}

/**
 * Applies a point to an ongoing match.
 * If set or match concludes, transitions the state accordingly.
 */
export function awardPoint(
  match: OngoingMatch,
  scoringTeam: "teamA" | "teamB"
): OngoingMatch | FinishedMatch {
  const now = new Date().toISOString();
  const nextScore: SetScore = {
    teamA: scoringTeam === "teamA" ? match.currentScore.teamA + 1 : match.currentScore.teamA,
    teamB: scoringTeam === "teamB" ? match.currentScore.teamB + 1 : match.currentScore.teamB,
  };

  // Determine service side (Right if even, Left if odd)
  const currentScorerPoints =
    scoringTeam === "teamA" ? nextScore.teamA : nextScore.teamB;
  const servingCourtSide = currentScorerPoints % 2 === 0 ? "right" : "left";

  const setWinner = checkSetWinner(nextScore.teamA, nextScore.teamB);

  // If no set winner yet, continue current set
  if (!setWinner) {
    const flags = calculatePointFlags(
      nextScore,
      match.setScores,
      match.currentSet
    );

    return {
      ...match,
      currentScore: nextScore,
      servingTeam: scoringTeam,
      servingCourtSide,
      lastUpdated: now,
      ...flags,
    };
  }

  // Set concluded!
  const updatedSetScores = [...match.setScores, nextScore];

  // Count total sets won by each team
  let setsWonA = 0;
  let setsWonB = 0;
  for (const s of updatedSetScores) {
    if (s.teamA > s.teamB) setsWonA++;
    else if (s.teamB > s.teamA) setsWonB++;
  }

  // Check if match is finished
  if (setsWonA === SETS_TO_WIN_MATCH || setsWonB === SETS_TO_WIN_MATCH) {
    const winnerTeam = setsWonA === SETS_TO_WIN_MATCH ? match.teamA : match.teamB;
    const finishedMatch: FinishedMatch = {
      matchId: match.matchId,
      category: match.category,
      round: match.round,
      stage: match.stage,
      groupName: match.groupName,
      courtNumber: match.courtNumber,
      scheduledTime: match.scheduledTime,
      teamA: match.teamA,
      teamB: match.teamB,
      isSemiOrFinal: match.isSemiOrFinal,
      status: "finished",
      finalScores: updatedSetScores,
      winnerTeam,
      completedAt: now,
    };
    return finishedMatch;
  }

  // Advance to next set (Set 2 or Set 3)
  const nextSetIndex = (match.currentSet + 1) as 2 | 3;
  return {
    ...match,
    currentSet: nextSetIndex,
    setScores: updatedSetScores,
    currentScore: { teamA: 0, teamB: 0 },
    servingTeam: scoringTeam,
    servingCourtSide: "right",
    lastUpdated: now,
    isDeuce: false,
    isGamePoint: null,
    isMatchPoint: null,
  };
}

/**
 * Decrements a point for corrections/umpire mistakes.
 */
export function subtractPoint(
  match: OngoingMatch,
  team: "teamA" | "teamB"
): OngoingMatch {
  const currentVal = match.currentScore[team];
  if (currentVal <= 0) return match;

  const nextScore: SetScore = {
    teamA: team === "teamA" ? currentVal - 1 : match.currentScore.teamA,
    teamB: team === "teamB" ? currentVal - 1 : match.currentScore.teamB,
  };

  const servingTeamScore =
    match.servingTeam === "teamA" ? nextScore.teamA : nextScore.teamB;
  const servingCourtSide = servingTeamScore % 2 === 0 ? "right" : "left";

  const flags = calculatePointFlags(
    nextScore,
    match.setScores,
    match.currentSet
  );

  return {
    ...match,
    currentScore: nextScore,
    servingCourtSide,
    lastUpdated: new Date().toISOString(),
    ...flags,
  };
}

/**
 * Manually switches server side or serving team for umpire adjustment.
 */
export function switchServer(match: OngoingMatch): OngoingMatch {
  const nextServingTeam = match.servingTeam === "teamA" ? "teamB" : "teamA";
  const points =
    nextServingTeam === "teamA"
      ? match.currentScore.teamA
      : match.currentScore.teamB;
  const servingCourtSide = points % 2 === 0 ? "right" : "left";

  return {
    ...match,
    servingTeam: nextServingTeam,
    servingCourtSide,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Concludes a match immediately via Walkover (W/O) or Retired (Ret.)
 */
export function recordWalkoverOrRetirement(
  match: Match,
  winner: "teamA" | "teamB",
  reason: "walkover" | "retired"
): FinishedMatch {
  const now = new Date().toISOString();
  const winnerTeam = winner === "teamA" ? match.teamA : match.teamB;
  
  let finalScores: SetScore[];
  if (reason === "walkover") {
    // Official walkover standard: 21-0, 21-0 (or 15-0, 15-0)
    finalScores =
      winner === "teamA"
        ? [
            { teamA: 21, teamB: 0 },
            { teamA: 21, teamB: 0 },
          ]
        : [
            { teamA: 0, teamB: 21 },
            { teamA: 0, teamB: 21 },
          ];
  } else {
    // Retired during match: retain prior completed sets and finalize current score
    const ongoing = match.status === "ongoing" ? (match as OngoingMatch) : null;
    if (ongoing) {
      finalScores = [...ongoing.setScores, ongoing.currentScore];
      // ensure winning team has winning set count representation
      if (finalScores.length === 0) {
        finalScores =
          winner === "teamA"
            ? [{ teamA: 15, teamB: 0 }]
            : [{ teamA: 0, teamB: 15 }];
      }
    } else {
      finalScores =
        winner === "teamA"
          ? [{ teamA: 21, teamB: 0 }]
          : [{ teamA: 0, teamB: 21 }];
    }
  }

  return {
    matchId: match.matchId,
    category: match.category,
    round: match.round,
    stage: match.stage,
    groupName: match.groupName,
    courtNumber: match.courtNumber ?? null,
    scheduledTime: match.scheduledTime,
    teamA: match.teamA,
    teamB: match.teamB,
    isSemiOrFinal: match.isSemiOrFinal,
    status: "finished",
    finalScores,
    winnerTeam,
    completedAt: now,
    finishReason: reason,
  };
}

/**
 * Instantly simulates/finishes an active match for rapid testing
 */
export function fastFinishMatch(match: OngoingMatch): FinishedMatch {
  const now = new Date().toISOString();
  // Team currently leading or teamA wins
  const teamAWins =
    match.currentScore.teamA >= match.currentScore.teamB;
  const winnerTeam = teamAWins ? match.teamA : match.teamB;

  const winningScore: SetScore = teamAWins
    ? { teamA: 15, teamB: Math.min(match.currentScore.teamB, 13) }
    : { teamA: Math.min(match.currentScore.teamA, 13), teamB: 15 };

  const finalScores = [...match.setScores, winningScore];
  // Ensure 2 sets won
  if (finalScores.length < 2) {
    finalScores.push(
      teamAWins ? { teamA: 15, teamB: 10 } : { teamA: 10, teamB: 15 }
    );
  }

  return {
    matchId: match.matchId,
    category: match.category,
    round: match.round,
    stage: match.stage,
    groupName: match.groupName,
    courtNumber: match.courtNumber,
    scheduledTime: match.scheduledTime,
    teamA: match.teamA,
    teamB: match.teamB,
    isSemiOrFinal: match.isSemiOrFinal,
    status: "finished",
    finalScores,
    winnerTeam,
    completedAt: now,
    finishReason: "normal",
  };
}
