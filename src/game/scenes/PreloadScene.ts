/**
 * Preload Scene - Asset loading with progress bar
 *
 * Handles loading all game assets with visual feedback:
 * - Progress bar fills as assets load
 * - Displays loading percentage
 * - Transitions to MenuScene when complete
 * - Pre-caches commonly used Iconify icons
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { typography } from '../../design-system/tokens/typography'
import { SceneKeys } from '../config/GameConfig'
import { GAME_HEIGHT, GAME_WIDTH, SCENE_FADE_DURATION } from '../data/constants'
import { getIconLoader, IconNames } from '../utils/icons'

export class PreloadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Graphics
  private progressBox!: Phaser.GameObjects.Graphics
  private loadingText!: Phaser.GameObjects.Text
  private percentText!: Phaser.GameObjects.Text
  private assetText!: Phaser.GameObjects.Text

  constructor() {
    super({ key: SceneKeys.PRELOAD })
  }

  /**
   * Create loading UI and load all game assets
   */
  preload(): void {
    this.createLoadingUI()
    this.setupLoadEvents()
    this.loadAssets()
  }

  /**
   * Create the loading progress bar and text elements
   */
  private createLoadingUI(): void {
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2

    // Progress bar background box
    this.progressBox = this.add.graphics()
    this.progressBox.fillStyle(0x222222, 0.8)
    this.progressBox.fillRect(centerX - 160, centerY - 25, 320, 50)

    // Progress bar (fills as loading progresses)
    this.progressBar = this.add.graphics()

    // Loading title
    this.loadingText = this.add
      .text(centerX, centerY - 80, 'VOWEL MOVEMENT', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['3xl']}px`,
        color: colors.primary,
      })
      .setOrigin(0.5)
      .setStroke(colors.secondary, 2)

    // Percentage text
    this.percentText = this.add
      .text(centerX, centerY, '0%', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.textPrimary,
      })
      .setOrigin(0.5)

    // Current asset being loaded
    this.assetText = this.add
      .text(centerX, centerY + 60, '', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.sm}px`,
        color: colors.textSecondary,
      })
      .setOrigin(0.5)
  }

  /**
   * Set up loader event listeners for progress updates
   */
  private setupLoadEvents(): void {
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      this.progressBar.clear()
      this.progressBar.fillStyle(
        Phaser.Display.Color.HexStringToColor(colors.primary).color,
        1
      )
      this.progressBar.fillRect(centerX - 150, centerY - 15, 300 * value, 30)
      this.percentText.setText(`${Math.round(value * 100)}%`)
    })

    // Show current file being loaded
    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      this.assetText.setText(`Loading: ${file.key}`)
    })

    // Clean up when loading complete
    this.load.on('complete', () => {
      this.progressBar.destroy()
      this.progressBox.destroy()
      this.loadingText.destroy()
      this.percentText.destroy()
      this.assetText.destroy()
    })
  }

  /**
   * Load all game assets
   * Assets will be added in later phases as they're created
   */
  private loadAssets(): void {
    // Placeholder: Assets will be loaded here in later phases
    // For now, we simulate a brief load time to show the progress bar

    // In development, add a small delay to see the loading UI
    if (import.meta.env.DEV) {
      // Create fake load items to demonstrate progress bar
      for (let i = 0; i < 10; i++) {
        this.load.image(`placeholder_${i}`, 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      }
    }
  }

  /**
   * Transition to menu scene with fade effect
   * Pre-cache icons before transitioning
   */
  create(): void {
    // Pre-cache icons then transition
    void this.preCacheIcons().then(() => {
      // Brief delay before transitioning
      this.time.delayedCall(200, () => {
        // Fade out camera
        this.cameras.main.fadeOut(SCENE_FADE_DURATION, 0, 0, 0)

        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
          this.scene.start(SceneKeys.MENU)
        })
      })
    })
  }

  /**
   * Pre-cache commonly used Iconify icons
   */
  private async preCacheIcons(): Promise<void> {
    const iconLoader = getIconLoader()
    iconLoader.setScene(this)

    // Define commonly used icons with their colors and sizes
    const iconsToCache = [
      // Menu scene icons
      { name: IconNames.trophy, size: 32, color: colors.wheelGold },
      { name: IconNames.gamepad, size: 32, color: colors.textPrimary },
      { name: IconNames.coins, size: 32, color: colors.wheelGold },
      { name: IconNames.trendingUp, size: 32, color: colors.success },
      { name: IconNames.flame, size: 32, color: colors.danger },
      { name: IconNames.star, size: 32, color: colors.accent },
      { name: IconNames.crown, size: 32, color: colors.wheelGold },
      { name: IconNames.lock, size: 32, color: colors.textMuted },

      // Achievement icons
      { name: IconNames.check, size: 32, color: colors.success },
      { name: IconNames.zap, size: 32, color: colors.accent },
      { name: IconNames.skull, size: 32, color: colors.danger },
      { name: IconNames.target, size: 32, color: colors.info },
      { name: IconNames.gift, size: 32, color: colors.primary },
      { name: IconNames.sparkles, size: 32, color: colors.wheelGold },

      // UI icons
      { name: IconNames.settings, size: 24, color: colors.textSecondary },
      { name: IconNames.volume, size: 24, color: colors.textPrimary },
      { name: IconNames.volumeMuted, size: 24, color: colors.textMuted },
      { name: IconNames.play, size: 32, color: colors.textPrimary },
      { name: IconNames.refresh, size: 24, color: colors.textPrimary },
      { name: IconNames.home, size: 24, color: colors.textPrimary },
    ]

    try {
      // Load all icons in parallel
      await iconLoader.loadIcons(iconsToCache)

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[PreloadScene] Pre-cached ${iconsToCache.length} icons`)
      }
    } catch (error) {
      // Log error but don't block the game from starting
      console.error('[PreloadScene] Error pre-caching icons:', error)
    }
  }
}
