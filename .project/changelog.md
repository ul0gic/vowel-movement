# Vowel Movement - Changelog

> **Document Location:** `.project/changelog.md`
>
> All notable changes to this project will be documented in this file.
> Format based on [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added
- Nothing yet

### Changed
- Nothing yet

### Fixed
- Nothing yet

---

## [1.0.0] - 2026-01-28

### Added
- **Phase 9: Testing & Launch Complete - PRODUCTION RELEASE**

- Created `src/game/utils/debug.ts` - Full debug overlay and cheat code system:
  - DebugOverlay class with FPS counter (rolling average, color-coded)
  - Full game state display (scene, phase, score, phrase, guessed letters)
  - Cheat codes via Shift+key keyboard shortcuts (dev mode only):
    - Shift+F: Toggle FPS counter
    - Shift+D: Toggle debug overlay
    - Shift+P: Add 1000 points
    - Shift+R: Reveal all letters
    - Shift+S: Auto-solve puzzle
    - Shift+N: Load next phrase
    - Shift+M: Toggle audio mute
    - Shift+1/2/3: Jump to Menu/Game/GameOver scenes
  - installDebugOverlay() helper for scene integration
  - All features gated behind import.meta.env.DEV

- Created `src/game/systems/SaveSystem.ts` - Centralized persistence:
  - Singleton pattern with getSaveSystem() accessor
  - High score save/load with localStorage
  - Settings persistence (mute state survives page reload)
  - Game statistics tracking (games played, total cumulative score)
  - localStorage availability check with graceful fallback
  - Namespaced keys (vowelMovement_ prefix)
  - clearAll() for factory reset

- Integrated debug overlay into GameScene:
  - FPS counter and state display available during gameplay
  - debugNextPhrase event for cheat-triggered phrase loading
  - Proper cleanup on scene shutdown

- Integrated SaveSystem into BootScene and GameScene:
  - BootScene loads high score and mute state from SaveSystem on boot
  - GameScene saves high score, total score, and games played on game end
  - Replaced raw localStorage calls with SaveSystem singleton

### Changed
- **Bundle Optimization:**
  - Split Phaser into dedicated vendor chunk for cache efficiency
  - Game code: 79.65 KB (21.64 KB gzipped) - well under 500KB target
  - Phaser vendor: 1,208 KB (330 KB gzipped) - cached separately
  - Suppressed chunk size warning for Phaser vendor bundle
  - Added rollupOptions.output.manualChunks to vite.config.ts

- **index.html Enhanced:**
  - Added Open Graph meta tags (og:title, og:description, og:image, og:type)
  - Added Twitter Card meta tags (twitter:card, twitter:title, twitter:description)
  - Added theme-color meta tag (#0D0D1A)
  - Added mobile web app meta tags (apple-mobile-web-app-capable)
  - Added viewport meta with user-scalable=no for game experience
  - Created SVG favicon (neon "V" on dark background)

- **vite.config.ts:**
  - Added chunkSizeWarningLimit: 1300
  - Added manualChunks for Phaser vendor splitting

### Technical Details
- Final production build: 2 JS chunks + 1 CSS + 1 HTML + 1 favicon
- Game code (excluding Phaser): 79.65 KB minified, 21.64 KB gzipped
- Phaser vendor: 1,208 KB minified, 330 KB gzipped
- Zero TypeScript errors, zero ESLint errors
- Clean production build with no warnings
- All 121 build plan tasks completed (100%)

---

## [0.8.0] - 2026-01-28

### Added
- **Phase 8: Polish & Audio Complete**
- Created `src/game/systems/AudioSystem.ts` - Procedural audio via Web Audio API:
  - AudioContext initialization on first user interaction (browser requirement)
  - ADSR envelope implementation for all sounds
  - Oscillator-based sound generation (sine, square, sawtooth, triangle)
  - Frequency ramping for sweeping sounds
  - Arpeggio support for multi-note sequences
  - Master volume control and mute functionality
  - Sound methods: playWheelTick, playLetterReveal, playCorrectGuess, playWrongGuess,
    playWinFanfare, playBankrupt, playUIClick, playVowelPurchase, playLoseTurn, playFreeSpin

- Created `src/game/config/AudioConfig.ts` - Sound parameters configuration:
  - SoundConfig interface with frequency, type, volume, duration, envelope, frequencyRamp
  - ArpeggioConfig interface for multi-note sequences
  - EnvelopeConfig interface for ADSR (attack, decay, sustain, release)
  - Pre-configured sounds: wheel tick, letter reveal, correct/wrong guess, win fanfare,
    bankrupt (rumble + sweep), UI click, vowel purchase, lose turn, free spin

- Created `src/game/systems/ParticleSystem.ts` - Particle effects system:
  - Singleton pattern for global access
  - Confetti burst for wins (80 particles, 6 colors)
  - Sparkle effect for reveals (30 particles)
  - Explosion effect for bankrupt (40 particles)
  - Score popup particles (15 rising particles)
  - Celebration shower (multi-point confetti from top)
  - Rising star particles for milestones
  - Automatic cleanup on scene change

### Changed
- **Visual Polish - Critical Fixes:**
  - Increased wheel radius from 140px to 240px (71% larger)
  - Repositioned game elements for larger wheel (wheel at 280,380)
  - Added resolution: 2 to all text objects for crisp rendering
  - Updated font sizes for wheel labels (11px to 16px)

- **Neon Trash Color Palette:**
  - Primary: #FF00FF (hot pink/magenta)
  - Secondary: #00FFFF (electric cyan)
  - Accent: #FFE600 (neon yellow)
  - Background: #0D0D1A (deep dark blue)
  - Added new colors: tileHidden (#6A0DAD), tileRevealed (#FFFFFF), tileBorder (#FFD700)
  - Added glow colors for effects: glowPink, glowCyan, glowYellow, glowWhite

- **Enhanced Animations:**
  - Added anticipation (squish) before tile flip
  - Changed scale punch to use Elastic.easeOut for bounce feel
  - Enhanced wheel landing animation with Elastic.easeOut
  - Increased animation scale punch from 1.15 to 1.2

- **Game Feel Improvements:**
  - Screen shake on BANKRUPT: increased intensity to 0.035, duration to 600ms
  - Added hit pause (50-80ms freeze) before BANKRUPT feedback
  - Particle explosions on BANKRUPT from wheel center
  - Celebration shower on round win
  - Wheel tick sound pitch varies with spin speed

### Technical Details
- Build output: ~1.29MB (Phaser library + audio system)
- Zero audio files needed - all sounds generated procedurally
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- AudioSystem lazy initializes on first user interaction
- ParticleSystem uses Graphics objects for cross-browser compatibility

---

## [0.7.0] - 2026-01-27

### Added
- **Phase 7: Data & Content Complete**
- Created `src/game/data/categories.ts` - Category definitions:
  - 10 adult/irreverent categories from PRD
  - Category constant object with display names
  - CategoryType type derived from Category values
  - ALL_CATEGORIES array for iteration
  - CategoryInfo interface with description and color hint
  - CATEGORY_INFO record with extended metadata per category

- Categories implemented:
  - Things You Shout During Sex
  - Florida Man Headlines
  - Horrible Life Advice
  - Things Your Mother-in-Law Says
  - Embarrassing Medical Conditions
  - Drunken Confessions
  - Regrettable Tattoo Ideas
  - Things Found in a Porta-Potty
  - Bad Excuses for Being Late
  - Phrases That Sound Dirty But Aren't

- Created `src/game/data/phrases.ts` - Phrase database:
  - 70 phrases across all 10 categories (7 per category base + 10 bonus)
  - All phrases uppercase, max 52 characters for board fit
  - Adult/vulgar but R-rated, not X-rated
  - Funny, irreverent, surprising content
  - Helper functions: getPhraseCount(), getPhrasesByCategory()
  - Utility functions: getCategoryDistribution(), validatePhraseLength(), getOversizedPhrases()

- Added Phrase types to `src/game/data/types.ts`:
  - Phrase interface: { phrase: string, category: CategoryType }
  - PhraseSelection interface: { phrase: Phrase, index: number }

- Expanded `src/game/utils/random.ts` with full phrase selection system:
  - shuffleArray() and shuffled() for array manipulation
  - WeightedItem interface for weighted random selection
  - weightedRandom() for single weighted item selection
  - weightedRandomMultiple() for multiple unique selections
  - PhraseManager class for session-aware phrase selection:
    - No repeat phrases within a session
    - Optional category filtering
    - Optional weighted selection by category
    - Automatic reset when all phrases exhausted
    - Methods: getRandomPhrase(), resetSession(), markPhraseUsed()
    - Tracking: getUsedCount(), getRemainingCount(), getTotalCount(), isExhausted()
  - Global singleton: getPhraseManager(), resetPhraseManager()

- Integrated phrase system into GameScene:
  - Replaced hardcoded TEST_PHRASES with PhraseManager
  - Random phrase selection on scene init
  - Session tracking prevents repeats
  - "Next Phrase" debug button loads from PhraseManager
  - Console logging in dev mode shows phrase and remaining count

- Updated MenuScene to reset PhraseManager on game start:
  - resetPhraseManager() called when starting new game
  - Ensures fresh phrase pool for each game session

### Technical Details
- Build output: ~1.28MB (Phaser library dominates size)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- 70 phrases provides ~70 rounds before any repeats
- Balanced distribution: 6-8 phrases per category
- PhraseManager uses Set for O(1) used phrase lookup

---

## [0.6.0] - 2026-01-27

### Added
- **Phase 6: Input & UI Complete**
- Created `src/game/entities/Keyboard/Keyboard.ts` - On-screen letter picker:
  - Consonants displayed in two rows (10 + 11 letters)
  - Vowels displayed in separate bottom row
  - Visual feedback on hover/press with scale animations
  - Disabled state for already-guessed letters (grayed out, non-interactive)
  - Vowel cost display ($250) on each vowel key
  - Different styling for consonants (blue) vs vowels (purple)
  - Methods: disableLetter(), disableLetters(), enableLetter(), resetAllLetters()
  - Methods: setEnabled(), setAllowedTypes(), triggerKeyPress()
  - Events: LETTER_SELECTED emitted with letter and isVowel data

- Created `src/game/entities/Keyboard/Keyboard.animations.ts` - Keyboard animations:
  - Key press animation (scale down 0.92)
  - Key reset animation (scale back with Back easing)
  - Key success animation (pulse scale 1.1)
  - Key error animation (horizontal shake)
  - Keyboard entry animation (fade in + slide up)
  - Keyboard exit animation (fade out + slide down)

- Created `src/game/systems/InputSystem.ts` - Centralized input handling:
  - Physical keyboard support (A-Z keys for letter selection)
  - Enter key for solve modal trigger
  - Escape key for cancel operations
  - Game phase awareness (blocks input during inappropriate phases)
  - Event emission for letter presses (LETTER_PRESSED, INPUT_BLOCKED)
  - Unified interface for on-screen and physical keyboard input

- Created `src/game/ui/components/ScoreDisplay.ts` - Animated score counter:
  - Count-up/count-down animation on score change
  - Color flash feedback (green for gain, red for loss)
  - Scale punch effect on change
  - Formatted number display with thousands separators ($1,000)
  - Label support with customizable text

- Created `src/game/ui/components/Button.ts` - Reusable button component:
  - Hover and press states with visual feedback
  - Customizable colors (fill, stroke, text)
  - Disabled state support
  - Scale animations on interaction
  - Click callback and event emission
  - Entry animation support

- Created `src/game/ui/layouts/HUDLayout.ts` - HUD layout manager:
  - Score display in top-left corner
  - Solve button in bottom-right corner
  - Feedback message display (centered, animated)
  - Solve modal with text input:
    - DOM input for keyboard capture
    - Submit and Cancel buttons
    - Cursor blink animation
    - Enter/Escape key support
  - Methods: updateScore(), showMessage(), hideMessage()
  - Methods: openSolveModal(), closeSolveModal(), setSolveEnabled()

- Updated UIScene to use HUDLayout:
  - Integrated HUDLayout for all HUD elements
  - Score updates via registry change listener
  - Message display via UIEvents
  - Solve modal integration with GameScene

- Updated GameScene with keyboard integration:
  - On-screen Keyboard entity (positioned below phrase board)
  - InputSystem for physical keyboard handling
  - Keyboard state updates based on game phase
  - Letter input routing to GameStateSystem
  - Keyboard visual feedback for all letter guesses
  - Solve modal trigger via Enter key
  - Removed old debug letter buttons (replaced by real keyboard)

### Technical Details
- Build output: ~1.27MB (mostly Phaser library)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- Keyboard integrated with game phase system
- Physical keyboard input respects game state
- Solve modal uses hidden DOM input for text capture
- All components use design system tokens for styling

---

## [0.5.0] - 2026-01-27

### Added
- **Phase 5: Game Logic Complete**
- Created `src/game/systems/GameStateSystem.ts` - Full turn state machine:
  - Game phases: IDLE, SPINNING, GUESSING, BUYING_VOWEL, SOLVING, ROUND_OVER
  - Phase transitions with validation guards
  - Letter tracking (consonants and vowels stored separately)
  - Win condition detection (all letters revealed or correct solve)
  - Event emission for all state changes
  - Methods: startSpin(), wheelStopped(), guessConsonant(), buyVowel(), attemptSolve()
  - Accessors: getPhase(), getScore(), canSpin(), canGuess(), canBuyVowel(), canSolve()

- Created `src/game/systems/ScoreSystem.ts` - Score tracking and utilities:
  - Score management (add, deduct, reset)
  - High score persistence to localStorage
  - Milestone tracking (1000, 2500, 5000, 10000, 25000, 50000, 100000)
  - Score calculations for consonant guesses (wedge value x letter count)
  - Vowel purchase cost management (250 points)
  - Event emission for score changes and milestones

- Expanded `src/game/data/types.ts` with comprehensive game types:
  - GamePhase type with all valid phases
  - GameState interface with full state snapshot
  - GuessResult interface for letter guess outcomes
  - SolveResult interface for solve attempt outcomes
  - GuessedLetters interface for tracking guessed letters
  - GameAction discriminated union for all game actions
  - GameStateEvents interface for event payloads
  - TransitionError and TransitionResult types for validation

- Implemented all scoring rules:
  - Consonant guess: score += wedge_value x letter_count
  - Vowel purchase: score -= 250 to reveal vowel
  - BANKRUPT: score reset to 0, lose turn
  - LOSE A TURN: back to IDLE state
  - FREE SPIN: token added, can use after wrong guess
  - Wrong guess: lose turn (back to IDLE)
  - Solve attempt: win if correct, lose turn if wrong

- Integrated GameStateSystem into GameScene:
  - Status display below wheel showing current phase
  - Wedge value display during GUESSING phase
  - UIScene message integration for feedback
  - Screen shake on BANKRUPT
  - Auto-transition to GameOver after win
  - Debug buttons for consonant and vowel testing

- Added new game state events:
  - PHASE_CHANGE: When game phase transitions
  - SCORE_CHANGE: When score is modified
  - LETTER_GUESSED: Result of letter guess
  - VOWEL_PURCHASED: When vowel is bought
  - BANKRUPT: When bankrupt wedge hit
  - LOSE_TURN: When turn ends (with reason)
  - FREE_SPIN_EARNED/USED: Free spin token events
  - ROUND_WON: When puzzle is solved
  - SOLVE_ATTEMPTED: Result of solve attempt

### Technical Details
- Build output: ~1.26MB (mostly Phaser library)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- State machine prevents invalid transitions
- All game rules from PRD implemented
- Event-driven architecture for loose coupling

---

## [0.4.0] - 2026-01-27

### Added
- **Phase 4: The Phrase Board Complete**
- Created `src/game/entities/PhraseBoard/LetterTile.ts` - Individual letter tile component:
  - Three tile types: letter (revealable), punctuation (always visible), space (invisible)
  - Visual styling with neon trash aesthetic (magenta unrevealed, white revealed)
  - Gold border with rounded corners
  - Glow effect graphics for reveal animation
  - Flip animation support with scaleX transformation
  - Methods: reveal(), hasLetter(), redrawBackground()
  - Exposes internal components for animation access

- Created `src/game/entities/PhraseBoard/PhraseBoard.ts` - Main phrase board container:
  - Dynamic grid layout based on phrase length
  - Multi-word phrase handling with word wrapping (max 14 chars per row, 4 rows)
  - Automatic row centering for visual balance
  - Category label displayed above the board
  - Background panel with surface color and primary border
  - Methods: setPhrase(), revealLetter(), revealAll(), isComplete()
  - Helper methods: hasLetter(), isLetterRevealed(), getRevealedLetters(), getUnrevealedCount()

- Created `src/game/entities/PhraseBoard/PhraseBoard.animations.ts` - Animation utilities:
  - Flip reveal animation with scaleX tween (0 -> 1 with midpoint color change)
  - Staggered multi-tile reveals (left-to-right order)
  - Scale punch effect on reveal completion (1.15x bounce)
  - Glow effect fade in/out on reveal
  - Celebration particle burst on solve (50 particles, multiple colors)
  - Pitched sound placeholders (will integrate with AudioSystem in Phase 8)
  - Board entry/exit animations (slide + fade)
  - Wrong guess shake animation
  - Tile highlight/unhighlight for hints

- Integrated PhraseBoard into GameScene:
  - Board positioned on right side of screen (760, 200)
  - Entry animation on scene creation
  - Test phrases for development (7 vulgar example phrases)
  - Debug buttons for letter reveal testing (E, A, S, T, R, I, N, O)
  - SOLVE button to reveal all remaining letters
  - NEXT button to cycle through test phrases
  - GameEvents.LETTER_REVEALED and LETTER_GUESSED events

- Added new game events:
  - LETTER_REVEALED: Emitted when letters are revealed with count
  - Updated PHRASE_SOLVED event integration

### Technical Details
- Build output: ~1.2MB (mostly Phaser library)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- Word wrapping algorithm prevents mid-word breaks
- Tile indexing preserved for staggered animation ordering
- Celebration particles use simple Graphics objects (proper particle system in Phase 8)

---

## [0.3.0] - 2026-01-27

### Added
- **Phase 3: The Wheel Complete**
- Created `src/game/entities/Wheel/Wheel.ts` - Main wheel game object extending Phaser.GameObjects.Container:
  - 24 colorful wheel segments drawn with Phaser Graphics
  - Wedge labels with point values (100-1000) and special wedges (BANKRUPT x2, LOSE A TURN, FREE SPIN)
  - Center hub with gold styling and highlight effect
  - Outer rim with gold border and accent ring
  - Red triangular pointer at top (stationary, doesn't rotate with wheel)
  - Click/tap interaction to trigger spin
  - Emits GameEvents.WHEEL_SPIN and GameEvents.WHEEL_LANDED events
- Created `src/game/data/wheelSegments.ts` with wedge configuration:
  - WheelWedge interface with id, type, value, label, color, textColor
  - 24 wedges with varied point values and special segments
  - Color palette for visual variety (blue, pink, green, purple, orange, etc.)
  - WHEEL_SEGMENT_COUNT, SEGMENT_ANGLE, SEGMENT_ANGLE_DEG constants
- Created `src/game/entities/Wheel/Wheel.physics.ts` for spin mechanics:
  - Physics-based deceleration (NOT just tweens)
  - Friction-based slowdown with frame-rate independence
  - Multi-phase friction: normal -> final -> low speed for dramatic slowdown
  - Minimum rotation requirement before stopping
  - Random initial velocity generation (15-30 radians/second)
  - Landing segment calculation based on wheel rotation
- Created `src/game/entities/Wheel/Wheel.animations.ts` for visual feedback:
  - Tick animation on pointer when crossing segment boundaries
  - Velocity-based tick intensity (faster spin = stronger tick)
  - Landing celebration animation (scale punch with Back easing)
- Updated `src/game/data/types.ts` with wheel-related types:
  - WedgeResult interface
  - WheelState type (idle, spinning, slowing, stopped)
  - WheelSpinEvent and WheelLandEvent interfaces
- Integrated wheel into GameScene:
  - Wheel positioned on left side of screen
  - Wheel update called each frame for physics simulation
  - Event listeners for wheel spin and landing
  - "Click wheel to spin!" instruction text

### Technical Details
- Build output: ~1.2MB (mostly Phaser library)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- Physics simulation runs at frame-rate independent speed
- Wheel completes 3+ rotations before stopping for satisfying spin feel

---

## [0.2.0] - 2026-01-27

### Added
- **Phase 2: Core Game Framework Complete**
- Created `src/main.ts` entry point that initializes Phaser game
- Created `src/game/config/GameConfig.ts` with full Phaser configuration:
  - WebGL renderer with Canvas fallback (Phaser.AUTO)
  - 16:9 aspect ratio (1280x720 base resolution)
  - Responsive scaling with FIT mode and CENTER_BOTH
  - Min/max resolution bounds (640x360 to 1920x1080)
  - 60fps target with anti-aliased rendering
  - Keyboard, mouse, and touch input enabled
  - Scene keys exported for type-safe transitions
- Created `src/game/data/constants.ts` with comprehensive game constants:
  - Game dimensions and scale limits
  - Gameplay rules (VOWEL_COST, VOWELS, CONSONANTS)
  - Wheel configuration (segments, spin timing)
  - Phrase board settings (max chars, tile sizes)
  - Animation timing values
  - Screen shake intensities
  - Depth/z-ordering constants
- Created all core scenes:
  - `BootScene.ts` - System initialization, loads high score from localStorage
  - `PreloadScene.ts` - Asset loading with animated progress bar
  - `MenuScene.ts` - Title screen with animated title, Play button, high score display
  - `GameScene.ts` - Main gameplay skeleton with placeholder areas for wheel/board/keyboard
  - `UIScene.ts` - HUD overlay with animated score display and message system
  - `GameOverScene.ts` - Results screen with score animation, new high score detection, Play Again/Menu buttons
- Implemented complete scene transition flow:
  - Boot -> Preload -> Menu (with fade transitions)
  - Menu -> Game + UI (parallel scenes launched together)
  - Game -> GameOver (stops UI scene)
  - GameOver -> Game + UI (play again) or Menu (return)
- Added animated UI elements:
  - Title text with bounce/float animations
  - Button hover effects with scale tweens
  - Score count-up animations
  - Fade transitions between all scenes
- Exposed game instance for debugging in development mode

### Technical Details
- Build output: ~1.2MB (mostly Phaser library)
- Clean builds with zero TypeScript errors
- Clean lint with zero ESLint errors
- All scenes properly typed with Phaser types
- Registry used for cross-scene data (score, highScore)

---

## [0.1.0] - 2025-01-27

### Added
- **Phase 1: Project Setup Complete**
- Initialized project with Vite + vanilla TypeScript template
- Installed Phaser 3 (v3.90.0) as game framework
- Installed and configured development tooling:
  - ESLint with TypeScript and Perfectionist plugins
  - Prettier for code formatting
  - TypeScript strict mode enabled
- Created full project scaffold following domain-based architecture:
  - `src/game/config/` - Game configuration files
  - `src/game/scenes/` - Phaser scene placeholders
  - `src/game/entities/` - Game object placeholders (Wheel, PhraseBoard, Keyboard)
  - `src/game/systems/` - Game system placeholders
  - `src/game/ui/` - UI component and layout placeholders
  - `src/game/data/` - Game data files (types, constants, phrases, etc.)
  - `src/game/utils/` - Utility functions (math, random, timing, debug)
  - `src/design-system/` - Design tokens and styles
  - `public/assets/` - Asset directory structure for sprites, audio, fonts
- Created configuration files:
  - `tsconfig.json` with strict mode and path aliases
  - `eslint.config.js` with TypeScript + Perfectionist rules
  - `.prettierrc` with formatting rules
  - `vite.config.ts` with path aliases and build options
  - `.gitignore` for Node.js/TypeScript projects
- Added npm scripts: dev, build, preview, typecheck, lint, lint:fix, format, format:check, check

### Technical Details
- Build output: ~1.8KB total (0.49KB HTML, 0.49KB CSS, 0.86KB JS)
- All builds pass clean with zero warnings
- All lint checks pass clean
- TypeScript strict mode with `noUncheckedIndexedAccess` enabled

---

## Version Guidelines

### Version Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes or significant milestones
- **MINOR**: New features, completed phases
- **PATCH**: Bug fixes, small improvements

### Change Types

| Type | Description |
|------|-------------|
| **Added** | New features or capabilities |
| **Changed** | Changes to existing functionality |
| **Deprecated** | Features marked for removal |
| **Removed** | Features that were removed |
| **Fixed** | Bug fixes |
| **Security** | Security-related changes |

---

## Milestones

| Version | Milestone | Date |
|---------|-----------|------|
| 1.0.0 | Production Release | 2026-01-28 |
| 0.8.0 | Polish & Audio | 2026-01-28 |
| 0.7.0 | Data & Content | 2026-01-27 |
| 0.6.0 | Input & UI | 2026-01-27 |
| 0.5.0 | Game Logic | 2026-01-27 |
| 0.4.0 | The Phrase Board | 2026-01-27 |
| 0.3.0 | The Wheel | 2026-01-27 |
| 0.2.0 | Core Game Framework | 2026-01-27 |
| 0.1.0 | Project Setup | 2026-01-27 |

---

*Last updated: 2026-01-28*
