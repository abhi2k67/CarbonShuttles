# Carbon Shuttles - Test Specification 🏸

A comprehensive, step-by-step test manual designed for tournament organizers, quality assurance testers, court umpires, and volunteers. This document provides clear test cases with exact steps, inputs, and expected outcomes to verify all functionalities of the Carbon Shuttles tournament management platform.

---

## Quick Reference & Test Credentials

| Role | Access Route | Default Passcode / PIN | Key Action |
| :--- | :--- | :--- | :--- |
| **System Admin / Organizer** | Header &rarr; Admin Button (Key icon) | Username: `admin`<br>Password: `carbonshuttle` | Unlock Organizer Console, reassign courts, toggle retention |
| **Court Umpire** | Umpire Console &rarr; Lock Icon | PIN: `1234` | Unlock scoring controls on court tablet |
| **Spectator / Bystander** | Arena / Standings / Brackets | *No passcode (Read-Only)* | Live viewing only |

---

## Summary of Test Suites

| Suite ID | Functional Area | Test Cases | Objective |
| :--- | :--- | :--- | :--- |
| **TS-01** | Initial Setup & Tournament Wizard | TC-01 to TC-03 | Verify tournament creation, pool generation, team naming |
| **TS-02** | 6-Court Arena Overview | TC-04 to TC-06 | Verify multi-court dashboard, live telemetry, vacant court cards |
| **TS-03** | Court Umpire Console & Scoring | TC-07 to TC-13 | Test point scoring, undo, serve court parity, deuce, match finish |
| **TS-04** | Security & Tamper Protection | TC-14 & TC-15 | Verify Umpire PIN lock and Admin login authorization |
| **TS-05** | Standings & BWF Tie-Breakers | TC-16 & TC-17 | Validate BWF Article 16 statutory tie-breaker sorting rules |
| **TS-06** | Knockout Brackets Engine | TC-18 & TC-19 | Test bracket progression, winner advancement, finals |
| **TS-07** | Crowd Retention Climax Gate | TC-20 & TC-21 | Validate holding semi-finals & finals until group stage completes |
| **TS-08** | Organizer Console & Controls | TC-22 to TC-24 | Verify manual court reassignment, speed control, reset |
| **TS-09** | Backup, Export & Offline Sync | TC-25 to TC-27 | Test JSON backup export, import recovery, offline storage |
| **TS-10** | Audio Synthesizer & Celebrations | TC-28 & TC-29 | Verify Web Audio arena beeps/chimes and confetti celebration |
| **TS-11** | Automated Rally Simulator | TC-30 | Test end-to-end automated rally generator |

---

## TS-01: Initial Setup & Tournament Wizard

### TC-01: Open Tournament Setup Wizard
- **Objective:** Verify that the organizer can configure tournament categories and team lists.
- **Preconditions:** App is loaded at `http://localhost:3000`. If a tournament is already running, click **Organizer** &rarr; **Reset Tournament** or **Setup** tab.
- **Test Steps:**
  1. Click on the **Setup** tab in the top navigation bar.
  2. Verify that all 5 official disciplines are displayed:
     - Men's Doubles - Class A (`MD_A`)
     - Men's Doubles - Class B (`MD_B`)
     - Mixed Doubles - Class A (`XD_A`)
     - Mixed Doubles - Class B (`XD_B`)
     - Women's Doubles - Open Category (`WD_OPEN`)
  3. Change the team count dropdown for `MD_A` from 16 to 12.
- **Expected Result:**
  - The team list automatically adjusts to 12 teams.
  - Unique team names are generated.
  - `[Pass / Fail]`

---

### TC-02: Team Customization & Shuffle
- **Objective:** Test custom naming and random name shuffling.
- **Test Steps:**
  1. Select any category (e.g. `MD_A`).
  2. Click the **Shuffle Names** button with the dice/sparkles icon.
  3. Verify team names refresh with new badminton-themed Indian team names (e.g., *Hyderabad Smashers*, *Deccan Drifters*).
  4. Click the edit icon next to Team #1 and rename it to `Ace Blasters`.
- **Expected Result:**
  - The edited name `Ace Blasters` is saved in the tournament roster.
  - `[Pass / Fail]`

---

### TC-03: Launch Tournament Schedule
- **Objective:** Verify schedule and pool generation when launching the tournament.
- **Test Steps:**
  1. Click the primary button **"Launch Tournament Schedule"**.
- **Expected Result:**
  - The setup wizard completes and automatically redirects to the **Arena** view.
  - Initial matches are scheduled across the 6 physical courts.
  - In categories with >10 teams (e.g., 12 or 16 teams), round-robin groups (Pool A, Pool B) are created.
  - `[Pass / Fail]`

---

## TS-02: 6-Court Arena Overview

### TC-04: Multi-Court Live Display
- **Objective:** Verify real-time visibility of all 6 courts simultaneously.
- **Test Steps:**
  1. Navigate to the **Arena** tab.
  2. Confirm 6 individual court cards (Court 1 through Court 6) are rendered.
- **Expected Result:**
  - Each card displays court number, category badge, team names, set scores, and court status (Ongoing, Scheduled, or Vacant).
  - Ongoing matches feature an active neon red/orange pulse border.
  - `[Pass / Fail]`

---

### TC-05: Vacant Court Recommendation
- **Objective:** Test that vacant courts propose the next eligible queued match.
- **Test Steps:**
  1. Look at any court that does not currently have an active match (e.g. Court 3).
  2. Inspect the card text.
- **Expected Result:**
  - The card displays **"VACANT COURT"** with a cyan glowing state.
  - A proposed next match is highlighted (e.g., *"Next Proposed Match: Team X vs Team Y"*).
  - A quick action button **"Call Teams & Direct to Umpire"** is present.
  - `[Pass / Fail]`

---

### TC-06: Category Filtering
- **Objective:** Test filtering the arena display by division.
- **Test Steps:**
  1. On the Arena view, click the filter pill for **"Men's Doubles A"**.
  2. Click **"All Categories"**.
- **Expected Result:**
  - When filtered, only matches belonging to the selected category are highlighted/filtered.
  - Clicking "All Categories" restores all 6 courts.
  - `[Pass / Fail]`

---

## TS-03: Court Umpire Console & Scoring Engine

### TC-07: Commence Match on Vacant Court
- **Objective:** Verify that an umpire can initialize a scheduled match on their court.
- **Test Steps:**
  1. Navigate to the **Umpire Console** tab.
  2. Select **Court 1** (or any vacant court) using the court selector pills.
  3. Verify the proposed next match is shown.
  4. Click **"Call Teams & Commence Match"**.
- **Expected Result:**
  - The match begins on Court 1.
  - The scoreboard initializes to **Set 1: 0 - 0**.
  - Match status updates to **Ongoing** across the entire app.
  - `[Pass / Fail]`

---

### TC-08: Point Scoring & Tactile Feedback
- **Objective:** Test incrementing scores for Team A and Team B.
- **Test Steps:**
  1. Click the large green **"+1 POINT"** button for **Team A**.
  2. Verify score updates to `1 - 0`.
  3. Click **"+1 POINT"** for **Team B**.
  4. Verify score updates to `1 - 1`.
- **Expected Result:**
  - Points increment immediately without page reload.
  - Audio synthesizer plays a crisp point scored chime.
  - Current serving side indicators update correctly.
  - `[Pass / Fail]`

---

### TC-09: Score Correction (Undo Point)
- **Objective:** Test decrementing scores in case of umpire button error.
- **Test Steps:**
  1. With score at `1 - 1`, click the **"Undo Point (-1)"** button under Team A.
- **Expected Result:**
  - Team A's score decrements back to `0`. Current score becomes `0 - 1`.
  - Score cannot decrement below `0`.
  - `[Pass / Fail]`

---

### TC-10: Serve Court Parity Logic (Even/Odd Rule)
- **Objective:** Validate that the badminton serve court indicator follows official rules.
- **Rule:** When the serving team's score in the current set is **Even** (0, 2, 4...), the serve is from the **Right** court. When **Odd** (1, 3, 5...), the serve is from the **Left** court.
- **Test Steps:**
  1. Reset or score Team A to `0` (serving). Observe serve box diagram.
  2. Award 1 point to Team A (score `1`). Observe serve box diagram.
  3. Award 1 point to Team A (score `2`). Observe serve box diagram.
- **Expected Result:**
  - At score 0: Serve indicator points to **RIGHT** service court.
  - At score 1: Serve indicator points to **LEFT** service court.
  - At score 2: Serve indicator switches back to **RIGHT** service court.
  - `[Pass / Fail]`

---

### TC-11: Deuce Rule & Sudden Death Cap at 21
- **Objective:** Verify standard 15-point set rules, deuce at 14-14, 2-point advantage, and hard cap at 21.
- **Test Steps:**
  1. Advance the score of Set 1 to `14 - 14`.
  2. Observe the header and status indicators.
  3. Award 1 point to Team A (score `15 - 14`).
  4. Award 1 point to Team B (score `15 - 15`).
  5. Continue until score reaches `20 - 20`.
  6. Award 1 point to Team A (score `21 - 20`).
- **Expected Result:**
  - At `14 - 14`: A golden **"DEUCE"** badge activates; deuce audio alert sounds.
  - At `15 - 14`: The set does NOT end because a 2-point lead is required.
  - At `21 - 20`: Team A wins the set immediately due to the **21-point sudden death cap** rule.
  - The scoreboard automatically transitions to **Set 2 (0 - 0)**.
  - `[Pass / Fail]`

---

### TC-12: Best-of-3 Sets & Match Completion
- **Objective:** Verify that winning 2 sets concludes the match.
- **Test Steps:**
  1. Team A has won Set 1 (1-0 in sets).
  2. In Set 2, score Team A up to 15 points (e.g. 15-8).
  3. (Alternative shortcut: click **"Fast Finish Match"** button to simulate completing the set).
- **Expected Result:**
  - Team A wins Set 2. Total sets: 2 - 0.
  - Match status becomes **"Finished"**.
  - A celebration modal and confetti burst appear.
  - Court 1 returns to **"Vacant"** and automatically proposes the next queued match.
  - `[Pass / Fail]`

---

### TC-13: Walkover / Player Retirement
- **Objective:** Test awarding a match victory when an opponent does not show up or retires due to injury.
- **Test Steps:**
  1. On any ongoing or scheduled match, click **"Award Walkover / Retired"**.
  2. Select the Winning Team (e.g. Team B).
  3. Choose the reason: **"Walkover (No Show)"** or **"Retired (Injury)"**.
  4. Click **"Confirm Walkover"**.
- **Expected Result:**
  - Match immediately concludes with status finished.
  - Score records 15-0, 15-0 (or retirement score).
  - Selected winner advances in the standings/brackets.
  - `[Pass / Fail]`

---

## TS-04: Security & Tamper Protection

### TC-14: Spectator Protection Mode (Umpire PIN Lock)
- **Objective:** Ensure bystanders cannot accidentally touch tablets and tamper with live scores.
- **Test Steps:**
  1. In the **Umpire Console**, click the **Lock** button in the top bar.
  2. Verify the badge changes to **"SPECTATOR LOCKED"**.
  3. Attempt to click **"+1 Point"** or **"Commence Match"**.
- **Expected Result:**
  - Scoring buttons do not increment the score.
  - A passcode modal appears requesting the Official Court PIN.
  - Entering wrong PIN (e.g. `9999`) shows error message: *"Invalid Passcode"*.
  - Entering official PIN **`1234`** unlocks the console with full editing permissions.
  - `[Pass / Fail]`

---

### TC-15: Organizer Console Admin Login
- **Objective:** Verify access restriction on administrative tournament controls.
- **Test Steps:**
  1. If logged in as admin, click **Logout** in the top navigation.
  2. Click the **Organizer** tab.
  3. Attempt to access administrative actions.
  4. Click the **Admin Key** icon in the header to open the login modal.
  5. Enter Username: `admin`, Password: `carbonshuttle`. Click **Submit**.
- **Expected Result:**
  - Organizer console unlocks with full administrative privileges.
  - Admin status badge appears in the header.
  - `[Pass / Fail]`

---

## TS-05: Standings & BWF Tie-Breakers

### TC-16: Pool Standings Calculations
- **Objective:** Validate real-time calculation of Played, Won, Lost, Sets, and Points.
- **Test Steps:**
  1. Navigate to the **Standings** tab.
  2. Select division with pools (e.g. `MD_B` or `MD_A`).
  3. Review the standings table for Pool A.
- **Expected Result:**
  - Table accurately lists Rank, Team Name, P (Played), W (Won), L (Lost), Sets (+/- Diff), Points (+/- Diff).
  - The top qualifying teams are highlighted with a green qualification indicator.
  - `[Pass / Fail]`

---

### TC-17: BWF Article 16 Statutory Tie-Breaker Engine
- **Objective:** Verify that tied teams are ordered strictly according to official BWF rules.
- **BWF Priority Order:**
  1. Total match wins.
  2. Head-to-head result between the 2 tied teams.
  3. Game/Set differential (`setsWon - setsLost`).
  4. Point differential (`pointsWon - pointsLost`).
- **Test Steps:**
  1. Complete two matches in the same pool such that two teams have the same number of wins (1-1).
  2. Verify that the team who won the direct head-to-head encounter ranks higher.
  3. If head-to-head is equal/cyclic (3-way tie), verify that set differential takes priority, followed by point differential.
- **Expected Result:**
  - Standings table automatically sorts according to the exact BWF Article 16 hierarchy.
  - `[Pass / Fail]`

---

## TS-06: Knockout Brackets Engine

### TC-18: Knockout Bracket Rendering
- **Objective:** Verify power-of-two bracket visualization (Round of 16, Quarterfinals, Semifinals, Finals).
- **Test Steps:**
  1. Navigate to the **Brackets** tab.
  2. Select **Men's Doubles Class A** (`MD_A`).
  3. Inspect bracket structure.
- **Expected Result:**
  - Matches are displayed in neat columns flowing from left to right (e.g., Quarter-Finals &rarr; Semi-Finals &rarr; Grand Finals).
  - Completed matches show final scores and highlight the winner in bold/neon.
  - Live matches show real-time scores with an animated pulse.
  - `[Pass / Fail]`

---

### TC-19: Winner Progression to Next Round
- **Objective:** Test that winning a knockout match advances the team to the next round slot.
- **Test Steps:**
  1. Note the winner of Quarterfinal Match 1.
  2. Finish Quarterfinal Match 1.
- **Expected Result:**
  - The winning team's name immediately populates the corresponding slot in the Semi-Final match card.
  - `[Pass / Fail]`

---

## TS-07: Crowd Retention Climax Gate

### TC-20: Retention Gate Holding Semi-Finals and Finals
- **Objective:** Verify that high-profile Semi-Finals and Finals are held back so they do not finish before pool matches.
- **Test Steps:**
  1. Navigate to the **Organizer** tab.
  2. Check the **"Crowd Retention Gate"** card.
  3. Verify whether retention is **ACTIVE (HELD)**.
- **Expected Result:**
  - When active, Semi-Finals and Finals matches remain held in the holding gate with a lock icon.
  - Vacant courts only pull remaining round-robin / preliminary matches.
  - `[Pass / Fail]`

---

### TC-21: Manual Release of Retention Gate
- **Objective:** Test unlocking held climax matches once preliminary matches near completion.
- **Test Steps:**
  1. In the **Organizer** tab, click **"Release Gate / Hold Gate"** toggle button.
- **Expected Result:**
  - The retention gate switches to **RELEASED (UNLOCKED)**.
  - Semi-Finals and Finals become eligible for immediate court scheduling.
  - Vacant courts now propose Semi-Final matches.
  - `[Pass / Fail]`

---

## TS-08: Organizer Console & Controls

### TC-22: Manual Court Reassignment
- **Objective:** Test moving a scheduled match to a specific court to resolve player scheduling conflicts.
- **Test Steps:**
  1. In the **Organizer** tab, locate **"Manual Court Reassignment"**.
  2. Select any scheduled match from the dropdown.
  3. Select Target Court (e.g., **Court 4**).
  4. Click **"Reassign Court"**.
- **Expected Result:**
  - The match is designated to Court 4.
  - In the Umpire Console for Court 4, the match appears as the primary proposed match.
  - `[Pass / Fail]`

---

### TC-23: Simulation Speed Adjustment
- **Objective:** Test changing the speed of simulated rallies.
- **Test Steps:**
  1. In the Organizer tab, find the **"Rally Simulation Speed"** slider.
  2. Move slider from Normal (2500ms) to Ultra-Fast (500ms).
- **Expected Result:**
  - Active rallies simulate at higher frequency (scores change every 0.5s).
  - Preference is persisted in browser storage.
  - `[Pass / Fail]`

---

### TC-24: Tournament Reset
- **Objective:** Test clearing live tournament data to start a new event.
- **Test Steps:**
  1. In the Organizer tab, scroll down to the **"Danger Zone"**.
  2. Click **"Reset Tournament Data"**.
  3. Confirm the browser alert prompt.
- **Expected Result:**
  - Tournament state resets.
  - App navigates to the **Setup Wizard** ready for a new tournament.
  - `[Pass / Fail]`

---

## TS-09: Backup, Export & Offline Sync

### TC-25: Export Tournament JSON Backup
- **Objective:** Verify exporting a full state backup to disk for disaster recovery.
- **Test Steps:**
  1. Click the **Export Backup (JSON)** button in the header or Organizer console.
- **Expected Result:**
  - Browser downloads a file named `carbon_shuttles_backup_<timestamp>.json`.
  - The JSON file contains all matches, teams, categories, and settings.
  - `[Pass / Fail]`

---

### TC-26: Import Tournament JSON Backup
- **Objective:** Verify restoring a tournament from a saved backup file.
- **Test Steps:**
  1. Click **"Import Backup"** and select a previously exported `.json` file.
- **Expected Result:**
  - App displays a success notification: *"Tournament restored successfully"*.
  - Matches, scores, and standings reflect the exact imported state.
  - `[Pass / Fail]`

---

### TC-27: Network Offline Resilience
- **Objective:** Ensure scoring functions uninterrupted even if arena Wi-Fi drops.
- **Test Steps:**
  1. Open Chrome DevTools (`F12`) &rarr; **Network** tab &rarr; select **Offline**.
  2. In the Umpire Console, award 2 points.
  3. Check the connection indicator in the header.
  4. Switch Network back to **Online**.
- **Expected Result:**
  - Header badge indicates **Offline** with a yellow warning icon.
  - Points continue to increment locally without error.
  - Actions queue into IndexedDB storage.
  - When reconnected to Online, the status reverts to **Connected** and pending sync items flush automatically.
  - `[Pass / Fail]`

---

## TS-10: Audio Synthesizer & Celebrations

### TC-28: Web Audio Sound Effects
- **Objective:** Verify built-in arena sounds without external MP3 files.
- **Test Steps:**
  1. Turn on audio by clicking the speaker icon in the header (if muted).
  2. In the Umpire Console:
     - Score a regular point &rarr; Listen for **Point Chime**.
     - Reach 14-14 score &rarr; Listen for **Deuce Alert**.
     - Reach Game Point (14 points) &rarr; Listen for **Rising Arpeggio**.
     - Conclude the match &rarr; Listen for **Victory Fanfare**.
- **Expected Result:**
  - Sound effects play crisply through the device speakers.
  - Sounds function even in full offline mode (zero external audio downloads).
  - `[Pass / Fail]`

---

### TC-29: Victory Confetti Celebration
- **Objective:** Verify visual celebration effects upon match completion.
- **Test Steps:**
  1. Conclude any match on any court.
- **Expected Result:**
  - Multi-colored confetti particles explode across the screen.
  - Match details update in the **Hall of Fame** tab.
  - `[Pass / Fail]`

---

## TS-11: Automated Rally Simulator

### TC-30: 1-Click Hands-Free Demo Simulation
- **Objective:** Test end-to-end automated tournament operation without manual scoring.
- **Test Steps:**
  1. Ensure at least one match is ongoing (or start matches on Courts 1 to 6).
  2. Click the **"Simulate Live Rallies"** button in the header (Flame icon).
  3. Watch the 6-court Arena view for 30–60 seconds.
- **Expected Result:**
  - Ongoing matches randomly receive points automatically.
  - Deuces trigger naturally.
  - Completed matches trigger confetti, finish, and the next match starts.
  - Standings and Brackets update dynamically in real time.
  - Clicking the flame button again stops the simulation.
  - `[Pass / Fail]`

---

## Test Execution Sign-Off Template

```text
Tournament Name: _____________________________________________
Date of Execution: ___________________________________________
Tested by: ___________________________________________________
Total Test Cases: 30
Passed: [   ]   Failed: [   ]   Blocked: [   ]

Notes / Observations:
______________________________________________________________
______________________________________________________________
```
