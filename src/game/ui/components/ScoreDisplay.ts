/**
 * ScoreDisplay - Animated score counter
 *
 * Features:
 * - Count-up/count-down animation when score changes
 * - Color flash on score change (green for gain, red for loss)
 * - Scale punch effect on change
 * - Formatted number display with thousands separators
 */
import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_UI, SCORE_COUNT_DURATION } from '../../data/constants'

/**
 * ScoreDisplay options
 */
export interface ScoreDisplayOptions {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Initial score value */
  initialScore?: number
  /** Font size */
  fontSize?: number
  /** Label text */
  label?: string
  /** Whether to show label */
  showLabel?: boolean
}

/**
 * ScoreDisplay class
 */
export class ScoreDisplay extends Phaser.GameObjects.Container {
  /** Reference to scene - using declare to override parent */
  declare scene: Phaser.Scene

  /** Score label text */
  private labelText: Phaser.GameObjects.Text | null = null

  /** Score value text */
  private scoreText: Phaser.GameObjects.Text

  /** Current actual score */
  private currentScore: number

  /** Currently displayed score (for animation) */
  private displayedScore: number

  /** Counter tween */
  private counterTween: Phaser.Tweens.Tween | null = null

  /** Font size */
  private fontSize: number

  constructor(scene: Phaser.Scene, options: ScoreDisplayOptions) {
    super(scene, options.x, options.y)

    this.currentScore = options.initialScore ?? 0
    this.displayedScore = this.currentScore
    this.fontSize = options.fontSize ?? typography.fontSize['2xl']

    // Add to scene
    scene.add.existing(this)
    this.setDepth(DEPTH_UI)

    // Create label if requested
    if (options.showLabel !== false) {
      this.labelText = scene.add
        .text(0, 0, options.label ?? 'SCORE', {
          fontFamily: typography.fontFamily.body,
          fontSize: `${typography.fontSize.sm}px`,
          color: colors.textSecondary,
          resolution: 2,
        })
        .setOrigin(0, 0)

      this.add(this.labelText)
    }

    // Create score text with high resolution
    this.scoreText = scene.add
      .text(0, this.labelText ? 22 : 0, this.formatScore(this.displayedScore), {
        fontFamily: typography.fontFamily.display,
        fontSize: `${this.fontSize}px`,
        color: colors.accent,
        resolution: 2,
      })
      .setOrigin(0, 0)
      .setStroke(colors.surface, 2)

    this.add(this.scoreText)
  }

  /**
   * Update the score with animation
   */
  public setScore(newScore: number, animate: boolean = true): void {
    const previousScore = this.currentScore
    this.currentScore = newScore

    if (!animate) {
      this.displayedScore = newScore
      this.scoreText.setText(this.formatScore(newScore))
      return
    }

    // Stop any existing animation
    if (this.counterTween) {
      this.counterTween.destroy()
    }

    // Animate the count
    this.counterTween = this.scene.tweens.addCounter({
      from: previousScore,
      to: newScore,
      duration: SCORE_COUNT_DURATION,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const value = tween.getValue()
        if (value !== null) {
          this.displayedScore = Math.round(value)
          this.scoreText.setText(this.formatScore(this.displayedScore))
        }
      },
      onComplete: () => {
        this.displayedScore = newScore
        this.scoreText.setText(this.formatScore(newScore))
        this.counterTween = null
      },
    })

    // Visual feedback
    this.animateScoreChange(newScore > previousScore)
  }

  /**
   * Animate score change with color flash and scale punch
   */
  private animateScoreChange(isGain: boolean): void {
    const flashColor = isGain ? colors.success : colors.danger

    // Color flash
    this.scoreText.setColor(flashColor)
    this.scene.time.delayedCall(200, () => {
      this.scoreText.setColor(colors.accent)
    })

    // Scale punch
    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 100,
      yoyo: true,
      ease: 'Back.easeOut',
    })
  }

  /**
   * Get the current score
   */
  public getScore(): number {
    return this.currentScore
  }

  /**
   * Format score with thousands separators
   */
  private formatScore(score: number): string {
    return `$${score.toLocaleString()}`
  }

  /**
   * Animate entry
   */
  public animateEntry(delay: number = 0): void {
    this.setAlpha(0)

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration: 300,
      delay,
      ease: 'Cubic.easeOut',
    })
  }

  /**
   * Flash the score display (for emphasis)
   */
  public flash(color: string = colors.accent): void {
    this.scoreText.setColor(color)

    this.scene.tweens.add({
      targets: this.scoreText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.scoreText.setColor(colors.accent)
      },
    })
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    if (this.counterTween) {
      this.counterTween.destroy()
    }
    super.destroy(fromScene)
  }
}
