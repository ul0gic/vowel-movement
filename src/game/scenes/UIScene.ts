/**
 * UI Scene - HUD overlay (parallel scene)
 *
 * Runs parallel to GameScene to provide:
 * - Score display
 * - Game status messages
 * - Action feedback
 * - Solve modal
 *
 * This scene is launched alongside GameScene and overlays it.
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { SceneKeys } from '../config/GameConfig'
import { HUDEvents, HUDLayout } from '../ui/layouts/HUDLayout'

/**
 * Events the UIScene listens to and emits
 */
export const UIEvents = {
  HIDE_MESSAGE: 'hideMessage',
  SCORE_UPDATED: 'scoreUpdated',
  SHOW_MESSAGE: 'showMessage',
} as const

export class UIScene extends Phaser.Scene {
  private hudLayout!: HUDLayout

  constructor() {
    super({ key: SceneKeys.UI })
  }

  /**
   * Create HUD elements
   */
  create(): void {
    // Create HUD layout
    this.hudLayout = new HUDLayout(this)

    // Set up event listeners
    this.setupEvents()

    // Log for development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[UIScene] Created - HUD overlay active')
    }
  }

  /**
   * Set up event listeners for UI updates
   */
  private setupEvents(): void {
    // Listen for score updates from registry
    this.registry.events.on('changedata-score', (_parent: unknown, value: number) => {
      this.hudLayout.updateScore(value)
    })

    // Listen for message show events
    this.events.on(UIEvents.SHOW_MESSAGE, (data: { text: string; color?: string; duration?: number }) => {
      this.hudLayout.showMessage(data.text, data.color ?? colors.textPrimary, data.duration ?? 2000)
    })

    // Listen for message hide events
    this.events.on(UIEvents.HIDE_MESSAGE, () => {
      this.hudLayout.hideMessage()
    })

    // Listen for open solve modal event from GameScene
    this.events.on('openSolveModal', () => {
      if (!this.hudLayout.isSolveOpen()) {
        this.hudLayout.openSolveModal()
      }
    })

    // Listen for solve submitted from HUDLayout
    this.events.on(HUDEvents.SOLVE_SUBMITTED, (data: { guess: string }) => {
      this.handleSolveSubmit(data.guess)
    })

    // Clean up on shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.registry.events.off('changedata-score')
      this.events.off(UIEvents.SHOW_MESSAGE)
      this.events.off(UIEvents.HIDE_MESSAGE)
      this.events.off('openSolveModal')
      this.events.off(HUDEvents.SOLVE_SUBMITTED)
      this.hudLayout.destroy()
    })
  }

  /**
   * Handle solve attempt submission
   */
  private handleSolveSubmit(guess: string): void {
    // Get the game scene and attempt solve
    const gameScene = this.scene.get(SceneKeys.GAME) as unknown as { attemptSolve?: (guess: string) => void }
    if (typeof gameScene.attemptSolve === 'function') {
      gameScene.attemptSolve(guess)
    }
  }

  /**
   * Get the HUD layout
   */
  public getHUDLayout(): HUDLayout {
    return this.hudLayout
  }

  /**
   * Show a message directly (alternative to event)
   */
  public showMessage(text: string, color = colors.textPrimary, duration = 2000): void {
    this.hudLayout.showMessage(text, color, duration)
  }

  /**
   * Hide the message display
   */
  public hideMessage(): void {
    this.hudLayout.hideMessage()
  }

  /**
   * Open the solve modal
   */
  public openSolveModal(): void {
    this.hudLayout.openSolveModal()
  }

  /**
   * Close the solve modal
   */
  public closeSolveModal(): void {
    this.hudLayout.closeSolveModal()
  }
}
