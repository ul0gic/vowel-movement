/**
 * Menu Scene - Title screen with "Play" button
 *
 * Main menu of the game featuring:
 * - Game title with neon trash aesthetic
 * - Play button to start the game
 * - High score display
 * - Animated entrance and transitions
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
import { getAudioSystem } from '../systems/AudioSystem'
import { resetPhraseManager } from '../utils/random'

export class MenuScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text
  private subtitleText!: Phaser.GameObjects.Text
  private playButton!: Phaser.GameObjects.Container
  private highScoreText!: Phaser.GameObjects.Text
  private isTransitioning = false

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
    this.createHighScore()
    this.animateEntrance()
    this.setupInput()
  }

  /**
   * Create animated background elements
   */
  private createBackground(): void {
    // Subtle gradient background effect using graphics
    const graphics = this.add.graphics()

    // Draw some decorative elements for the neon trash aesthetic
    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      0.3
    )

    // Diagonal stripes in background
    for (let i = -GAME_HEIGHT; i < GAME_WIDTH + GAME_HEIGHT; i += 100) {
      graphics.fillRect(i, 0, 40, GAME_HEIGHT * 2)
      graphics.setRotation(-0.3)
    }
    graphics.setPosition(-200, 0)
  }

  /**
   * Create the game title - BIG and BOLD
   */
  private createTitle(): void {
    const centerX = GAME_WIDTH / 2

    // Main title "VOWEL" - huge and impactful
    this.titleText = this.add
      .text(centerX, 200, 'VOWEL', {
        fontFamily: typography.fontFamily.display,
        fontSize: '120px',
        color: colors.primary,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setStroke(colors.secondary, 8)
      .setShadow(6, 6, '#000000', 12, true, true)
      .setAlpha(0)

    // Subtitle "MOVEMENT" - equally huge
    this.subtitleText = this.add
      .text(centerX, 340, 'MOVEMENT', {
        fontFamily: typography.fontFamily.display,
        fontSize: '120px',
        color: colors.secondary,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setStroke(colors.primary, 8)
      .setShadow(6, 6, '#000000', 12, true, true)
      .setAlpha(0)

    // Tagline
    this.add
      .text(centerX, 440, 'THE IRREVERENT WORD GAME', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.xl}px`,
        color: colors.accent,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0.8)
  }

  /**
   * Create the play button
   */
  private createPlayButton(): void {
    const centerX = GAME_WIDTH / 2
    const buttonY = 560

    // Button background
    const buttonBg = this.add.graphics()
    const buttonWidth = 240
    const buttonHeight = 72

    buttonBg.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.primary).color,
      1
    )
    buttonBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    )

    // Button border
    buttonBg.lineStyle(
      3,
      Phaser.Display.Color.HexStringToColor(colors.secondary).color,
      1
    )
    buttonBg.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      12
    )

    // Button text with high resolution
    const buttonText = this.add
      .text(0, 0, 'PLAY', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['3xl']}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0.5)

    // Container for button
    this.playButton = this.add.container(centerX, buttonY, [buttonBg, buttonText])
    this.playButton.setSize(buttonWidth, buttonHeight)
    this.playButton.setInteractive({ useHandCursor: true })
    this.playButton.setAlpha(0)

    // Button hover effects
    this.playButton.on('pointerover', () => {
      if (this.isTransitioning) return
      this.tweens.add({
        targets: this.playButton,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        ease: 'Back.easeOut',
      })
    })

    this.playButton.on('pointerout', () => {
      if (this.isTransitioning) return
      this.tweens.add({
        targets: this.playButton,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
        ease: 'Back.easeOut',
      })
    })

    // Button click
    this.playButton.on('pointerdown', () => {
      this.startGame()
    })
  }

  /**
   * Create high score display
   */
  private createHighScore(): void {
    const centerX = GAME_WIDTH / 2
    const highScore = (this.registry.get('highScore') as number | undefined) ?? 0

    this.highScoreText = this.add
      .text(centerX, 660, `HIGH SCORE: ${highScore.toLocaleString()}`, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.xl}px`,
        color: colors.wheelGold,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0)
  }

  /**
   * Animate menu elements entrance
   */
  private animateEntrance(): void {
    // Title drops in from above with impact
    this.titleText.setY(50)
    this.titleText.setScale(1.2)
    this.tweens.add({
      targets: this.titleText,
      y: 200,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: TRANSITION_DURATION * 2.5,
      ease: 'Back.easeOut',
    })

    // Subtitle slides in after title
    this.subtitleText.setY(450)
    this.subtitleText.setScale(1.2)
    this.tweens.add({
      targets: this.subtitleText,
      y: 340,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: TRANSITION_DURATION * 2.5,
      ease: 'Back.easeOut',
      delay: 200,
    })

    // Play button fades in and scales up
    this.playButton.setScale(0.5)
    this.tweens.add({
      targets: this.playButton,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: TRANSITION_DURATION * 2,
      ease: 'Back.easeOut',
      delay: 400,
    })

    // High score fades in last
    this.tweens.add({
      targets: this.highScoreText,
      alpha: 1,
      duration: TRANSITION_DURATION,
      delay: 600,
    })

    // Subtle float animation on title
    this.tweens.add({
      targets: [this.titleText, this.subtitleText],
      y: '+=5',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      delay: 1000,
    })
  }

  /**
   * Set up keyboard input
   */
  private setupInput(): void {
    // Allow Enter/Space to start game
    this.input.keyboard?.on('keydown-ENTER', () => {
      this.startGame()
    })

    this.input.keyboard?.on('keydown-SPACE', () => {
      this.startGame()
    })
  }

  /**
   * Start the game - transition to GameScene
   */
  private startGame(): void {
    if (this.isTransitioning) return
    this.isTransitioning = true

    // Initialize audio system on first user interaction
    const audio = getAudioSystem()
    audio.initialize()
    audio.playUIClick()

    // Reset phrase manager for a fresh game session
    resetPhraseManager()

    // Button press feedback
    this.tweens.add({
      targets: this.playButton,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 100,
      yoyo: true,
    })

    // Fade out and start game
    this.cameras.main.fadeOut(SCENE_FADE_DURATION, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Start GameScene and UIScene in parallel
      this.scene.start(SceneKeys.GAME)
      this.scene.launch(SceneKeys.UI)
    })
  }
}
