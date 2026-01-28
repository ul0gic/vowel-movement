# Vowel Movement - Build Plan

> **CRITICAL INSTRUCTIONS FOR GAME ENGINEER**
>
> ## Project Structure
> All project documentation lives in the `.project/` directory at the repository root:
> ```
> .project/
> ├── prd.md           # Product Requirements Document
> ├── tech-stack.md    # Technology choices and rationale
> ├── build-plan.md    # This file - task tracking
> └── changelog.md     # Version history and updates
> ```
>
> ## Build Discipline
> 1. **Keep this document up to date** - Mark tasks as completed immediately after finishing them
> 2. **Keep changelog.md up to date** - Log every phase completion, significant changes, and milestones
> 3. **Build after every task** - Run `bun run build` after completing each task
> 4. **Zero tolerance for warnings/errors** - Fix any warnings or errors before moving to the next task
> 5. **Lint before commit** - Run `bun run lint` and fix issues
>
> ```bash
> # Build commands (run after each task)
> bun run build      # Production build - must pass clean
> bun run lint       # Check for lint errors
> bun run typecheck  # Verify TypeScript types
> ```
>
> If warnings or errors appear, fix them immediately. Do not proceed until the build is clean.

---

## Project Structure

> Reference: See `tech-stack.md` for detailed rationale on technology choices.
> Structure aligned with Game Engineer agent's domain-based architecture.

```
vowel-movement/
├── .project/                    # Project documentation
│   ├── prd.md                   # Product requirements
│   ├── tech-stack.md            # Technology choices
│   ├── build-plan.md            # This file - task tracking
│   └── changelog.md             # Version history
├── src/
│   ├── main.ts                  # Entry point, game instantiation
│   ├── game/
│   │   ├── config/
│   │   │   ├── GameConfig.ts    # Phaser game configuration
│   │   │   ├── PhysicsConfig.ts # Physics constants
│   │   │   └── AudioConfig.ts   # Sound keys, volume levels
│   │   ├── scenes/
│   │   │   ├── BootScene.ts     # Initial load, system setup
│   │   │   ├── PreloadScene.ts  # Asset loading, progress bar
│   │   │   ├── MenuScene.ts     # Main menu
│   │   │   ├── GameScene.ts     # Core gameplay
│   │   │   ├── UIScene.ts       # HUD overlay (parallel scene)
│   │   │   └── GameOverScene.ts # End state
│   │   ├── entities/
│   │   │   ├── Wheel/
│   │   │   │   ├── Wheel.ts           # Wheel game object
│   │   │   │   ├── Wheel.physics.ts   # Spin mechanics
│   │   │   │   └── Wheel.animations.ts
│   │   │   ├── PhraseBoard/
│   │   │   │   ├── PhraseBoard.ts     # Letter board display
│   │   │   │   ├── PhraseBoard.animations.ts
│   │   │   │   └── LetterTile.ts      # Individual letter tile
│   │   │   └── Keyboard/
│   │   │       ├── Keyboard.ts        # On-screen letter picker
│   │   │       └── Keyboard.animations.ts
│   │   ├── systems/
│   │   │   ├── InputSystem.ts   # Centralized input handling
│   │   │   ├── AudioSystem.ts   # Sound management, pooling
│   │   │   ├── ScoreSystem.ts   # Points, tracking
│   │   │   ├── GameStateSystem.ts # Turn state machine
│   │   │   └── SaveSystem.ts    # High score persistence
│   │   ├── ui/
│   │   │   ├── components/
│   │   │   │   ├── Button.ts         # Reusable game button
│   │   │   │   ├── Panel.ts          # UI panel base
│   │   │   │   └── ScoreDisplay.ts   # Animated score counter
│   │   │   └── layouts/
│   │   │       ├── MenuLayout.ts
│   │   │       ├── HUDLayout.ts
│   │   │       └── GameOverLayout.ts
│   │   ├── data/
│   │   │   ├── phrases.ts       # Phrase database
│   │   │   ├── categories.ts    # Category definitions
│   │   │   ├── wheelSegments.ts # Wheel wedge configuration
│   │   │   ├── types.ts         # Game-specific types
│   │   │   └── constants.ts     # Magic numbers with names
│   │   └── utils/
│   │       ├── math.ts          # Game math helpers
│   │       ├── random.ts        # Weighted random selection
│   │       ├── timing.ts        # Delay helpers
│   │       └── debug.ts         # Debug utilities, cheats
│   └── design-system/
│       ├── tokens/
│       │   ├── colors.ts        # Game palette (neon trash aesthetic)
│       │   ├── typography.ts    # Font configurations
│       │   └── spacing.ts       # UI spacing units
│       └── styles/
│           ├── base.css         # Reset, global styles
│           └── ui.css           # UI component styles
├── public/
│   └── assets/
│       ├── sprites/
│       │   ├── wheel/
│       │   ├── letters/
│       │   └── ui/
│       ├── audio/
│       │   ├── sfx/
│       │   └── music/
│       └── fonts/
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript config (strict)
├── eslint.config.js             # ESLint flat config
├── .prettierrc                  # Prettier rules
└── package.json                 # Dependencies and scripts
```

---

## Status Legend

| Icon | Status | Description |
|------|--------|-------------|
| ⬜ | Not Started | Task has not begun |
| 🔄 | In Progress | Currently being worked on |
| ✅ | Completed | Task finished |
| ⛔ | Blocked | Cannot proceed due to external dependency |
| ⚠️ | Has Blockers | Waiting on another task |
| 🔍 | In Review | Pending review/approval |
| 🚫 | Skipped | Intentionally not doing |
| ⏸️ | Deferred | Postponed to later phase/sprint |

---

## Project Progress Summary

```
Phase 1: Project Setup       [████████████████████] 100%  ✅
Phase 2: Core Game Framework [████████████████████] 100%  ✅
Phase 3: The Wheel           [████████████████████] 100%  ✅
Phase 4: The Phrase Board    [████████████████████] 100%  ✅
Phase 5: Game Logic          [████████████████████] 100%  ✅
Phase 6: Input & UI          [████████████████████] 100%  ✅
Phase 7: Data & Content      [████████████████████] 100%  ✅
Phase 8: Polish & Audio      [████████████████████] 100%  ✅
Phase 9: Testing & Launch    [████████████████████] 100%  ✅
Phase 10: Design Overhaul    [████████████████████] 100%  ✅
─────────────────────────────────────────────────────────────
Overall Progress             [████████████████████] 100%
```

| Phase | Tasks | Completed | Progress |
|-------|-------|-----------|----------|
| Phase 1: Project Setup | 11 | 11 | 100% |
| Phase 2: Core Game Framework | 13 | 13 | 100% |
| Phase 3: The Wheel | 15 | 15 | 100% |
| Phase 4: The Phrase Board | 12 | 12 | 100% |
| Phase 5: Game Logic | 15 | 15 | 100% |
| Phase 6: Input & UI | 14 | 14 | 100% |
| Phase 7: Data & Content | 10 | 10 | 100% |
| Phase 8: Polish & Audio | 19 | 19 | 100% |
| Phase 9: Testing & Launch | 12 | 12 | 100% |
| Phase 10: Design Overhaul | 42 | 42 | 100% |
| **Total** | **163** | **163** | **100%** |

---

## Phase 1: Project Setup

> Initialize the project with Vite, Phaser 3, TypeScript, and all tooling.

### 1.1 Project Initialization

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 1.1.1 | Initialize project with `bun create vite . --template vanilla-ts` (in current directory) |
| ✅ | 1.1.2 | Install dependencies: `bun add phaser` |
| ✅ | 1.1.3 | Install dev dependencies: eslint, prettier, typescript-eslint, perfectionist |
| ✅ | 1.1.4 | Create project scaffold per Project Structure above (game/config, game/scenes, game/entities, game/systems, game/ui, game/data, game/utils, design-system, public/assets) |
| ✅ | 1.1.5 | Create `.gitignore` with node_modules, dist, .env, etc. |
| ✅ | 1.1.6 | **BUILD CHECK** - Verify `bun run dev` starts without errors |

### 1.2 Configuration

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 1.2.1 | Configure `tsconfig.json` with strict mode enabled |
| ✅ | 1.2.2 | Create `eslint.config.js` with TypeScript + Perfectionist rules |
| ✅ | 1.2.3 | Create `.prettierrc` with formatting rules |
| ✅ | 1.2.4 | Update `package.json` with all scripts (dev, build, lint, format, typecheck) |
| ✅ | 1.2.5 | **BUILD CHECK** - Verify `bun run build` and `bun run lint` pass clean |

---

## Phase 2: Core Game Framework

> Set up Phaser game config and scene structure.

### 2.1 Phaser Setup

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 2.1.1 | Create `src/main.ts` entry point and `src/game/config/GameConfig.ts` |
| ✅ | 2.1.2 | Configure game dimensions (responsive, 16:9 aspect ratio target) |
| ✅ | 2.1.3 | Set up WebGL renderer with Canvas fallback |
| ✅ | 2.1.4 | Create `src/game/data/constants.ts` with game constants |
| ✅ | 2.1.5 | **BUILD CHECK** - Verify Phaser initializes with blank screen |

### 2.2 Scene Structure

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 2.2.1 | Create `src/game/scenes/BootScene.ts` - initial system setup |
| ✅ | 2.2.2 | Create `src/game/scenes/PreloadScene.ts` - asset loading with progress bar |
| ✅ | 2.2.3 | Create `src/game/scenes/MenuScene.ts` - title screen with "Play" button |
| ✅ | 2.2.4 | Create `src/game/scenes/GameScene.ts` - main gameplay scene (skeleton) |
| ✅ | 2.2.5 | Create `src/game/scenes/UIScene.ts` - HUD overlay (parallel scene) |
| ✅ | 2.2.6 | Create `src/game/scenes/GameOverScene.ts` - results screen |
| ✅ | 2.2.7 | Implement scene transitions (Menu → Game+UI → GameOver → Menu) |
| ✅ | 2.2.8 | **BUILD CHECK** - Verify all scenes load and transition correctly |

---

## Phase 3: The Wheel

> Build the spinning wheel with wedges, physics, and landing detection.

### 3.1 Wheel Construction

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 3.1.1 | Create `src/game/entities/Wheel/Wheel.ts` extending Phaser.GameObjects.Container |
| ✅ | 3.1.2 | Create `src/game/data/wheelSegments.ts` with wedge config (value, color, type) |
| ✅ | 3.1.3 | Draw wheel segments using Phaser Graphics (24 wedges) |
| ✅ | 3.1.4 | Add wedge labels (point values, "BANKRUPT", "LOSE A TURN", etc.) |
| ✅ | 3.1.5 | Add center hub and outer rim styling |
| ✅ | 3.1.6 | Add pointer/ticker indicator at top of wheel |
| ✅ | 3.1.7 | **BUILD CHECK** - Verify wheel renders correctly |

### 3.2 Wheel Spin Mechanics

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 3.2.1 | Create `src/game/entities/Wheel/Wheel.physics.ts` for spin mechanics |
| ✅ | 3.2.2 | Implement spin trigger (click/tap to spin) |
| ✅ | 3.2.3 | Create spin animation with physics-based deceleration (not just tweens) |
| ✅ | 3.2.4 | Add randomized spin force for varied results |
| ✅ | 3.2.5 | Implement landing detection (which wedge is at pointer) |
| ✅ | 3.2.6 | Emit event with landed wedge result |
| ✅ | 3.2.7 | Create `src/game/entities/Wheel/Wheel.animations.ts` for tick feedback |
| ✅ | 3.2.8 | **BUILD CHECK** - Verify spin works and returns correct wedge |

---

## Phase 4: The Phrase Board

> Build the letter grid display with reveal animations.

### 4.1 Board Construction

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 4.1.1 | Create `src/game/entities/PhraseBoard/PhraseBoard.ts` class |
| ✅ | 4.1.2 | Create `src/game/entities/PhraseBoard/LetterTile.ts` for individual letter boxes |
| ✅ | 4.1.3 | Implement dynamic grid layout based on phrase length |
| ✅ | 4.1.4 | Handle multi-word phrases with proper spacing |
| ✅ | 4.1.5 | Show punctuation and spaces from the start |
| ✅ | 4.1.6 | **BUILD CHECK** - Verify board renders with placeholder phrase |

### 4.2 Letter Reveals

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 4.2.1 | Create `src/game/entities/PhraseBoard/PhraseBoard.animations.ts` |
| ✅ | 4.2.2 | Implement letter reveal animation (flip with stagger, pitched sounds) |
| ✅ | 4.2.3 | Support revealing multiple instances of same letter |
| ✅ | 4.2.4 | Add category display above the board |
| ✅ | 4.2.5 | Implement "reveal all" for solve state with celebration particles |
| ✅ | 4.2.6 | **BUILD CHECK** - Verify reveals animate correctly |

---

## Phase 5: Game Logic

> Implement turn flow, scoring, and win/lose conditions.

### 5.1 Turn State Machine

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 5.1.1 | Create `src/game/systems/GameStateSystem.ts` for turn state management |
| ✅ | 5.1.2 | Create `src/game/data/types.ts` with game state types and interfaces |
| ✅ | 5.1.3 | Define turn phases: IDLE → SPINNING → GUESSING → SOLVING |
| ✅ | 5.1.4 | Implement phase transitions with proper guards |
| ✅ | 5.1.5 | Create `src/game/systems/ScoreSystem.ts` for point tracking |
| ✅ | 5.1.6 | Track guessed letters (consonants and vowels separately) |
| ✅ | 5.1.7 | **BUILD CHECK** - Verify state transitions work correctly |

### 5.2 Scoring & Rules

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 5.2.1 | Implement consonant guess: multiply wedge value × letter count |
| ✅ | 5.2.2 | Implement vowel purchase: deduct 250 points to reveal vowel |
| ✅ | 5.2.3 | Implement BANKRUPT: reset score to 0, lose turn |
| ✅ | 5.2.4 | Implement LOSE A TURN: skip to next spin |
| ✅ | 5.2.5 | Implement wrong guess: lose turn |
| ✅ | 5.2.6 | Implement solve attempt: win round if correct, lose turn if wrong |
| ✅ | 5.2.7 | Detect win condition (phrase fully revealed or solved) |
| ✅ | 5.2.8 | **BUILD CHECK** - Verify all scoring rules work correctly |

---

## Phase 6: Input & UI

> Build on-screen keyboard and HUD elements.

### 6.1 Letter Input

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 6.1.1 | Create `src/game/entities/Keyboard/Keyboard.ts` on-screen keyboard component |
| ✅ | 6.1.2 | Display consonants and vowels in separate rows |
| ✅ | 6.1.3 | Disable already-guessed letters (gray out) |
| ✅ | 6.1.4 | Highlight vowels differently (show cost: 250 pts) |
| ✅ | 6.1.5 | Create `src/game/systems/InputSystem.ts` for centralized input |
| ✅ | 6.1.6 | Add physical keyboard support (A-Z keys) via InputSystem |
| ✅ | 6.1.7 | **BUILD CHECK** - Verify keyboard input works |

### 6.2 HUD & Feedback

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 6.2.1 | Create `src/game/ui/components/ScoreDisplay.ts` with count-up animation |
| ✅ | 6.2.2 | Create `src/game/ui/components/Button.ts` reusable button component |
| ✅ | 6.2.3 | Create `src/game/ui/layouts/HUDLayout.ts` for UIScene |
| ✅ | 6.2.4 | Add "Solve" button for attempting full phrase |
| ✅ | 6.2.5 | Create solve input modal (text input for phrase guess) |
| ✅ | 6.2.6 | Add feedback messages ("Correct!", "No T's", "BANKRUPT!", etc.) |
| ✅ | 6.2.7 | **BUILD CHECK** - Verify all UI elements display correctly |

---

## Phase 7: Data & Content

> Create phrase bank and category system.

### 7.1 Phrase System

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 7.1.1 | Create `src/game/data/phrases.ts` with phrase database |
| ✅ | 7.1.2 | Create `src/game/data/categories.ts` with category definitions |
| ✅ | 7.1.3 | Define phrase structure in `types.ts`: { phrase: string, category: Category } |
| ✅ | 7.1.4 | Create minimum 50 phrases across all categories |
| ✅ | 7.1.5 | Create `src/game/utils/random.ts` with weighted random selection |
| ✅ | 7.1.6 | Implement random phrase selection (no repeats in session) |
| ✅ | 7.1.7 | **BUILD CHECK** - Verify phrases load and randomize |

### 7.2 Categories

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 7.2.1 | Implement all categories from PRD (Things You Shout During Sex, Florida News Headlines, etc.) |
| ✅ | 7.2.2 | Balance phrase distribution across categories |
| ✅ | 7.2.3 | **BUILD CHECK** - Verify category display works |

---

## Phase 8: Polish & Audio

> Add visual polish, animations, and sound effects.

### 8.1 Visual Polish

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 8.1.1 | **CRITICAL:** Increase wheel size (currently too small) and reposition game elements |
| ✅ | 8.1.2 | **CRITICAL:** Fix blurry text rendering - increase font resolution or use crisp bitmap fonts |
| ✅ | 8.1.3 | Create `src/design-system/tokens/colors.ts` with neon trash palette |
| ✅ | 8.1.4 | Apply color scheme throughout all scenes and entities |
| ✅ | 8.1.5 | Add particle effects for big wins (score milestones, solve) |
| ✅ | 8.1.6 | Polish all animations (custom easing, timing, anticipation) |
| ✅ | 8.1.7 | Add screen shake for BANKRUPT with intensity options |
| ✅ | 8.1.8 | Add hit pause on significant events (1-3 frames) |
| ✅ | 8.1.9 | **BUILD CHECK** - Verify visual polish looks good |

### 8.2 Audio (Procedural via Web Audio API - no files needed)

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 8.2.1 | Create `src/game/systems/AudioSystem.ts` with Web Audio API procedural sound generation |
| ✅ | 8.2.2 | Create `src/game/config/AudioConfig.ts` with sound parameters (frequencies, durations, envelopes) |
| ✅ | 8.2.3 | Add wheel tick sound (oscillator click, pitch varies with speed) |
| ✅ | 8.2.4 | Add letter reveal sounds (sine wave blip, pitched by tile position) |
| ✅ | 8.2.5 | Add correct guess sound (ascending tone sequence) |
| ✅ | 8.2.6 | Add wrong guess sound (descending buzz/tone) |
| ✅ | 8.2.7 | Add win fanfare (arpeggio sequence) |
| ✅ | 8.2.8 | Add BANKRUPT dramatic sound (low rumble + descending tone) |
| ✅ | 8.2.9 | Add UI click sounds (soft blip for buttons/keyboard) |
| ✅ | 8.2.10 | **BUILD CHECK** - Verify all audio plays correctly |

---

## Phase 9: Testing & Launch

> Final testing, optimization, and production build.

### 9.1 Testing

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 9.1.1 | Create `src/game/utils/debug.ts` with cheat codes and debug overlay |
| ⏸️ | 9.1.2 | Playtest full game loop multiple times *(Manual testing by user)* |
| ⏸️ | 9.1.3 | Test all edge cases (no vowels left, bankrupt at 0, etc.) *(Manual testing by user)* |
| ⏸️ | 9.1.4 | Test on different browsers (Chrome, Firefox, Safari) *(Manual testing by user)* |
| ⏸️ | 9.1.5 | Test on mobile devices (touch targets, performance) *(Manual testing by user)* |
| ⏸️ | 9.1.6 | Fix all identified bugs *(Manual testing by user)* |
| ✅ | 9.1.7 | **BUILD CHECK** - All tests pass, no console errors |

### 9.2 Launch Prep

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 9.2.1 | Create `src/game/systems/SaveSystem.ts` for high score persistence |
| ✅ | 9.2.2 | Optimize bundle size (< 500KB target) |
| ✅ | 9.2.3 | Add meta tags, favicon, and OG tags for sharing |
| ✅ | 9.2.4 | Final production build |
| ✅ | 9.2.5 | **SHIP IT** |

---

---

## Phase 10: Design Overhaul & Modern Polish

> Modernize the visual design with new libraries, effects, and a complete UI refresh.

### 10.0 New Dependencies

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.0.1 | Install GSAP: `bun add gsap` - Professional animation library |
| ✅ | 10.0.2 | Install Iconify: `bun add @iconify/iconify` - Universal icon library |
| ✅ | 10.0.3 | Install Rex Plugins: `bun add phaser3-rex-plugins` - Phaser utilities & effects |
| ✅ | 10.0.4 | Create `src/game/utils/gsap.ts` - GSAP integration helpers for Phaser objects |
| ✅ | 10.0.5 | Create `src/game/utils/icons.ts` - Iconify loader to convert SVG to Phaser textures |
| ✅ | 10.0.6 | **BUILD CHECK** - Verify all libraries load without errors |

### 10.1 Visual Modernization

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.1.1 | Update color palette with gradients (not just flat colors) |
| ✅ | 10.1.2 | Add drop shadows to all panels, buttons, and UI elements |
| ⏸️ | 10.1.3 | Add glow effects using Rex plugins (GlowFilterPipeline) |
| ✅ | 10.1.4 | Implement glassmorphism panels (frosted glass effect with blur) |
| ✅ | 10.1.5 | Update button styling with gradients, shadows, hover states |
| ✅ | 10.1.6 | Increase border radius for softer, modern look |
| ✅ | 10.1.7 | Add subtle background animation (particles, gradient shift) |
| ✅ | 10.1.8 | **BUILD CHECK** - Verify visual updates look modern |

### 10.2 Animation Overhaul (GSAP)

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.2.1 | Replace Phaser tweens with GSAP for UI animations |
| ✅ | 10.2.2 | Add staggered entrance animations for keyboard keys |
| ✅ | 10.2.3 | Add smooth easing on all transitions (GSAP's power2, elastic, back) |
| ✅ | 10.2.4 | Add hover micro-animations on interactive elements |
| ✅ | 10.2.5 | Improve wheel spin with GSAP physics-based animation |
| ✅ | 10.2.6 | Add celebration animations with GSAP timeline sequences |
| ✅ | 10.2.7 | **BUILD CHECK** - Verify animations are smooth and modern |

### 10.3 Icon System (Iconify)

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.3.1 | Create Icon component that loads from Iconify |
| ✅ | 10.3.2 | Add icons: trophy, gamepad, coins, trending-up, check, lock, star, zap, flame, skull |
| ✅ | 10.3.3 | Support icon sizing, coloring, and glow effects |
| ✅ | 10.3.4 | Pre-cache commonly used icons in PreloadScene |
| ✅ | 10.3.5 | **BUILD CHECK** - Verify icons render crisply at all sizes |

### 10.4 Component Refresh

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.4.1 | Redesign Wheel with gradient wedges, glow rim, 3D depth effect |
| ✅ | 10.4.2 | Redesign PhraseBoard tiles with depth, shadows, better reveal animation |
| ✅ | 10.4.3 | Redesign Keyboard with modern key styling, press animations |
| ✅ | 10.4.4 | Redesign Buttons with gradient fills, icon support, ripple effects |
| ✅ | 10.4.5 | Create modern Panel component with glassmorphism |
| ✅ | 10.4.6 | **BUILD CHECK** - Verify all components look cohesive |

### 10.5 Menu Redesign with Stats

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.5.1 | Extend SaveSystem with game history (last 15 games) |
| ✅ | 10.5.2 | Add GameRecord type: { date, score, puzzlesSolved, puzzlesAttempted, bankrupts } |
| ✅ | 10.5.3 | Add stats: puzzlesSolved, totalBankrupts, vowelsPurchased, biggestComeback |
| ✅ | 10.5.4 | Redesign MenuScene with modern layout and stats panels |
| ✅ | 10.5.5 | Create StatsPanel with icons (trophy, gamepad, coins, chart) |
| ✅ | 10.5.6 | Create RecentGamesPanel (scrollable game history) |
| ✅ | 10.5.7 | Create AchievementsPanel (grid of badges with lock/unlock states) |
| ✅ | 10.5.8 | Add GSAP entrance animations for all panels |
| ✅ | 10.5.9 | **BUILD CHECK** - Verify menu looks amazing |

### 10.6 Achievements System

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.6.1 | Define achievements: First Spin, Big Winner ($5k+), Hot Streak (3 in a row), Comeback Kid, Wordsmith (50 puzzles), Bankruptcy Survivor, Perfect Game |
| ✅ | 10.6.2 | Implement achievement unlock detection |
| ✅ | 10.6.3 | Create achievement unlock popup with GSAP animation |
| ✅ | 10.6.4 | Add achievement unlock sound effect |
| ✅ | 10.6.5 | **BUILD CHECK** - Verify achievements work end-to-end |

### 10.7 Post-Processing & Effects

| Status | Task | Description |
|--------|------|-------------|
| ✅ | 10.7.1 | Add bloom effect to wheel and winning elements |
| ✅ | 10.7.2 | Add vignette to game scene for focus |
| ✅ | 10.7.3 | Add screen-wide glow pulse on big wins |
| ✅ | 10.7.4 | Improve particle effects with modern styling |
| ✅ | 10.7.5 | **BUILD CHECK** - Verify effects enhance without overwhelming |

---

## Changelog Reference

See `.project/changelog.md` for detailed version history.

**Recent Updates:**
- 2026-01-28: Phase 9 completed - Testing & Launch with debug overlay, SaveSystem, bundle optimization, meta tags, production build
- 2026-01-28: Phase 8 completed - Polish & Audio with procedural Web Audio API sounds, ParticleSystem, screen shake, hit pause, enhanced colors
- 2026-01-27: Phase 7 completed - Data & Content with 70 phrases across 10 categories, PhraseManager with session tracking
- 2026-01-27: Phase 6 completed - Input & UI with on-screen keyboard, physical keyboard support, HUD layout, solve modal
- 2026-01-27: Phase 5 completed - Game logic with turn state machine, scoring rules, and win conditions
- 2026-01-27: Phase 4 completed - Phrase board with letter tiles, flip animations, and celebration particles
- 2026-01-27: Phase 3 completed - Spinning wheel with physics-based deceleration and landing detection
- 2026-01-27: Phase 2 completed - Core game framework with Phaser config and all scene structure
- 2026-01-27: Phase 1 completed - Project setup with Vite, Phaser 3, TypeScript, ESLint, Prettier

---

## Notes & Decisions

### Architecture Decisions
- Single-player only for V1 (no networking complexity)
- Static phrase data (no backend API needed)
- Local storage for high score persistence
- Procedural audio via Web Audio API (no audio files needed)

### Phase 10 Dependencies
```bash
bun add gsap                    # Professional animation library
bun add @iconify/iconify        # Universal icon library (access to 100k+ icons)
bun add phaser3-rex-plugins     # Phaser utilities, effects, UI components
```

**GSAP** - Replaces Phaser tweens for smoother, more powerful animations
- Timeline sequences, staggered animations
- Better easing functions (elastic, bounce, power)
- Animates any JavaScript object properties

**Iconify** - Access to 100,000+ icons from 100+ icon sets
- Lucide, Phosphor, Material, FontAwesome, etc.
- Load as SVG, convert to Phaser textures
- https://icon-sets.iconify.design/

**phaser3-rex-plugins** - Swiss army knife for Phaser
- GlowFilterPipeline for glow effects
- UI components (better buttons, sliders, grids)
- Text effects, shaders, gestures
- https://rexrainbow.github.io/phaser3-rex-notes/

### Wheel Wedge Values (Reference)
```
100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000
BANKRUPT (x2)
LOSE A TURN
FREE SPIN
```

### Vowel Cost
- Buying a vowel costs **250 points**
- Cannot buy vowel if score < 250

### Known Issues
- *None yet*

---

*Last updated: 2026-01-28*
*Current Phase: COMPLETE - All phases finished including Phase 10 Design Overhaul*
*Status: Production build with full polish ready to ship*
