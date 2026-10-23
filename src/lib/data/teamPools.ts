import {
  CourtAssignment,
  Match,
  MatchRound,
  OngoingMatch,
  ScheduledMatch,
  TournamentCategory,
  TournamentState,
} from "@/types/tournament";

export const EVEN_TEAM_OPTIONS = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 32];

export const CATEGORY_NAME_POOLS: Record<TournamentCategory, string[]> = {
  MD_A: [
    "Hyderabad Smashers",
    "Bangalore Blasters",
    "Chennai Shuttlers",
    "Delhi Deuces",
    "Mumbai Net-Riders",
    "Pune Pulverizers",
    "Ahmedabad Aces",
    "Kolkata Drop-Shots",
    "Punjab Rallies",
    "Kerala Smashers",
    "Goa Spinners",
    "Jaipur Jumpers",
    "Lucknow Lobbers",
    "Chandigarh Chippers",
    "Indore Impact",
    "Bhopal Birds",
    "Noida Netters",
    "Surat Slicers",
    "Nagpur Net-Masters",
    "Varanasi Volleys",
    "Ranchi Rackets",
    "Guwahati Gliders",
    "Coimbatore Crushers",
    "Vadodara Volleys",
    "Dehradun Drives",
    "Mysore Matchers",
    "Agra Aces",
    "Patna Pulses",
    "Rajkot Rallies",
    "Kanpur Kinetic",
    "Jodhpur Jammers",
    "Madurai Mashers",
  ],
  MD_B: [
    "Vortex Strikers",
    "Cyber Smashers",
    "Shuttle Ninjas",
    "Net Ninjas",
    "Feather Knights",
    "Apex Shuttlers",
    "Neon Rackets",
    "Grip Masters",
    "Cross-Court Kings",
    "Backhand Blitz",
    "Sideline Snipers",
    "Baseline Bombers",
    "Spin Doctors",
    "Smash Bandits",
    "Rally Rangers",
    "Drive Kings",
    "Drop-Shot Demons",
    "Net Cobras",
    "Birdie Bashing Boys",
    "Alley Hitters",
    "Slice Syndicate",
    "Carbon Cruisers",
    "Shuttle Shockers",
    "Smash Dynamos",
    "Angle Assassins",
    "Court Commanders",
    "Fleet Footers",
    "Rally Raiders",
    "Shuttle Storm",
    "Quick Returners",
    "Flick Shot Force",
    "Smash Titans",
  ],
  XD_A: [
    "Titanium Duo",
    "Falcon Flyers",
    "Echo Strikers",
    "Aero Aces",
    "Quantum Pairs",
    "Phoenix Wings",
    "Solar Flares",
    "Velocity Twin",
    "Cosmic Pair",
    "Lightning Duo",
    "Aura Smash",
    "Starlight Tandem",
    "Eclipse Duo",
    "Zenith Pair",
    "Harmony Hitters",
    "Celestial Strike",
    "Fusion Force",
    "Nova Rallies",
    "Radiant Wings",
    "Astra Duo",
    "Thunder Duo",
    "Synergy Smash",
    "Orbit Alliance",
    "Pulse Pair",
    "Infinity Shuttles",
    "Apex Harmony",
    "Prism Pairs",
    "Stellar Smash",
    "Chrono Duo",
    "Kinetic Twins",
    "Matrix Mixed",
    "Radiant Rush",
  ],
  XD_B: [
    "Cosmic Smash",
    "Thunder Birds",
    "Orbit Racers",
    "Glide Force",
    "Pulse Dynamic",
    "Shadow Spinners",
    "Radiant Rallies",
    "Horizon Hitters",
    "Flash Pairs",
    "Comet Chasers",
    "Nova Pairs",
    "Meteor Smash",
    "Spark Duo",
    "Breeze Shuttlers",
    "Rocket Pairs",
    "Dynamic Drift",
    "Twilight Tandem",
    "Hyper Mixed",
    "Blitz Birds",
    "Echo Racers",
    "Zenith Drift",
    "Neon Storm",
    "Solar Flare Pairs",
    "Astro Smash",
    "Mystic Motion",
    "Turbo Shuttles",
    "Mirage Duo",
    "Comet Smash",
    "Ripple Racers",
    "Zenith Smash",
    "Pulse Racers",
    "Galaxy Glide",
  ],
  WD_OPEN: [
    "Valkyrie Shuttle",
    "Empress Smash",
    "Lotus Strikers",
    "Diamond Drop",
    "Siren Swerves",
    "Aurora Net",
    "Zenith Queens",
    "Nova Shuttlers",
    "Falcon Mistresses",
    "Pearl Rackets",
    "Celestial Sisters",
    "Blaze Queens",
    "Athena Aces",
    "Sapphire Smash",
    "Velvet Volleys",
    "Crimson Queens",
    "Ruby Rackets",
    "Golden Gliders",
    "Mirage Maidens",
    "Phoenix Sisters",
    "Lunar Netters",
    "Orchid Smash",
    "Silver Swerves",
    "Radiant Queens",
    "Emerald Elite",
    "Mystic Sirens",
    "Artemis Aces",
    "Solstice Sisters",
    "Crystal Drop",
    "Stellar Queens",
    "Nebula Net",
    "Valkyrie Wings",
  ],
};

/**
 * Picks `count` random unique names from category pool.
 */
export function generateRandomTeamNames(
  category: TournamentCategory,
  count: number
): string[] {
  const pool = [...CATEGORY_NAME_POOLS[category]];
  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // If requested count exceeds pool, synthesize numbered extension
  if (count <= pool.length) {
    return pool.slice(0, count);
  }

  const result = [...pool];
  let extraIndex = 1;
  while (result.length < count) {
    result.push(`${category.replace("_", " ")} Team ${extraIndex++}`);
  }
  return result;
}

/**
 * Builds full tournament fixtures from the configured category teams.
 */
export function generateFixturesFromTeams(
  categoryTeams: Record<TournamentCategory, string[]>
): TournamentState {
  const matches: Match[] = [];
  let matchCounter = 1;

  const categories: TournamentCategory[] = [
    "MD_A",
    "MD_B",
    "XD_A",
    "XD_B",
    "WD_OPEN",
  ];

  for (const cat of categories) {
    const teams = categoryTeams[cat] || [];
    if (teams.length < 2) continue;

    const isRoundRobin = teams.length > 10;

    if (isRoundRobin) {
      // Split into groups of 3 or 4
      const groupSize = 4;
      const numGroups = Math.ceil(teams.length / groupSize);

      for (let g = 0; g < numGroups; g++) {
        const groupLetter = String.fromCharCode(65 + g);
        const groupName = `Group ${groupLetter}`;
        const groupTeams = teams.slice(g * groupSize, (g + 1) * groupSize);

        // Round robin pairing within group
        for (let i = 0; i < groupTeams.length; i++) {
          for (let j = i + 1; j < groupTeams.length; j++) {
            matches.push({
              matchId: `M-${cat}-G${matchCounter++}`,
              category: cat,
              round: "Group Match",
              stage: "round_robin",
              groupName,
              teamA: groupTeams[i],
              teamB: groupTeams[j],
              isSemiOrFinal: false,
              courtNumber: null,
              scheduledTime: `${10 + Math.floor(matchCounter / 4)}:${(matchCounter % 4) * 15 || "00"} AM`,
              status: "scheduled",
            });
          }
        }
      }

      // Add Semi-Finals and Finals for round-robin category (Held by Crowd Retention)
      matches.push({
        matchId: `M-${cat}-SF1`,
        category: cat,
        round: "Semi-Final",
        stage: "knockout",
        teamA: "Winner Group A",
        teamB: "Runner-Up Group B",
        isSemiOrFinal: true,
        courtNumber: null,
        scheduledTime: "04:30 PM",
        status: "scheduled",
      });
      matches.push({
        matchId: `M-${cat}-SF2`,
        category: cat,
        round: "Semi-Final",
        stage: "knockout",
        teamA: "Winner Group B",
        teamB: "Runner-Up Group A",
        isSemiOrFinal: true,
        courtNumber: null,
        scheduledTime: "05:15 PM",
        status: "scheduled",
      });
      matches.push({
        matchId: `M-${cat}-FIN`,
        category: cat,
        round: "Final",
        stage: "knockout",
        teamA: `Winner SF1 (${cat})`,
        teamB: `Winner SF2 (${cat})`,
        isSemiOrFinal: true,
        courtNumber: null,
        scheduledTime: "06:45 PM",
        status: "scheduled",
      });
    } else {
      // Knockout bracket for <= 10 teams
      const isPowerOfTwo = (n: number) => (n & (n - 1)) === 0;
      let roundName: MatchRound = "Quarter-Final";
      if (teams.length <= 4) roundName = "Semi-Final";
      else if (teams.length > 8) roundName = "Round of 16";

      // Pair teams
      for (let i = 0; i < teams.length; i += 2) {
        if (i + 1 < teams.length) {
          const isClimax = roundName === "Semi-Final";
          matches.push({
            matchId: `M-${cat}-K${matchCounter++}`,
            category: cat,
            round: roundName,
            stage: "knockout",
            teamA: teams[i],
            teamB: teams[i + 1],
            isSemiOrFinal: isClimax,
            courtNumber: null,
            scheduledTime: `${10 + Math.floor(matchCounter / 4)}:${(matchCounter % 4) * 15 || "00"} AM`,
            status: "scheduled",
          });
        }
      }

      // Add subsequent SF and Final if starting from QF or R16
      if (roundName === "Quarter-Final" || roundName === "Round of 16") {
        matches.push({
          matchId: `M-${cat}-SF1`,
          category: cat,
          round: "Semi-Final",
          stage: "knockout",
          teamA: `Winner QF 1 (${cat})`,
          teamB: `Winner QF 2 (${cat})`,
          isSemiOrFinal: true,
          courtNumber: null,
          scheduledTime: "04:45 PM",
          status: "scheduled",
        });
        matches.push({
          matchId: `M-${cat}-FIN`,
          category: cat,
          round: "Final",
          stage: "knockout",
          teamA: `Winner SF 1 (${cat})`,
          teamB: `Winner SF 2 (${cat})`,
          isSemiOrFinal: true,
          courtNumber: null,
          scheduledTime: "06:30 PM",
          status: "scheduled",
        });
      }
    }
  }

  // Assign first 6 non-climax matches to Court 1 through Court 6 as ONGOING
  const preliminaryMatches = matches.filter((m) => !m.isSemiOrFinal);
  const courts: CourtAssignment[] = [];

  for (let c = 1; c <= 6; c++) {
    if (c - 1 < preliminaryMatches.length) {
      const match = preliminaryMatches[c - 1];
      const matchIdx = matches.findIndex((m) => m.matchId === match.matchId);
      const now = new Date().toISOString();

      const ongoing: OngoingMatch = {
        ...match,
        status: "ongoing",
        courtNumber: c,
        currentSet: 1,
        setScores: [],
        currentScore: { teamA: 0, teamB: 0 },
        servingTeam: "teamA",
        servingCourtSide: "right",
        startTime: now,
        lastUpdated: now,
        isDeuce: false,
        isGamePoint: null,
        isMatchPoint: null,
      };

      matches[matchIdx] = ongoing;
      courts.push({ courtNumber: c, currentMatchId: ongoing.matchId });
    } else {
      courts.push({ courtNumber: c, currentMatchId: null });
    }
  }

  return {
    version: 1,
    lastEventId: 1,
    isConfigured: true,
    categoryTeams,
    matches,
    courts,
    retentionQueueHeld: true,
    lastUpdated: new Date().toISOString(),
  };
}
