# Carbon Shuttles 🏸

**Simple, Real-Time Badminton Tournament Management & Live Court Scoring**

Welcome to **Carbon Shuttles**! This web application is built to run badminton tournaments with up to **6 physical courts** simultaneously. It replaces slow pen-and-paper clipboards and spreadsheets with an easy-to-use digital scoring pad for court umpires, automatic match scheduling, and a live spectator scoreboard for big screens and smartphones.

---

## 🚀 Quick Start (Run the App in 3 Simple Steps)

You do not need to be a programmer to run this app on your laptop or tablet!

### Step 1: Install Node.js
If you don't already have it, download and install the free, official **Node.js** (LTS version) from [nodejs.org](https://nodejs.org/).

### Step 2: Start the Webapp
Open your computer's terminal or command prompt in this folder, and run:
```bash
# 1. Download necessary packages (only needed the first time)
npm install

# 2. Start the application
npm run dev
```

### Step 3: Open in Your Browser
Open Google Chrome, Microsoft Edge, or Safari and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Passcodes & Default Logins

| Role | Where to Use | Passcode / PIN | Why it is used |
| :--- | :--- | :--- | :--- |
| **Tournament Organizer** | Header &rarr; Admin Login | Username: `admin`<br>Password: `carbonshuttle` | Full supervisor access: court reassignment, finals holding gate, free umpire overrides, backups, and reset. |
| **Court Umpire** | Header &rarr; **Umpire Login** button (or on Court Cards) | Password: `1234` | Authenticates umpire with shared password `1234` and prompts immediate court selection (Courts 1–6). Only 1 umpire is permitted per court to prevent conflicts. |
| **Spectator / Fan** | Any screen | *None needed* | Read-only live broadcast scoreboard and bracket viewing for everyone. |

---

## 📖 How to Use the Webapp (Role-by-Role Guide)

### 👑 1. For Tournament Directors & Organizers

#### A. Starting a New Tournament (Setup Wizard)
1. Go to the **Setup** tab in the top menu.
2. Select any of the 5 official badminton divisions:
   - **Men's Doubles - Class A** (Advanced)
   - **Men's Doubles - Class B** (Intermediate)
   - **Mixed Doubles - Class A** (Advanced)
   - **Mixed Doubles - Class B** (Intermediate)
   - **Women's Doubles - Open**
3. Choose the number of teams participating in each division (e.g., 8, 12, or 16 teams).
4. Feel free to click **Shuffle Names** for auto-generated fun team names or click the pencil icon to type in real team names (e.g. *Hyderabad Smashers*, *Ace Blasters*).
5. Click **"Launch Tournament Schedule"**. The app immediately creates match schedules and groups!

#### B. The "Crowd Retention Gate" (Saving the Best for Last)
- In traditional tournaments, finals often finish too early on an empty court while group matches are still lagging behind.
- Carbon Shuttles features an automatic **Crowd Retention Gate**: it holds all **Semi-Finals and Finals** in reserve until group matches are wrapping up.
- When you are ready for the grand finale, go to the **Organizer** tab and click **"Release Gate"** to send all finals onto courts one after another!

#### C. Moving a Match to Another Court
- If players on Court 2 are delayed or injured, go to the **Organizer** tab, choose the match from **"Manual Court Reassignment"**, pick a new court (e.g. Court 5), and click **Reassign Court**.

#### D. Saving & Backing Up Your Tournament
- Click **"Export Backup (JSON)"** at any time. This downloads a backup file to your computer.
- If your laptop battery dies or you switch devices, click **"Import Backup"** to restore all matches and scores instantly!

---

### ⚖️ 2. For Court Umpires (Tablet Scoring Pad)

Every physical court (Courts 1 through 6) can have a smartphone or tablet running the **Umpire Console**.

1. Click on the **Umpire** tab.
2. Select your court number (for example, tap **C1** for Court 1).
3. **Starting the Match:**
   - When your court is free, the screen shows **"VACANT COURT"** and automatically proposes the next queued match.
   - Call the two teams onto the court.
   - Tap **"Call Teams & Commence Match"**. The live scoreboard begins at **0 - 0**!
4. **Scoring Points:**
   - Tap the big green **"+1 POINT"** button for the team that won the rally.
   - The app plays a crisp arena point sound and updates the score on all screens in the stadium instantly.
5. **Fixed a Mistake?**
   - Simply tap **"Undo Point (-1)"** under that team to correct the score.
6. **Where Should the Server Stand?**
   - The app features a live badminton court diagram that tells the umpire whether the serve is from the **Right** or **Left** service box (based on the official Even/Odd rule).
7. **Deuce & Winning Sets:**
   - Sets are played to **15 points**.
   - If the score reaches **14 - 14**, a golden **DEUCE** banner appears. Play continues until one team leads by 2 points (e.g. 16-14, 17-15), up to a maximum cap of **21 points** (first to 21 wins).
   - When a team wins 2 sets (Best of 3), the match automatically finishes with a confetti celebration!
8. **Spectator Lock (Prevent Tampering):**
   - Tap the **Lock** icon if you need to step away from the tablet. Entering PIN **`1234`** unlocks it.

---

### 📊 3. For Desk Managers & Referees

#### Standings & BWF Tie-Breakers
- Go to the **Standings** tab to see real-time pool rankings.
- If teams are tied in match wins, the app automatically calculates official **BWF Article 16 Tie-Breakers**:
  1. Head-to-head match results between the tied teams.
  2. Game / Set difference (`setsWon - setsLost`).
  3. Point difference (`pointsWon - pointsLost`).
- Teams highlighted in **green** qualify for the knockout playoffs!

#### Knockout Brackets
- Go to the **Brackets** tab to see the tournament tree (Quarterfinals &rarr; Semifinals &rarr; Finals).
- As umpires finish matches, winners automatically advance to the next round with live scores.

---

### 👀 4. For Spectators & Fans

- **Arena View:** Open the **Arena** tab on big venue projectors or TV screens. It shows all 6 courts simultaneously in a clean dark-mode dashboard with live rally scores, current set, and who is serving.
- **Hall of Fame:** Tap the **Hall of Fame** tab to celebrate the gold, silver, and bronze podium winners as divisions conclude.
- **Light / Dark Mode:** Toggle the Sun/Moon icon in the top header depending on whether you are viewing in an outdoor arena or an indoor stadium.

---

## ⚡ Instant Demo: "Simulate Live Rallies" Button

Want to test how everything looks without manually scoring points?
1. Start matches on one or more courts.
2. Click the **Simulate Live Rallies** button (Flame icon 🔥) in the top header.
3. Sit back and watch! The app will simulate live rallies, trigger deuces, conclude sets, sound victory fanfares, and advance teams automatically.
4. You can even adjust the speed from normal to lightning-fast in the Organizer tab!

---

## 🏸 Badminton Rules Used in This Webapp

- **Scoring Format:** Best of 3 sets, played to **15 points** per set.
- **Deuce Advantage Rule:** At 14-14, a 2-point lead is required to win (e.g., 16-14, 18-16).
- **Sudden Death Cap:** At 20-20, the first team to reach **21 points** wins the set immediately.
- **Service Court Rule:**
  - Serving team score is **Even** (0, 2, 4, 6...): Serve is delivered from the **Right** court.
  - Serving team score is **Odd** (1, 3, 5, 7...): Serve is delivered from the **Left** court.
- **Doubles Disciplines:**
  - Men's Doubles Class A (Advanced)
  - Men's Doubles Class B (Intermediate)
  - Mixed Doubles Class A (Advanced)
  - Mixed Doubles Class B (Intermediate)
  - Women's Doubles Open

---

## 🧪 Testing Specification

Looking for step-by-step test instructions?
See our complete **[Test Specification Document (TEST_SPECIFICATION.md)](file:///c:/Users/Abhishek%20Singh/OneDrive/Documents/Google%20Antigravity/CarbonShuttles/TEST_SPECIFICATION.md)** containing 30 structured test cases covering all features:
- Setup & tournament creation
- Live court umpire controls & deuce rules
- Spectator PIN lock & Admin security
- BWF tie-breakers & knockout brackets
- Crowd retention gate
- Offline storage & backup recovery

---

## 💻 For Developers & Technical Architects

<details>
<summary>Click to view Technical Stack & Architecture Details</summary>

- **Framework:** Next.js (App Router, React 19, TypeScript)
- **3D Graphics & GPU Shaders:** Three.js, WebGL2 / WebGPU-ready pipeline with OrbitControls
- **Physics & Ballistics:** Aerodynamic shuttlecock deceleration curves (Smash, Drop, Clear, Drive)
- **Virtual Reality & AR:** WebXR Device API integration for holographic tabletop stadium projection
- **Shaders & FX:** Custom GLSL edge-pulsing ShaderMaterial for Match Point & Deuce drama
- **Styling:** Vanilla CSS & Tailwind CSS v4 with OKLCH color spaces
- **Real-Time Streaming:** Server-Sent Events (SSE) via `/api/matches/stream` with monotonic `Last-Event-ID` tracking and reconnect event replay.
- **Offline Storage:** IndexedDB (`idb`) and localStorage disaster recovery snapshot.
- **Sound Engine:** Zero external audio assets; custom Web Audio API procedural synthesizers for beeps, chimes, and victory fanfares.
- **Celebrations:** `canvas-confetti`
- **Icons:** `lucide-react`

### 3D Features & Controls
- **Virtual 3D Arena:** Orbit, pan, and zoom around all 6 courts in a 3D stadium. Click any court or tap C1–C6 to focus camera directly on that court.
- **Hawk-Eye 3D Review:** Simulates 340+ km/h smashes, drop shots, and clears with motion trails and in/out impact detection.
- **Tactical Service Radar:** Real-time 3D court in Umpire Console displaying legal service boxes (Even=Right, Odd=Left) and Doubles tramlines.
- **3D Trophy Room:** Interactive rotatable gold championship trophy in Hall of Fame with PBR metallic reflections.
- **WebXR Tabletop AR:** Anchor a 1:4 scale interactive badminton court directly in physical space on compatible mobile devices and headsets.

### Production Build
```bash
npm run build
npm run start
```
</details>

---

*Made for the love of badminton 🏸. Enjoy your tournament!*
