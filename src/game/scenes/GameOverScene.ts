/**
 * Game Over Scene - Results screen
 *
 * Displays after game ends:
 * - Final score
 * - High score (with "NEW!" indicator if beaten)
 * - Play Again button
 * - Return to Menu button
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { typography } from '../../design-system/tokens/typography'
import { SceneKeys } from '../config/GameConfig'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  SCENE_FADE_DURATION,
  TRANSITION_DURATION,
} from '../data/constants'

export class GameOverScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private highScoreText!: Phaser.GameObjects.Text
  private newHighScoreText!: Phaser.GameObjects.Text
  private playAgainButton!: Phaser.GameObjects.Container
  private menuButton!: Phaser.GameObjects.Container
  private isTransitioning = false

  constructor() {
    super({ key: SceneKeys.GAME_OVER })
  }

  /**
   * Create game over screen elements
   */
  create(): void {
    this.isTransitioning = false

    // Fade in
    this.cameras.main.fadeIn(SCENE_FADE_DURATION, 0, 0, 0)

    const finalScore = (this.registry.get('score') as number | undefined) ?? 0
    const highScore = (this.registry.get('highScore') as number | undefined) ?? 0
    const isNewHighScore = finalScore >= highScore && finalScore > 0

    this.createBackground()
    this.createTitle()
    this.createScoreDisplay(finalScore, highScore, isNewHighScore)
    this.createButtons()
    this.animateEntrance(isNewHighScore)
    this.setupInput()
  }

  /**
   * Create background with subtle effects
   */
  private createBackground(): void {
    const graphics = this.add.graphics()

    // Semi-transparent overlay
    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.background).color,
      0.95
    )
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Decorative border
    graphics.lineStyle(
      4,
      Phaser.Display.Color.HexStringToColor(colors.primary).color,
      0.5
    )
    graphics.strokeRect(40, 40, GAME_WIDTH - 80, GAME_HEIGHT - 80)
  }

  /**
   * Create the game over title
   */
  private createTitle(): void {
    const centerX = GAME_WIDTH / 2

    this.titleText = this.add
      .text(centerX, 120, 'GAME OVER', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['4xl']}px`,
        color: colors.primary,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setStroke(colors.secondary, 4)
      .setShadow(4, 4, colors.accent, 8, true, true)
      .setAlpha(0)
  }

  /**
   * Create the score displays
   */
  private createScoreDisplay(
    finalScore: number,
    highScore: number,
    isNewHighScore: boolean
  ): void {
    const centerX = GAME_WIDTH / 2

    // Final score label and value with high resolution
    this.add
      .text(centerX, 220, 'FINAL SCORE', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.textSecondary,
        resolution: 2,
      })
      .setOrigin(0.5)

    this.scoreText = this.add
      .text(centerX, 280, finalScore.toLocaleString(), {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['3xl']}px`,
        color: colors.accent,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)

    // High score display with high resolution
    const highScoreY = isNewHighScore ? 360 : 350
    this.highScoreText = this.add
      .text(centerX, highScoreY, `HIGH SCORE: ${highScore.toLocaleString()}`, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.wheelGold,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)

    // New high score indicator with high resolution
    this.newHighScoreText = this.add
      .text(centerX, 330, 'NEW HIGH SCORE!', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.xl}px`,
        color: colors.success,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setVisible(isNewHighScore)
  }

  /**
   * Create action buttons
   */
  private createButtons(): void {
    const centerX = GAME_WIDTH / 2
    const buttonWidth = 220
    const buttonHeight = 60

    // Play Again button
    this.playAgainButton = this.createButton(
      centerX,
      480,
      buttonWidth,
      buttonHeight,
      'PLAY AGAIN',
      colors.primary
    )
    this.playAgainButton.on('pointerdown', () => {
      this.startNewGame()
    })

    // Menu button
    this.menuButton = this.createButton(
      centerX,
      560,
      buttonWidth,
      buttonHeight,
      'MENU',
      colors.surface
    )
    this.menuButton.on('pointerdown', () => {
      this.returnToMenu()
    })
  }

  /**
   * Create a styled button
   */
  private createButton(
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    bgColor: string
  ): Phaser.GameObjects.Container {
    const buttonBg = this.add.graphics()

    buttonBg.fillStyle(Phaser.Display.Color.HexStringToColor(bgColor).color, 1)
    buttonBg.fillRoundedRect(-width / 2, -height / 2, width, height, 10)

    buttonBg.lineStyle(
      2,
      Phaser.Display.Color.HexStringToColor(colors.secondary).color,
      1
    )
    buttonBg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10)

    const buttonText = this.add
      .text(0, 0, label, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.xl}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0.5)

    const container = this.add.container(x, y, [buttonBg, buttonText])
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })
    container.setAlpha(0)

    // Hover effects
    container.on('pointerover', () => {
      if (this.isTransitioning) return
      this.tweens.add({
        targets: container,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
        ease: 'Back.easeOut',
      })
    })

    container.on('pointerout', () => {
      if (this.isTransitioning) return
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut',
      })
    })

    return container
  }

  /**
   * Animate entrance of all elements
   */
  private animateEntrance(isNewHighScore: boolean): void {
    // Title drops in
    this.titleText.setY(20)
    this.tweens.add({
      targets: this.titleText,
      y: 120,
      alpha: 1,
      duration: TRANSITION_DURATION * 2,
      ease: 'Back.easeOut',
    })

    // Score counts up from 0
    const animationScore = (this.registry.get('score') as number | undefined) ?? 0
    this.tweens.addCounter({
      from: 0,
      to: animationScore,
      duration: 1000,
      delay: 300,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const rawValue = tween.getValue()
        if (rawValue !== null) {
          const value = Math.round(rawValue)
          this.scoreText.setText(value.toLocaleString())
        }
      },
    })

    this.tweens.add({
      targets: this.scoreText,
      alpha: 1,
      duration: 200,
      delay: 300,
    })

    // New high score flash (if applicable)
    if (isNewHighScore) {
      this.tweens.add({
        targets: this.newHighScoreText,
        alpha: 1,
        duration: 200,
        delay: 1200,
      })

      // Pulsing effect for new high score
      this.tweens.add({
        targets: this.newHighScoreText,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: 1400,
      })
    }

    // High score fades in
    this.tweens.add({
      targets: this.highScoreText,
      alpha: 1,
      duration: 300,
      delay: isNewHighScore ? 1400 : 1200,
    })

    // Buttons fade in
    this.tweens.add({
      targets: [this.playAgainButton, this.menuButton],
      alpha: 1,
      duration: 300,
      delay: 1600,
    })
  }

  /**
   * Set up keyboard shortcuts
   */
  private setupInput(): void {
    // Enter to play again
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startNewGame()
    })

    // Escape to return to menu
    this.input.keyboard?.on('keydown-ESC', () => {
      this.returnToMenu()
    })
  }

  /**
   * Start a new game
   */
  private startNewGame(): void {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // Button press feedback
    this.tweens.add({
      targets: this.playAgainButton,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
    })

    // Fade and transition
    this.cameras.main.fadeOut(SCENE_FADE_DURATION, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SceneKeys.GAME)
      this.scene.launch(SceneKeys.UI)
    })
  }

  /**
   * Return to main menu
   */
  private returnToMenu(): void {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // Button press feedback
    this.tweens.add({
      targets: this.menuButton,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
    })

    // Fade and transition
    this.cameras.main.fadeOut(SCENE_FADE_DURATION, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.start(SceneKeys.MENU)
    })
  }
}
