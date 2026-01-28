/**
 * Wheel animations and visual feedback
 * Tick animation, pointer bounce, and visual effects
 */

import Phaser from 'phaser'

/**
 * Animation configuration
 */
export const WheelAnimConfig = {
  /** Duration of pointer tick animation in ms */
  tickDuration: 40,

  /** Pointer rotation angle for tick (degrees) */
  tickAngle: 20,

  /** Scale punch on landing */
  landingScale: 1.08,

  /** Duration of landing celebration in ms */
  landingDuration: 300,
} as const

/**
 * Tracks segment crossings for tick feedback
 */
export interface TickTracker {
  /** Last segment index the wheel was on */
  lastSegmentIndex: number
  /** Number of ticks since spin started */
  tickCount: number
}

/**
 * Creates initial tick tracker
 */
export function createTickTracker(): TickTracker {
  return {
    lastSegmentIndex: 0,
    tickCount: 0,
  }
}

/**
 * Checks if we crossed a segment boundary and should tick
 * @param tracker Current tick tracker
 * @param currentSegmentIndex Current segment the pointer is on
 * @returns Updated tracker and whether we should tick
 */
export function checkTick(
  tracker: TickTracker,
  currentSegmentIndex: number
): { tracker: TickTracker; shouldTick: boolean } {
  if (currentSegmentIndex !== tracker.lastSegmentIndex) {
    return {
      shouldTick: true,
      tracker: {
        lastSegmentIndex: currentSegmentIndex,
        tickCount: tracker.tickCount + 1,
      },
    }
  }

  return {
    shouldTick: false,
    tracker,
  }
}

/**
 * Animates pointer tick when crossing segment boundary
 * @param scene The Phaser scene
 * @param pointer The pointer game object to animate
 * @param velocity Current wheel velocity (affects tick intensity)
 */
export function animatePointerTick(
  scene: Phaser.Scene,
  pointer: Phaser.GameObjects.GameObject,
  velocity: number
): void {
  // Scale tick intensity based on velocity
  const intensity = Math.min(velocity / 10, 1)
  const tickAngle = WheelAnimConfig.tickAngle * intensity

  // Only animate if pointer has rotation property
  if (!('rotation' in pointer)) return

  const pointerWithRotation = pointer as Phaser.GameObjects.GameObject & {
    rotation: number
  }

  scene.tweens.add({
    duration: WheelAnimConfig.tickDuration,
    ease: 'Quad.easeOut',
    rotation: pointerWithRotation.rotation + Phaser.Math.DegToRad(tickAngle),
    targets: pointer,
    yoyo: true,
  })
}

/**
 * Animates the wheel on landing with a satisfying bounce
 * @param scene The Phaser scene
 * @param wheel The wheel container to animate
 */
export function animateWheelLanding(
  scene: Phaser.Scene,
  wheel: Phaser.GameObjects.Container
): void {
  // Scale punch with elastic bounce
  scene.tweens.add({
    duration: WheelAnimConfig.landingDuration,
    ease: 'Elastic.easeOut',
    scaleX: WheelAnimConfig.landingScale,
    scaleY: WheelAnimConfig.landingScale,
    targets: wheel,
    yoyo: true,
  })
}

/**
 * Creates a flash effect on a segment
 * @param scene The Phaser scene
 * @param graphics Graphics object to flash
 */
export function flashSegment(
  scene: Phaser.Scene,
  graphics: Phaser.GameObjects.Graphics
): void {
  scene.tweens.add({
    alpha: 0.5,
    duration: 100,
    repeat: 3,
    targets: graphics,
    yoyo: true,
  })
}
