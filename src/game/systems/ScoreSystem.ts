/**
 * ScoreSystem - Points and score tracking
 *
 * Manages scoring operations including:
 * - Adding points (consonant guess: wedge value x letter count)
 * - Deducting points (vowel purchase: 250 points)
 * - Resetting score (bankrupt)
 * - Free spin token management
 *
 * This system is mostly handled by GameStateSystem, but provides
 * utility functions and can be used for score-related calculations.
 */

import Phaser from 'phaser'

import { VOWEL_COST } from '../data/constants'

/**
 * Events emitted by ScoreSystem
 */
export const ScoreEvents = {
  /** Points added */
  POINTS_ADDED: 'score:pointsAdded',

  /** Points deducted */
  POINTS_DEDUCTED: 'score:pointsDeducted',

  /** Score reset (bankrupt) */
  SCORE_RESET: 'score:reset',

  /** Milestone reached */
  MILESTONE_REACHED: 'score:milestone',

  /** High score beaten */
  HIGH_SCORE_BEATEN: 'score:highScoreBeaten',
} as const

/**
 * Score milestones for celebration effects
 */
export const SCORE_MILESTONES = [1000, 2500, 5000, 10000, 25000, 50000, 100000] as const

/**
 * ScoreSystem class
 * Provides score-related utilities and calculations
 */
export class ScoreSystem extends Phaser.Events.EventEmitter {
  /** Reference to the scene (for registry access) */
  private scene: Phaser.Scene

  /** Current score (synced with registry) */
  private currentScore: number = 0

  /** High score from local storage */
  private highScore: number = 0

  /** Last milestone reached */
  private lastMilestone: number = 0

  constructor(scene: Phaser.Scene) {
    super()
    this.scene = scene

    // Initialize from registry
    this.currentScore = (scene.registry.get('score') as number | undefined) ?? 0

    // Load high score from local storage
    this.loadHighScore()
  }

  // ============================================
  // SCORE ACCESSORS
  // ============================================

  /**
   * Get current score
   */
  public getScore(): number {
    return this.currentScore
  }

  /**
   * Get high score
   */
  public getHighScore(): number {
    return this.highScore
  }

  /**
   * Check if player can afford a vowel
   */
  public canAffordVowel(): boolean {
    return this.currentScore >= VOWEL_COST
  }

  /**
   * Get vowel cost
   */
  public getVowelCost(): number {
    return VOWEL_COST
  }

  // ============================================
  // SCORE OPERATIONS
  // ============================================

  /**
   * Add points to the score
   */
  public addPoints(points: number): void {
    if (points <= 0) return

    const previousScore = this.currentScore
    this.currentScore += points

    // Update registry
    this.scene.registry.set('score', this.currentScore)

    // Emit event
    this.emit(ScoreEvents.POINTS_ADDED, {
      newScore: this.currentScore,
      pointsAdded: points,
      previousScore,
    })

    // Check for milestones
    this.checkMilestones(previousScore, this.currentScore)

    // Check for high score
    this.checkHighScore()
  }

  /**
   * Deduct points from the score
   */
  public deductPoints(points: number): boolean {
    if (points <= 0) return true
    if (this.currentScore < points) return false

    const previousScore = this.currentScore
    this.currentScore -= points

    // Update registry
    this.scene.registry.set('score', this.currentScore)

    // Emit event
    this.emit(ScoreEvents.POINTS_DEDUCTED, {
      newScore: this.currentScore,
      pointsDeducted: points,
      previousScore,
    })

    return true
  }

  /**
   * Reset score to zero (bankrupt)
   */
  public resetScore(): void {
    const previousScore = this.currentScore
    this.currentScore = 0
    this.lastMilestone = 0

    // Update registry
    this.scene.registry.set('score', 0)

    // Emit event
    this.emit(ScoreEvents.SCORE_RESET, {
      lostScore: previousScore,
    })
  }

  /**
   * Set score directly (for initialization or debug)
   */
  public setScore(score: number): void {
    this.currentScore = Math.max(0, score)
    this.scene.registry.set('score', this.currentScore)
  }

  // ============================================
  // CALCULATIONS
  // ============================================

  /**
   * Calculate points for a consonant guess
   */
  public calculateConsonantPoints(wedgeValue: number, letterCount: number): number {
    return wedgeValue * letterCount
  }

  /**
   * Calculate remaining score after buying a vowel
   */
  public calculateAfterVowelPurchase(): number {
    return Math.max(0, this.currentScore - VOWEL_COST)
  }

  // ============================================
  // MILESTONES
  // ============================================

  /**
   * Check if any milestone was reached
   */
  private checkMilestones(previousScore: number, newScore: number): void {
    for (const milestone of SCORE_MILESTONES) {
      if (previousScore < milestone && newScore >= milestone && milestone > this.lastMilestone) {
        this.lastMilestone = milestone

        this.emit(ScoreEvents.MILESTONE_REACHED, {
          milestone,
          score: newScore,
        })

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(`[ScoreSystem] Milestone reached: ${milestone}`)
        }

        // Only emit for the highest milestone crossed
        break
      }
    }
  }

  /**
   * Get next milestone
   */
  public getNextMilestone(): number | null {
    for (const milestone of SCORE_MILESTONES) {
      if (this.currentScore < milestone) {
        return milestone
      }
    }
    return null
  }

  /**
   * Get progress to next milestone (0-1)
   */
  public getMilestoneProgress(): number {
    const nextMilestone = this.getNextMilestone()
    if (nextMilestone === null) return 1

    const prevMilestone = this.lastMilestone || 0
    const range = nextMilestone - prevMilestone
    const progress = this.currentScore - prevMilestone

    return Math.min(1, progress / range)
  }

  // ============================================
  // HIGH SCORE
  // ============================================

  /**
   * Load high score from local storage
   */
  private loadHighScore(): void {
    try {
      const stored = localStorage.getItem('vowelMovement_highScore')
      this.highScore = stored ? parseInt(stored, 10) : 0
      this.scene.registry.set('highScore', this.highScore)
    } catch {
      // localStorage might be blocked
      this.highScore = 0
    }
  }

  /**
   * Save high score to local storage
   */
  private saveHighScore(): void {
    try {
      localStorage.setItem('vowelMovement_highScore', this.highScore.toString())
      this.scene.registry.set('highScore', this.highScore)
    } catch {
      // localStorage might be blocked
    }
  }

  /**
   * Check and update high score
   */
  private checkHighScore(): void {
    if (this.currentScore > this.highScore) {
      const previousHighScore = this.highScore
      this.highScore = this.currentScore
      this.saveHighScore()

      this.emit(ScoreEvents.HIGH_SCORE_BEATEN, {
        newHighScore: this.highScore,
        previousHighScore,
      })

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[ScoreSystem] New high score: ${this.highScore}`)
      }
    }
  }

  /**
   * Check if current score is a high score
   */
  public isHighScore(): boolean {
    return this.currentScore >= this.highScore && this.currentScore > 0
  }

  // ============================================
  // SYNC
  // ============================================

  /**
   * Sync score from registry (if changed externally)
   */
  public syncFromRegistry(): void {
    const registryScore = (this.scene.registry.get('score') as number | undefined) ?? 0
    if (registryScore !== this.currentScore) {
      this.currentScore = registryScore
    }
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.removeAllListeners()
  }
}
