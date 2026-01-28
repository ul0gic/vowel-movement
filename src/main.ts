/**
 * Vowel Movement - Entry Point
 *
 * Initializes the Phaser game with the configured settings
 */
import Phaser from 'phaser'

import './design-system/styles/base.css'
import './design-system/styles/ui.css'
import { gameConfig } from './game/config/GameConfig'

/**
 * Initialize the Phaser game
 */
const game = new Phaser.Game(gameConfig)

// Development mode logging
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log('Vowel Movement - Development mode')
  // eslint-disable-next-line no-console
  console.log('Phaser version:', Phaser.VERSION)

  // Expose game instance for debugging
  // @ts-expect-error - Global debug reference
  window.__PHASER_GAME__ = game
}

export { game }
