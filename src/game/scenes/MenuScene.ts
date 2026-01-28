/**
 * Menu Scene - Modern title screen with stats and achievements
 *
 * Features:
 * - Game title with neon trash aesthetic
 * - Stats panel with game statistics
 * - Recent games panel
 * - Achievements panel
 * - Play button with GSAP animations
 * - Glassmorphism panels
 */
import Phaser from 'phaser'

import { colors, hexToNumber } from '../../design-system/tokens/colors'
import { typography } from '../../design-system/tokens/typography'
import { SceneKeys } from '../config/GameConfig'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_FADE_DURATION,
} from '../data/constants'
import { getAudioSystem } from '../systems/AudioSystem'
import type { Achievement, GameRecord } from '../systems/SaveSystem'
import { getSaveSystem } from '../systems/SaveSystem'
import { Button } from '../ui/components/Button'
import { Panel } from '../ui/components/Panel'
import { getGsap } from '../utils/gsap'
import {
  animate,
  createTimeline,
  Easing,
  float,
  staggerSlideIn,
} from '../utils/gsap'
import { resetPhraseManager } from '../utils/random'

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private subtitleText!: Phaser.GameObjects.Text
  private taglineText!: Phaser.GameObjects.Text
  private playButton!: Button
  private statsPanel!: Panel
  private recentGamesPanel!: Panel
  private achievementsPanel!: Panel
  private isTransitioning = false

  // Stats display elements
  private statItems: Phaser.GameObjects.Container[] = []
  private recentGameItems: Phaser.GameObjects.Container[] = []
  private achievementItems: Phaser.GameObjects.Container[] = []

  // Background gradient animation
  private gradientOverlay!: Phaser.GameObjects.Graphics
  private gradientTween: gsap.core.Timeline | null = null

  constructor() {
    super({ key: SceneKeys.MENU })
  }

  /**
   * Create menu UI elements with animated entrance
   */
  create(): void {
    this.isTransitioning = false

    // Fade in from preload scene
    this.cameras.main.fadeIn(SCENE_FADE_DURATION, 0, 0, 0)

    this.createBackground()
    this.createTitle()
    this.createPlayButton()
    this.createStatsPanel()
    this.createRecentGamesPanel()
    this.createAchievementsPanel()
    this.animateEntrance()
    this.setupInput()
  }

  /**
   * Create animated background elements
   */
  private createBackground(): void {
    const graphics = this.add.graphics()

    // Clean dark background
    graphics.fillStyle(hexToNumber(colors.background), 1)
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Subtle radial gradient overlay (lighter in center)
    const gradientRadius = Math.max(GAME_WIDTH, GAME_HEIGHT) * 0.6
    graphics.fillStyle(hexToNumber(colors.surface), 0.08)
    graphics.fillCircle(GAME_WIDTH / 2, GAME_HEIGHT * 0.35, gradientRadius)

    // Add animated gradient overlay
    this.createAnimatedGradient()

    // Add floating particles in background
    this.createBackgroundParticles()
  }

  /**
   * Create subtle animated gradient color shift
   */
  private createAnimatedGradient(): void {
    this.gradientOverlay = this.add.graphics()

    // Animation state for gradient colors
    const gradientState = {
      colorPhase: 0,
      x: GAME_WIDTH * 0.3,
      y: GAME_HEIGHT * 0.3,
    }

    // Define gradient colors to cycle through
    const gradientColors = [
      { r: 0xFF, g: 0x00, b: 0xFF }, // Primary (magenta)
      { r: 0x00, g: 0xFF, b: 0xFF }, // Secondary (cyan)
      { r: 0x94, g: 0x00, b: 0xD3 }, // Purple
      { r: 0x00, g: 0xFF, b: 0x66 }, // Green
    ]

    // Function to draw the gradient overlay
    const drawGradient = () => {
      this.gradientOverlay.clear()

      // Get interpolated color based on phase
      const colorIndex = Math.floor(gradientState.colorPhase) % gradientColors.length
      const nextColorIndex = (colorIndex + 1) % gradientColors.length
      const t = gradientState.colorPhase % 1

      const currentColor = gradientColors[colorIndex]
      const nextColor = gradientColors[nextColorIndex]

      if (!currentColor || !nextColor) return

      // Lerp between colors
      const r = Math.round(currentColor.r + (nextColor.r - currentColor.r) * t)
      const g = Math.round(currentColor.g + (nextColor.g - currentColor.g) * t)
      const b = Math.round(currentColor.b + (nextColor.b - currentColor.b) * t)
      const color = (r << 16) | (g << 8) | b

      // Draw multiple overlapping circles for smooth gradient effect
      const baseRadius = Math.max(GAME_WIDTH, GAME_HEIGHT) * 0.5
      const steps = 5

      for (let i = steps - 1; i >= 0; i--) {
        const stepT = i / (steps - 1)
        const radius = baseRadius * (0.3 + stepT * 0.7)
        const alpha = 0.02 * (1 - stepT * 0.5)

        this.gradientOverlay.fillStyle(color, alpha)
        this.gradientOverlay.fillCircle(gradientState.x, gradientState.y, radius)
      }
    }

    // Initial draw
    drawGradient()

    // Animate the gradient with GSAP
    const gsap = getGsap()
    this.gradientTween = gsap.timeline({ repeat: -1 })

    // Color phase animation (cycles through colors)
    this.gradientTween.to(gradientState, {
      colorPhase: gradientColors.length,
      duration: 20,
      ease: 'none',
      onUpdate: drawGradient,
    }, 0)

    // Position drift animation (subtle movement)
    this.gradientTween.to(gradientState, {
      x: GAME_WIDTH * 0.7,
      y: GAME_HEIGHT * 0.4,
      duration: 12,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
      onUpdate: drawGradient,
    }, 0)
  }

  /**
   * Create subtle floating particles
   */
  private createBackgroundParticles(): void {
    const particleCount = 20
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * GAME_WIDTH
      const y = Math.random() * GAME_HEIGHT
      const size = 2 + Math.random() * 4
      const alpha = 0.1 + Math.random() * 0.2

      const particle = this.add.graphics()
      particle.fillStyle(hexToNumber(colors.primary), alpha)
      particle.fillCircle(0, 0, size)
      particle.setPosition(x, y)

      // Gentle floating animation
      float(particle, 10 + Math.random() * 10, 3 + Math.random() * 3, { delay: Math.random() * 2 })
    }
  }

  /**
   * Create the game title (centered hero)
   */
  private createTitle(): void {
    const centerX = GAME_WIDTH / 2

    // Main title "VOWEL"
    this.titleText = this.add
      .text(centerX, 140, 'VOWEL', {
        fontFamily: typography.fontFamily.display,
        fontSize: '140px',
        color: colors.primary,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setStroke(colors.secondary, 8)
      .setShadow(6, 6, '#000000', 15, true, true)
      .setAlpha(0)

    // Subtitle "MOVEMENT"
    this.subtitleText = this.add
      .text(centerX, 280, 'MOVEMENT', {
        fontFamily: typography.fontFamily.display,
        fontSize: '140px',
        color: colors.secondary,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setStroke(colors.primary, 8)
      .setShadow(6, 6, '#000000', 15, true, true)
      .setAlpha(0)

    // Tagline
    this.taglineText = this.add
      .text(centerX, 380, 'THE IRREVERENT WORD GAME', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize['2xl']}px`,
        color: colors.accent,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
  }

  /**
   * Create the play button (centered below title)
   */
  private createPlayButton(): void {
    const centerX = GAME_WIDTH / 2

    this.playButton = new Button(this, {
      x: centerX,
      y: 480,
      text: 'PLAY',
      variant: 'primary',
      size: 'xl',
      width: 320,
      glow: true,
      onClick: () => { this.startGame() },
    })
    this.playButton.setAlpha(0)
  }

  /**
   * Create stats panel (left panel in bottom row)
   */
  private createStatsPanel(): void {
    const panelWidth = 380
    const panelHeight = 320
    const panelY = GAME_HEIGHT - panelHeight / 2 - 60
    const gap = 40
    const totalWidth = panelWidth * 3 + gap * 2
    const startX = (GAME_WIDTH - totalWidth) / 2 + panelWidth / 2

    this.statsPanel = new Panel(this, {
      x: startX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      style: 'glass',
      glow: true,
      glowColor: colors.primary,
      borderRadius: 16,
    })
    this.statsPanel.setAlpha(0)

    // Panel title
    const title = this.add
      .text(0, -panelHeight / 2 + 30, 'STATISTICS', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.secondary,
        resolution: 2,
      })
      .setOrigin(0.5)
    this.statsPanel.add(title)

    // Get stats from SaveSystem
    const save = getSaveSystem()
    const stats = save.getStats()
    const highScore = save.getHighScore()
    const gamesPlayed = save.getGamesPlayed()

    // Stats items
    const statsData = [
      { label: 'High Score', value: `$${highScore.toLocaleString()}`, color: colors.wheelGold },
      { label: 'Games Played', value: gamesPlayed.toString(), color: colors.textPrimary },
      { label: 'Puzzles Solved', value: stats.puzzlesSolved.toString(), color: colors.success },
      { label: 'Total Bankrupts', value: stats.totalBankrupts.toString(), color: colors.danger },
      { label: 'Win Streak', value: `${stats.currentWinStreak}/${stats.longestWinStreak}`, color: colors.accent },
      { label: 'Avg Score', value: `$${stats.averageScore.toLocaleString()}`, color: colors.info },
    ]

    const startY = -panelHeight / 2 + 70
    const itemHeight = 38

    statsData.forEach((stat, index) => {
      const y = startY + index * itemHeight
      const item = this.createStatItem(stat.label, stat.value, stat.color, panelWidth - 50)
      item.setPosition(0, y)
      this.statsPanel.add(item)
      this.statItems.push(item)
    })
  }

  /**
   * Create a stat item row
   */
  private createStatItem(
    label: string,
    value: string,
    valueColor: string,
    width: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    const labelText = this.add
      .text(-width / 2, 0, label, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.md}px`,
        color: colors.textSecondary,
        resolution: 2,
      })
      .setOrigin(0, 0.5)

    const valueText = this.add
      .text(width / 2, 0, value, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: valueColor,
        resolution: 2,
      })
      .setOrigin(1, 0.5)

    container.add([labelText, valueText])
    return container
  }

  /**
   * Create recent games panel (middle panel in bottom row)
   */
  private createRecentGamesPanel(): void {
    const panelWidth = 380
    const panelHeight = 320
    const panelY = GAME_HEIGHT - panelHeight / 2 - 60
    const gap = 40
    const totalWidth = panelWidth * 3 + gap * 2
    const startX = (GAME_WIDTH - totalWidth) / 2 + panelWidth / 2
    const panelX = startX + panelWidth + gap

    this.recentGamesPanel = new Panel(this, {
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      style: 'glass',
      glow: true,
      glowColor: colors.secondary,
      borderRadius: 16,
    })
    this.recentGamesPanel.setAlpha(0)

    // Panel title
    const title = this.add
      .text(0, -panelHeight / 2 + 30, 'RECENT GAMES', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.secondary,
        resolution: 2,
      })
      .setOrigin(0.5)
    this.recentGamesPanel.add(title)

    // Get recent games
    const save = getSaveSystem()
    const history = save.getGameHistory().slice(0, 6)

    if (history.length === 0) {
      const noGames = this.add
        .text(0, 20, 'No games played yet', {
          fontFamily: typography.fontFamily.body,
          fontSize: `${typography.fontSize.md}px`,
          color: colors.textMuted,
          resolution: 2,
        })
        .setOrigin(0.5)
      this.recentGamesPanel.add(noGames)
    } else {
      const startY = -panelHeight / 2 + 70
      const itemHeight = 38

      history.forEach((game, index) => {
        const y = startY + index * itemHeight
        const item = this.createGameHistoryItem(game, panelWidth - 50)
        item.setPosition(0, y)
        this.recentGamesPanel.add(item)
        this.recentGameItems.push(item)
      })
    }
  }

  /**
   * Create a game history item row
   */
  private createGameHistoryItem(game: GameRecord, width: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    // Format date
    const date = new Date(game.date)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const dateText = this.add
      .text(-width / 2, 0, dateStr, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.sm}px`,
        color: colors.textMuted,
        resolution: 2,
      })
      .setOrigin(0, 0.5)

    const scoreText = this.add
      .text(0, 0, `$${game.score.toLocaleString()}`, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.md}px`,
        color: game.won ? colors.success : colors.textSecondary,
        resolution: 2,
      })
      .setOrigin(0.5)

    const puzzlesText = this.add
      .text(width / 2, 0, `${game.puzzlesSolved}/${game.puzzlesAttempted} puzzles`, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.sm}px`,
        color: colors.textSecondary,
        resolution: 2,
      })
      .setOrigin(1, 0.5)

    container.add([dateText, scoreText, puzzlesText])
    return container
  }

  /**
   * Create achievements panel (right panel in bottom row)
   */
  private createAchievementsPanel(): void {
    const panelWidth = 380
    const panelHeight = 320
    const panelY = GAME_HEIGHT - panelHeight / 2 - 60
    const gap = 40
    const totalWidth = panelWidth * 3 + gap * 2
    const startX = (GAME_WIDTH - totalWidth) / 2 + panelWidth / 2
    const panelX = startX + (panelWidth + gap) * 2

    this.achievementsPanel = new Panel(this, {
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      style: 'glass',
      glow: true,
      glowColor: colors.accent,
      borderRadius: 16,
    })
    this.achievementsPanel.setAlpha(0)

    // Panel title
    const save = getSaveSystem()
    const achievements = save.getAchievements()
    const unlocked = achievements.filter(a => a.unlocked).length
    const total = achievements.length

    const title = this.add
      .text(0, -panelHeight / 2 + 30, `ACHIEVEMENTS (${unlocked}/${total})`, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.accent,
        resolution: 2,
      })
      .setOrigin(0.5)
    this.achievementsPanel.add(title)

    // Achievement grid (5 columns, 2 rows)
    const cols = 5
    const rows = 2
    const iconSize = 48
    const gapX = 20
    const gapY = 25
    const gridStartX = -((cols - 1) * (iconSize + gapX)) / 2
    const gridStartY = -panelHeight / 2 + 100

    achievements.slice(0, cols * rows).forEach((achievement, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      const x = gridStartX + col * (iconSize + gapX)
      const y = gridStartY + row * (iconSize + gapY)

      const item = this.createAchievementIcon(achievement, iconSize)
      item.setPosition(x, y)
      this.achievementsPanel.add(item)
      this.achievementItems.push(item)
    })
  }

  /**
   * Create an achievement icon
   */
  private createAchievementIcon(achievement: Achievement, size: number): Phaser.GameObjects.Container {
    const container = this.add.container(0, 0)

    // Background circle
    const bg = this.add.graphics()
    const bgColor = achievement.unlocked ? colors.wheelGold : colors.surface
    const bgAlpha = achievement.unlocked ? 0.9 : 0.5

    bg.fillStyle(hexToNumber(bgColor), bgAlpha)
    bg.fillCircle(0, 0, size / 2)

    if (!achievement.unlocked) {
      // Draw lock icon (simple representation)
      bg.fillStyle(hexToNumber(colors.textMuted), 0.8)
      bg.fillRect(-6, -4, 12, 10)
      bg.fillCircle(0, -8, 6)
      bg.lineStyle(2, hexToNumber(colors.textMuted), 0.8)
      bg.strokeCircle(0, -8, 6)
    } else {
      // Draw a simple star/check for unlocked
      bg.fillStyle(hexToNumber(colors.background), 0.9)
      bg.fillCircle(0, 0, size / 4)
    }

    container.add(bg)

    // Add tooltip on hover
    container.setSize(size, size)
    container.setInteractive()

    container.on('pointerover', () => {
      // Could show tooltip with achievement name/description
      if (achievement.unlocked) {
        animate(container, { scaleX: 1.1, scaleY: 1.1, duration: 0.1, ease: Easing.back })
      }
    })

    container.on('pointerout', () => {
      animate(container, { scaleX: 1, scaleY: 1, duration: 0.1, ease: Easing.smoothOut })
    })

    return container
  }

  /**
   * Animate menu elements entrance
   */
  private animateEntrance(): void {
    const tl = createTimeline()
    const panelY = GAME_HEIGHT - 320 / 2 - 60

    // Title drops in from top
    tl.fromTo(
      this.titleText,
      { y: 40, scaleX: 1.2, scaleY: 1.2, alpha: 0 },
      { y: 140, scaleX: 1, scaleY: 1, alpha: 1, duration: 0.6, ease: Easing.back }
    )
      .fromTo(
        this.subtitleText,
        { y: 380, scaleX: 1.2, scaleY: 1.2, alpha: 0 },
        { y: 280, scaleX: 1, scaleY: 1, alpha: 1, duration: 0.6, ease: Easing.back },
        '-=0.4'
      )
      .fromTo(
        this.taglineText,
        { alpha: 0 },
        { alpha: 0.8, duration: 0.4 },
        '-=0.2'
      )
      .fromTo(
        this.playButton,
        { scaleX: 0.5, scaleY: 0.5, alpha: 0 },
        { scaleX: 1, scaleY: 1, alpha: 1, duration: 0.5, ease: Easing.back },
        '-=0.2'
      )

    // All three panels slide up from bottom with stagger
    tl.fromTo(
      this.statsPanel,
      { y: GAME_HEIGHT + 200, alpha: 0 },
      { y: panelY, alpha: 1, duration: 0.5, ease: Easing.smoothOut },
      '-=0.2'
    )
      .fromTo(
        this.recentGamesPanel,
        { y: GAME_HEIGHT + 200, alpha: 0 },
        { y: panelY, alpha: 1, duration: 0.5, ease: Easing.smoothOut },
        '-=0.4'
      )
      .fromTo(
        this.achievementsPanel,
        { y: GAME_HEIGHT + 200, alpha: 0 },
        { y: panelY, alpha: 1, duration: 0.5, ease: Easing.smoothOut },
        '-=0.4'
      )

    // Stagger stat items
    if (this.statItems.length > 0) {
      tl.add(() => {
        staggerSlideIn(this.statItems, 'right', 0.05, { distance: 30 })
      }, '-=0.3')
    }

    // Float animation on title (starts after entrance)
    tl.add(() => {
      float(this.titleText, 5, 2.5)
      float(this.subtitleText, 5, 2.8, { delay: 0.3 })
    })

    // Pulse play button
    tl.add(() => {
      this.playButton.pulse()
    }, '+=1')
  }

  /**
   * Set up keyboard input
   */
  private setupInput(): void {
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame()
    })

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.startGame()
    })
  }

  /**
   * Start the game
   */
  private startGame(): void {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // Stop pulse animation
    this.playButton.stopAnimations()

    // Initialize audio system
    const audio = getAudioSystem()
    audio.initialize()
    audio.playUIClick()

    // Reset phrase manager
    resetPhraseManager()

    // Animate out
    const tl = createTimeline({
      onComplete: () => {
        this.scene.start(SceneKeys.GAME)
        this.scene.launch(SceneKeys.UI)
      },
    })

    tl.to(this.playButton, {
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
    })
      // All panels slide down
      .to(
        [this.statsPanel, this.recentGamesPanel, this.achievementsPanel],
        {
          y: GAME_HEIGHT + 200,
          alpha: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: Easing.smoothIn,
        },
        '-=0.1'
      )
      .to(
        [this.titleText, this.subtitleText, this.taglineText, this.playButton],
        {
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 0.3,
          ease: Easing.smoothIn,
        },
        '-=0.2'
      )

    // Fade camera
    this.time.delayedCall(400, () => {
      this.cameras.main.fadeOut(SCENE_FADE_DURATION / 2, 0, 0, 0)
    })
  }

  /**
   * Clean up
   */
  shutdown(): void {
    this.statItems = []
    this.recentGameItems = []
    this.achievementItems = []

    // Kill gradient animation
    if (this.gradientTween) {
      this.gradientTween.kill()
      this.gradientTween = null
    }
  }
}
