/**
 * Boot Scene - Initial system setup
 *
 * First scene to run. Handles:
 * - System initialization
 * - Loading minimal assets needed for preloader
 * - Transitioning to PreloadScene
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { SceneKeys } from '../config/GameConfig'
import { GAME_HEIGHT, GAME_WIDTH } from '../data/constants'
import { getAudioSystem } from '../systems/AudioSystem'
import { getSaveSystem } from '../systems/SaveSystem'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SceneKeys.BOOT })
  }

  /**
   * Initialize scene state
   */
  init(): void {
    // Initialize SaveSystem and load persisted data
    const save = getSaveSystem()

    // Set up game registry defaults
    this.registry.set('score', 0)
    this.registry.set('highScore', save.getHighScore())

    // Restore mute state from save data
    const audio = getAudioSystem()
    if (save.getMuted()) {
      audio.setMuted(true)
    }
  }

  /**
   * Preload minimal assets needed for the preloader UI
   */
  preload(): void {
    // Create a simple loading indicator for the boot phase
    const { centerX, centerY } = this.cameras.main
    const bootText = this.add
      .text(centerX, centerY, 'INITIALIZING...', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: colors.textPrimary,
      })
      .setOrigin(0.5)

    // Fade in the boot text
    this.tweens.add({
      targets: bootText,
      alpha: { from: 0, to: 1 },
      duration: 200,
    })
  }

  /**
   * Create scene elements and transition to preloader
   */
  create(): void {
    // Log boot info in dev mode
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[BootScene] Game dimensions: ${GAME_WIDTH}x${GAME_HEIGHT}`)
      // eslint-disable-next-line no-console
      console.log(`[BootScene] Renderer: ${this.game.renderer.type === 1 ? 'WebGL' : 'Canvas'}`)
    }

    // Short delay then transition to preloader
    this.time.delayedCall(300, () => {
      this.scene.start(SceneKeys.PRELOAD)
    })
  }

}
