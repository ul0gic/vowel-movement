/**
 * Achievement Popup - Animated notification for unlocked achievements
 *
 * Features:
 * - Slides in from the top
 * - Shows achievement name, description, and icon
 * - GSAP animations with gold glow
 * - Auto-dismisses after delay
 * - Queues multiple achievements
 */
import Phaser from 'phaser'

import { colors, hexToNumber } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_MODAL, GAME_WIDTH } from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'
import type { Achievement } from '../../systems/SaveSystem'
import { createTimeline, Easing } from '../../utils/gsap'

/**
 * Achievement popup configuration
 */
export interface AchievementPopupConfig {
  /** Time to display before auto-dismiss (ms) */
  displayDuration?: number
  /** Y position when visible */
  visibleY?: number
  /** Y position when hidden (above screen) */
  hiddenY?: number
}

/**
 * Achievement Popup Component
 */
export class AchievementPopup extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene

  private panel: Phaser.GameObjects.Graphics
  private titleText: Phaser.GameObjects.Text
  private nameText: Phaser.GameObjects.Text
  private descText: Phaser.GameObjects.Text
  private iconCircle: Phaser.GameObjects.Graphics
  private glowGraphics: Phaser.GameObjects.Graphics

  private config: Required<AchievementPopupConfig>
  private queue: Achievement[] = []
  private isShowing = false

  private panelWidth = 400
  private panelHeight = 100

  constructor(scene: Phaser.Scene, config: AchievementPopupConfig = {}) {
    super(scene, GAME_WIDTH / 2, config.hiddenY ?? -120)

    this.config = {
      displayDuration: config.displayDuration ?? 4000,
      hiddenY: config.hiddenY ?? -120,
      visibleY: config.visibleY ?? 80,
    }

    scene.add.existing(this)
    this.setDepth(DEPTH_MODAL + 10)

    this.glowGraphics = this.createGlow()
    this.panel = this.createPanel()
    this.iconCircle = this.createIconCircle()
    this.titleText = this.createTitle()
    this.nameText = this.createNameText()
    this.descText = this.createDescText()

    this.add([this.glowGraphics, this.panel, this.iconCircle, this.titleText, this.nameText, this.descText])

    // Start invisible
    this.setVisible(false)
  }

  /**
   * Create glow effect
   */
  private createGlow(): Phaser.GameObjects.Graphics {
    const glow = this.scene.add.graphics()

    for (let i = 4; i > 0; i--) {
      const expand = i * 6
      const alpha = 0.1 / i
      glow.fillStyle(hexToNumber(colors.wheelGold), alpha)
      glow.fillRoundedRect(
        -this.panelWidth / 2 - expand,
        -this.panelHeight / 2 - expand,
        this.panelWidth + expand * 2,
        this.panelHeight + expand * 2,
        16 + expand / 2
      )
    }

    return glow
  }

  /**
   * Create panel background
   */
  private createPanel(): Phaser.GameObjects.Graphics {
    const panel = this.scene.add.graphics()

    // Dark background
    panel.fillStyle(hexToNumber(colors.surface), 0.95)
    panel.fillRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      16
    )

    // Gold border
    panel.lineStyle(3, hexToNumber(colors.wheelGold), 0.9)
    panel.strokeRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      16
    )

    // Highlight at top
    panel.fillStyle(0xFFFFFF, 0.1)
    panel.fillRoundedRect(
      -this.panelWidth / 2 + 2,
      -this.panelHeight / 2 + 2,
      this.panelWidth - 4,
      20,
      { tl: 14, tr: 14, bl: 0, br: 0 }
    )

    return panel
  }

  /**
   * Create icon circle
   */
  private createIconCircle(): Phaser.GameObjects.Graphics {
    const circle = this.scene.add.graphics()
    const x = -this.panelWidth / 2 + 55
    const radius = 30

    // Gold circle background
    circle.fillStyle(hexToNumber(colors.wheelGold), 1)
    circle.fillCircle(x, 0, radius)

    // Inner dark circle
    circle.fillStyle(hexToNumber(colors.surface), 1)
    circle.fillCircle(x, 0, radius - 4)

    // Star shape (simple)
    circle.fillStyle(hexToNumber(colors.wheelGold), 1)
    circle.fillCircle(x, 0, 12)

    return circle
  }

  /**
   * Create title text
   */
  private createTitle(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(-this.panelWidth / 2 + 100, -this.panelHeight / 2 + 18, 'ACHIEVEMENT UNLOCKED!', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.sm}px`,
        color: colors.wheelGold,
        resolution: 2,
      })
      .setOrigin(0, 0.5)
  }

  /**
   * Create achievement name text
   */
  private createNameText(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(-this.panelWidth / 2 + 100, 0, '', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0, 0.5)
  }

  /**
   * Create achievement description text
   */
  private createDescText(): Phaser.GameObjects.Text {
    return this.scene.add
      .text(-this.panelWidth / 2 + 100, this.panelHeight / 2 - 20, '', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.sm}px`,
        color: colors.textSecondary,
        resolution: 2,
      })
      .setOrigin(0, 0.5)
  }

  /**
   * Show an achievement popup
   */
  public showAchievement(achievement: Achievement): void {
    this.queue.push(achievement)

    if (!this.isShowing) {
      this.processQueue()
    }
  }

  /**
   * Show multiple achievements
   */
  public showAchievements(achievements: Achievement[]): void {
    this.queue.push(...achievements)

    if (!this.isShowing) {
      this.processQueue()
    }
  }

  /**
   * Process the achievement queue
   */
  private processQueue(): void {
    if (this.queue.length === 0) {
      this.isShowing = false
      return
    }

    this.isShowing = true
    const achievement = this.queue.shift()
    if (!achievement) return

    this.displayAchievement(achievement)
  }

  /**
   * Display a single achievement with animation
   */
  private displayAchievement(achievement: Achievement): void {
    // Update text
    this.nameText.setText(achievement.name.toUpperCase())
    this.descText.setText(achievement.description)

    // Play sound (use win fanfare for achievements)
    getAudioSystem().playWinFanfare()

    // Show and animate
    this.setVisible(true)
    this.setY(this.config.hiddenY)
    this.setAlpha(0)

    const tl = createTimeline()

    // Slide in
    tl.to(this, {
      y: this.config.visibleY,
      alpha: 1,
      duration: 0.5,
      ease: Easing.back,
    })

    // Pulse glow
    tl.to(this.glowGraphics, {
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 0.3,
      yoyo: true,
      repeat: 2,
      ease: 'sine.inOut',
    }, '-=0.2')

    // Hold
    tl.to({}, { duration: this.config.displayDuration / 1000 })

    // Slide out
    tl.to(this, {
      y: this.config.hiddenY,
      alpha: 0,
      duration: 0.4,
      ease: Easing.smoothIn,
      onComplete: () => {
        this.setVisible(false)
        // Process next in queue
        this.scene.time.delayedCall(300, () => {
          this.processQueue()
        })
      },
    })
  }

  /**
   * Clear the queue and hide immediately
   */
  public clear(): void {
    this.queue = []
    this.isShowing = false
    this.setVisible(false)
    this.setY(this.config.hiddenY)
  }
}

/**
 * Create and return an achievement popup instance
 */
export function createAchievementPopup(
  scene: Phaser.Scene,
  config?: AchievementPopupConfig
): AchievementPopup {
  return new AchievementPopup(scene, config)
}
