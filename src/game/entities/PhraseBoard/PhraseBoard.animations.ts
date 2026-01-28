/**
 * Phrase board animations
 * Handles letter reveal effects, celebrations, and visual feedback
 */

import Phaser from 'phaser'

import {
  LETTER_REVEAL_DURATION,
  LETTER_REVEAL_STAGGER,
} from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'
import { getParticleSystem } from '../../systems/ParticleSystem'
import type { LetterTile } from './LetterTile'
import type { PhraseBoard } from './PhraseBoard'

/**
 * Animation configuration
 */
const ANIM_CONFIG = {
  /** Duration of flip animation in ms */
  flipDuration: LETTER_REVEAL_DURATION,

  /** Stagger delay between tiles */
  staggerDelay: LETTER_REVEAL_STAGGER,

  /** Glow fade duration */
  glowDuration: 500,

  /** Scale punch amount */
  scalePunch: 1.2,

  /** Base pitch for reveal sound (will be varied by position) */
  basePitch: 0.8,

  /** Pitch increment per tile position */
  pitchIncrement: 0.05,

  /** Anticipation scale (squish before flip) */
  anticipationScale: 0.95,

  /** Anticipation duration in ms */
  anticipationDuration: 50,
} as const

/**
 * Animate revealing a single letter tile with flip effect
 * Includes anticipation (squish) before the flip for better game feel
 */
export function animateTileFlip(
  scene: Phaser.Scene,
  tile: LetterTile,
  delay: number = 0,
  onComplete?: () => void
): void {
  const flipDuration = ANIM_CONFIG.flipDuration / 2

  // Phase 0: Anticipation (slight squish)
  scene.tweens.add({
    targets: tile,
    scaleY: ANIM_CONFIG.anticipationScale,
    duration: ANIM_CONFIG.anticipationDuration,
    delay,
    ease: 'Quad.easeIn',
    onComplete: () => {
      // Phase 1: Flip closed (scale X to 0) with Y bounce back
      scene.tweens.add({
        targets: tile,
        scaleX: 0,
        scaleY: 1.05,
        duration: flipDuration,
        ease: 'Cubic.easeIn',
        onComplete: () => {
          // Change tile appearance at midpoint
          tile.redrawBackground(true)
          tile.getLetterText().setVisible(true)

          // Phase 2: Flip open (scale X back to 1) with bounce
          scene.tweens.add({
            targets: tile,
            scaleX: 1,
            scaleY: 1,
            duration: flipDuration,
            ease: 'Back.easeOut',
            onComplete: () => {
              // Mark as revealed
              tile.reveal()

              // Add scale punch
              animateScalePunch(scene, tile)

              // Add glow effect
              animateGlow(scene, tile)

              onComplete?.()
            },
          })
        },
      })
    },
  })
}

/**
 * Add a quick scale punch for impact with bounce
 */
function animateScalePunch(scene: Phaser.Scene, tile: LetterTile): void {
  scene.tweens.add({
    targets: tile,
    scaleX: ANIM_CONFIG.scalePunch,
    scaleY: ANIM_CONFIG.scalePunch,
    duration: 120,
    ease: 'Elastic.easeOut',
    yoyo: true,
  })
}

/**
 * Animate the glow effect on reveal
 */
function animateGlow(scene: Phaser.Scene, tile: LetterTile): void {
  const glow = tile.getGlow()

  // Fade in glow
  scene.tweens.add({
    targets: glow,
    alpha: 0.8,
    duration: 100,
    ease: 'Quad.easeOut',
    onComplete: () => {
      // Fade out glow
      scene.tweens.add({
        targets: glow,
        alpha: 0,
        duration: ANIM_CONFIG.glowDuration,
        ease: 'Quad.easeIn',
      })
    },
  })
}

/**
 * Animate revealing a letter (may be multiple tiles)
 * Staggered reveal with pitched sounds
 */
export function animateRevealLetter(
  scene: Phaser.Scene,
  tiles: LetterTile[]
): void {
  // Sort tiles by their index for consistent left-to-right reveal
  const sortedTiles = [...tiles].sort((a, b) => a.index - b.index)

  sortedTiles.forEach((tile, i) => {
    const delay = i * ANIM_CONFIG.staggerDelay

    // Animate the flip
    animateTileFlip(scene, tile, delay, () => {
      // Play reveal sound with pitch based on tile position
      playRevealSound(tile.index)
    })
  })
}

/**
 * Play reveal sound with pitch variation based on tile position
 */
function playRevealSound(tileIndex: number): void {
  getAudioSystem().playLetterReveal(tileIndex)
}

/**
 * Animate revealing all remaining letters with celebration
 */
export function animateRevealAll(
  scene: Phaser.Scene,
  tiles: LetterTile[],
  board: PhraseBoard
): void {
  // Sort tiles by their index
  const sortedTiles = [...tiles].sort((a, b) => a.index - b.index)

  // Faster stagger for reveal all
  const fastStagger = ANIM_CONFIG.staggerDelay / 2

  sortedTiles.forEach((tile, i) => {
    const delay = i * fastStagger

    animateTileFlip(scene, tile, delay, () => {
      // Play pitched reveal sound
      playRevealSound(tile.index)

      // On last tile, trigger celebration
      if (i === sortedTiles.length - 1) {
        scene.time.delayedCall(200, () => {
          animateCelebration(scene, board)
        })
      }
    })
  })
}

/**
 * Create celebration particle effect
 */
export function animateCelebration(
  _scene: Phaser.Scene,
  board: PhraseBoard
): void {
  // Get board position in world coordinates
  const worldPos = board.getWorldTransformMatrix()
  const centerX = worldPos.tx
  const centerY = worldPos.ty

  // Use the particle system for celebration effects
  const particles = getParticleSystem()
  particles.confetti(centerX, centerY)
  particles.risingStars(centerX, centerY - 50, 15)
}


/**
 * Animate wrong guess feedback (shake the board)
 */
export function animateWrongGuess(
  scene: Phaser.Scene,
  board: PhraseBoard
): void {
  // Quick horizontal shake
  const originalX = board.x

  scene.tweens.add({
    targets: board,
    x: originalX - 10,
    duration: 50,
    ease: 'Quad.easeInOut',
    yoyo: true,
    repeat: 3,
    onComplete: () => {
      board.setX(originalX)
    },
  })

  // Play wrong sound (placeholder)
  playWrongSound(scene)
}

/**
 * Play wrong guess sound
 * Placeholder for Phase 8 audio implementation
 */
function playWrongSound(_scene: Phaser.Scene): void {
  // Will be implemented in Phase 8 with AudioSystem
  // scene.sound.play('wrongGuess')

  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[PhraseBoard] Wrong guess sound would play')
  }
}

/**
 * Animate board entry (when new phrase is set)
 */
export function animateBoardEntry(
  scene: Phaser.Scene,
  board: PhraseBoard
): void {
  // Start from above and fade in
  const targetY = board.y
  board.setY(targetY - 50)
  board.setAlpha(0)

  scene.tweens.add({
    targets: board,
    y: targetY,
    alpha: 1,
    duration: 500,
    ease: 'Back.easeOut',
  })
}

/**
 * Animate board exit (when game ends)
 */
export function animateBoardExit(
  scene: Phaser.Scene,
  board: PhraseBoard,
  onComplete?: () => void
): void {
  scene.tweens.add({
    targets: board,
    y: board.y + 50,
    alpha: 0,
    duration: 300,
    ease: 'Quad.easeIn',
    onComplete,
  })
}

/**
 * Highlight a specific tile (for hints or focus)
 */
export function animateTileHighlight(
  scene: Phaser.Scene,
  tile: LetterTile,
  duration: number = 1000
): void {
  const glow = tile.getGlow()

  // Pulsing glow
  scene.tweens.add({
    targets: glow,
    alpha: 0.6,
    duration: duration / 2,
    ease: 'Sine.easeInOut',
    yoyo: true,
    repeat: -1,
  })
}

/**
 * Stop tile highlight
 */
export function stopTileHighlight(
  scene: Phaser.Scene,
  tile: LetterTile
): void {
  const glow = tile.getGlow()

  scene.tweens.killTweensOf(glow)

  scene.tweens.add({
    targets: glow,
    alpha: 0,
    duration: 200,
    ease: 'Quad.easeOut',
  })
}
