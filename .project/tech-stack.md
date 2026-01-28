# Vowel Movement - Tech Stack

> **Document Location:** `.project/tech-stack.md`
>
> Technology choices for a browser-based Wheel of Fortune-style party game.

---

## Stack Overview

```
┌─────────────────────────────────────────────────┐
│                    Game Layer                    │
│         Phaser 3 + TypeScript + Vite            │
├─────────────────────────────────────────────────┤
│                   Browser Runtime                │
│            HTML5 Canvas / WebGL                  │
├─────────────────────────────────────────────────┤
│                    Data Layer                    │
│         Local Storage (scores/progress)          │
│         Static JSON (phrase banks)               │
└─────────────────────────────────────────────────┘
```

---

## Core Technologies

### Language & Runtime

| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | latest | Primary language - type safety, better DX |
| Node.js | 24 | Development tooling only |
| Browser | Modern | Runtime (Chrome, Firefox, Safari, Edge) |

**Rationale:**
- TypeScript catches bugs at compile time, essential for game state management
- No backend needed for V1 - pure client-side game
- Modern browsers have excellent Canvas/WebGL support

---

### Game Framework

| Technology | Version | Purpose |
|------------|---------|---------|
| Phaser 3 | latest | Game framework - rendering, input, scenes, audio |

**Rationale:**
- Industry standard for 2D browser games
- Excellent documentation and community
- Built-in scene management, tweens, physics, input handling
- Handles Canvas/WebGL rendering automatically
- Perfect for the game show aesthetic we need

**Alternatives Considered:**
- PixiJS - Lower level, would need more custom code
- Raw Canvas - Too much boilerplate for this scope
- Three.js - Overkill for 2D game show format

---

### Build System

| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | latest | Dev server, bundling, HMR |

**Rationale:**
- Blazing fast HMR for rapid iteration
- Native ES modules in dev
- Optimized production builds out of the box
- First-class TypeScript support
- Simple configuration

---

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| phaser | latest | Game framework - scenes, sprites, tweens, audio, input |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| vite | latest | Build tool and dev server |
| typescript | latest | Type checking and compilation |
| eslint | latest | Code quality and bug catching |
| @eslint/js | latest | ESLint core rules |
| typescript-eslint | latest | TypeScript-specific linting |
| eslint-plugin-perfectionist | latest | Import/export sorting, consistency |
| prettier | latest | Code formatting |
| eslint-config-prettier | latest | Disable ESLint rules that conflict with Prettier |

---

## Build & Tooling

### Package Manager

| Tool | Version | Purpose |
|------|---------|---------|
| Bun | latest | Fast package manager and runtime |

**Why Bun:**
- Significantly faster installs than npm
- Drop-in npm replacement
- Native TypeScript support
- Same package.json, same node_modules

### Build Commands

```bash
# Install dependencies
bun install

# Development - starts dev server with HMR
bun run dev

# Production build - outputs to dist/
bun run build

# Preview production build locally
bun run preview

# Type checking
bun run typecheck

# Linting
bun run lint

# Format code
bun run format

# Fix lint issues + format
bun run lint:fix
```

---

## Architecture Patterns

### Code Organization

> Domain-based architecture aligned with Game Engineer agent patterns.

```
vowel-movement/
├── .project/                    # Project documentation
│   ├── prd.md
│   ├── tech-stack.md
│   ├── build-plan.md
│   └── changelog.md
├── src/
│   ├── main.ts                  # Entry point, game instantiation
│   ├── game/
│   │   ├── config/              # Game configuration
│   │   │   ├── GameConfig.ts    # Phaser config
│   │   │   ├── PhysicsConfig.ts # Physics constants
│   │   │   └── AudioConfig.ts   # Sound keys, volumes
│   │   ├── scenes/              # Phaser scenes (orchestrators)
│   │   │   ├── BootScene.ts     # System setup
│   │   │   ├── PreloadScene.ts  # Asset loading
│   │   │   ├── MenuScene.ts     # Main menu
│   │   │   ├── GameScene.ts     # Core gameplay
│   │   │   ├── UIScene.ts       # HUD overlay (parallel)
│   │   │   └── GameOverScene.ts # End state
│   │   ├── entities/            # Self-contained game objects
│   │   │   ├── Wheel/           # Wheel + physics + animations
│   │   │   ├── PhraseBoard/     # Board + tiles + animations
│   │   │   └── Keyboard/        # Letter picker
│   │   ├── systems/             # Game systems
│   │   │   ├── InputSystem.ts   # Centralized input
│   │   │   ├── AudioSystem.ts   # Sound pooling
│   │   │   ├── ScoreSystem.ts   # Points tracking
│   │   │   ├── GameStateSystem.ts # Turn state machine
│   │   │   └── SaveSystem.ts    # Persistence
│   │   ├── ui/                  # UI components and layouts
│   │   │   ├── components/      # Button, Panel, ScoreDisplay
│   │   │   └── layouts/         # Menu, HUD, GameOver
│   │   ├── data/                # Static game data
│   │   │   ├── phrases.ts       # Phrase database
│   │   │   ├── categories.ts    # Category definitions
│   │   │   ├── wheelSegments.ts # Wheel configuration
│   │   │   ├── types.ts         # Game types
│   │   │   └── constants.ts     # Named magic numbers
│   │   └── utils/               # Helpers
│   │       ├── math.ts, random.ts, timing.ts, debug.ts
│   └── design-system/
│       ├── tokens/              # colors.ts, typography.ts, spacing.ts
│       └── styles/              # base.css, ui.css
├── public/
│   └── assets/
│       ├── sprites/             # wheel/, letters/, ui/
│       ├── audio/               # sfx/, music/
│       └── fonts/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── package.json
```

### Design Patterns Used

| Pattern | Where Used | Purpose |
|---------|------------|---------|
| Scene Orchestrator | game/scenes/ | Scenes wire up systems, no business logic |
| Parallel Scenes | UIScene | HUD runs parallel to GameScene |
| Entity Composition | game/entities/ | Self-contained objects, composition over inheritance |
| State Machine | GameStateSystem | Turn phases (IDLE → SPINNING → GUESSING → SOLVING) |
| Pub/Sub Events | Systems | Decoupled communication between game parts |
| Object Pooling | AudioSystem | Reuse sound instances, prevent GC |
| Design Tokens | design-system/tokens | Consistent colors, typography, spacing |

---

## Environment Configuration

### Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript compiler options (strict mode) |
| `eslint.config.js` | ESLint flat config - strict but sensible |
| `.prettierrc` | Prettier formatting rules |
| `package.json` | Dependencies and scripts |

No environment variables needed for V1 - everything is client-side.

### ESLint Philosophy

Strict where it matters, not annoying for game dev:
- **Error on**: unused vars, any types, console.log in prod, unreachable code
- **Warn on**: TODO comments, complex functions
- **Off**: JSDoc requirements (TS handles it), import extensions, strict null (TS strict covers it)
- **Perfectionist**: Auto-sort imports/exports for clean diffs

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial Load | < 3s | Lighthouse |
| Frame Rate | 60 FPS | Smooth wheel spin animation |
| Bundle Size | < 500KB | Vite build output |
| Time to Interactive | < 2s | First meaningful paint |

---

## Browser Support

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | Full support |
| Firefox | 90+ | Full support |
| Safari | 14+ | Full support |
| Edge | 90+ | Full support |
| Mobile Chrome | Latest | Full support |
| Mobile Safari | Latest | Full support |

---

## Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2025-01-27 | Phaser 3 | Full-featured game framework, great docs | PixiJS, raw Canvas |
| 2025-01-27 | Vite | Fast dev server, simple config | Webpack, Parcel |
| 2025-01-27 | TypeScript | Type safety for game state | JavaScript |
| 2025-01-27 | Bun | Faster installs, native TS, drop-in npm replacement | npm, pnpm, yarn |
| 2025-01-27 | ESLint + Prettier | Code quality + consistent formatting | Prettier only, Biome |
| 2025-01-27 | No Zod | No API/runtime validation needed, static data | Zod for phrase schemas |
| 2025-01-27 | No backend (V1) | Keep scope minimal, client-only | Firebase, Supabase |

---

*Last updated: 2025-01-27*
