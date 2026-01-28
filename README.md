# 🎰 Vowel Movement

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Phaser](https://img.shields.io/badge/Phaser-3.90-8B5CF6?style=flat-square&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTUtMTAtNXpNMiAxN2wxMCA1IDEwLTV2LTJsLTEwIDUtMTAtNXYyeiIvPjwvc3ZnPg==)](https://phaser.io/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **The Irreverent Word Game** - A hilariously vulgar party game inspired by Wheel of Fortune

<p align="center">
  <img src="./screenshot.png" alt="Vowel Movement Gameplay" width="800">
</p>

## 🎮 About The Game

**Vowel Movement** is a browser-based word puzzle game where players spin a wheel, guess consonants, buy vowels, and solve irreverent phrases. Think Wheel of Fortune, but with phrases your grandmother definitely wouldn't approve of.

### Features

- 🎡 **Interactive Spinning Wheel** - Physics-based wheel with realistic momentum and landing detection
- 📝 **Phrase Board** - Dynamic letter grid with satisfying reveal animations
- ⌨️ **On-Screen Keyboard** - Click or use your physical keyboard to guess letters
- 💰 **Score System** - Earn points for correct guesses, buy vowels for $250
- 🎵 **Sound Effects** - Wheel ticks, win fanfares, and bankrupt explosions
- ✨ **Particle Effects** - Celebrations and dramatic bankrupt moments
- 💾 **Local Save** - High scores persist between sessions
- 📱 **Responsive** - Scales to fit any screen size

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vowel-movement.git
cd vowel-movement

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

## 🏗️ Project Structure

```
vowel-movement/
├── index.html                 # HTML entry point
├── src/
│   ├── main.ts               # Game initialization
│   ├── design-system/        # Design tokens & styles
│   │   ├── tokens/
│   │   │   ├── colors.ts     # Color palette
│   │   │   ├── typography.ts # Font configurations
│   │   │   └── spacing.ts    # Spacing scale
│   │   └── styles/
│   │       ├── base.css      # Reset & global styles
│   │       └── ui.css        # UI component styles
│   └── game/
│       ├── config/           # Game configuration
│       │   ├── GameConfig.ts # Phaser config
│       │   ├── AudioConfig.ts
│       │   └── PhysicsConfig.ts
│       ├── data/             # Game data
│       │   ├── constants.ts  # Magic numbers
│       │   ├── phrases.ts    # Puzzle phrases
│       │   ├── categories.ts # Phrase categories
│       │   ├── wheelSegments.ts
│       │   └── types.ts      # TypeScript types
│       ├── entities/         # Game objects
│       │   ├── Wheel/        # Spinning wheel
│       │   ├── PhraseBoard/  # Letter grid
│       │   └── Keyboard/     # On-screen keyboard
│       ├── scenes/           # Phaser scenes
│       │   ├── BootScene.ts
│       │   ├── PreloadScene.ts
│       │   ├── MenuScene.ts
│       │   ├── GameScene.ts
│       │   ├── UIScene.ts
│       │   └── GameOverScene.ts
│       ├── systems/          # Game systems
│       │   ├── GameStateSystem.ts
│       │   ├── InputSystem.ts
│       │   ├── AudioSystem.ts
│       │   ├── ParticleSystem.ts
│       │   ├── ScoreSystem.ts
│       │   └── SaveSystem.ts
│       ├── ui/               # UI components
│       │   ├── components/
│       │   └── layouts/
│       └── utils/            # Utilities
│           ├── debug.ts
│           ├── math.ts
│           ├── random.ts
│           └── timing.ts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json
```

## 🎯 How to Play

1. **Spin the Wheel** - Click the wheel or press `Space` to spin
2. **Guess a Consonant** - If you land on a dollar amount, pick a consonant
3. **Buy a Vowel** - Spend $250 to reveal vowels (A, E, I, O, U)
4. **Solve the Puzzle** - Press `Enter` or click SOLVE when you know the answer
5. **Watch Out!** - Landing on BANKRUPT loses all your money!

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Phaser 3** | Game framework - rendering, physics, input |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Build tool & dev server |
| **Google Fonts** | Bungee & Oswald typefaces |
| **Cloudflare Workers** | Edge hosting |

## 📜 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Lint code with ESLint |
| `npm run lint:fix` | Fix linting issues |
| `npm run format` | Format code with Prettier |
| `npm run check` | Run all checks |

## 🚀 Deployment

### Cloudflare Workers

This project is configured to deploy as a Cloudflare Worker with static assets.

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the classic TV game show format
- Built with [Phaser 3](https://phaser.io/)
- Fonts from [Google Fonts](https://fonts.google.com/)

---

<p align="center">
  Made with 💩 and TypeScript
</p>
