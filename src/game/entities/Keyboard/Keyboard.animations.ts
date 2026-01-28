/**
 * Keyboard animations
 *
 * Provides satisfying press and release animations for keyboard keys.
 */
import { gsap } from 'gsap'
import Phaser from 'phaser'

import { Easing } from '../../utils/gsap'

/**
 * Animation durations
 */
const PRESS_DURATION = 50
const RESET_DURATION = 100

/**
 * Animate key press (scale down slightly)
 */
export function animateKeyPress(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: container,
    scaleX: 0.92,
    scaleY: 0.92,
    duration: PRESS_DURATION,
    ease: 'Cubic.easeOut',
  })
}

/**
 * Animate key reset (return to normal scale)
 */
export function animateKeyReset(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: container,
    scaleX: 1,
    scaleY: 1,
    duration: RESET_DURATION,
    ease: 'Back.easeOut',
  })
}

/**
 * Animate key success (pulse)
 */
export function animateKeySuccess(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): Phaser.Tweens.Tween {
  return scene.tweens.add({
    targets: container,
    scaleX: 1.1,
    scaleY: 1.1,
    duration: 100,
    yoyo: true,
    ease: 'Cubic.easeOut',
  })
}

/**
 * Animate key error (shake)
 */
export function animateKeyError(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): Phaser.Tweens.Tween {
  const originalX = container.x

  return scene.tweens.add({
    targets: container,
    x: { from: originalX - 4, to: originalX + 4 },
    duration: 50,
    yoyo: true,
    repeat: 2,
    ease: 'Sine.easeInOut',
    onComplete: () => {
      container.x = originalX
    },
  })
}

/**
 * Animate keyboard entry (fade in and slide up)
 */
export function animateKeyboardEntry(
  scene: Phaser.Scene,
  keyboard: Phaser.GameObjects.Container
): void {
  keyboard.setAlpha(0)
  keyboard.y += 50

  scene.tweens.add({
    targets: keyboard,
    alpha: 1,
    y: keyboard.y - 50,
    duration: 300,
    ease: 'Back.easeOut',
    delay: 200,
  })
}

/**
 * Animate keyboard exit (fade out and slide down)
 */
export function animateKeyboardExit(
  scene: Phaser.Scene,
  keyboard: Phaser.GameObjects.Container,
  onComplete?: () => void
): void {
  scene.tweens.add({
    targets: keyboard,
    alpha: 0,
    y: keyboard.y + 50,
    duration: 200,
    ease: 'Cubic.easeIn',
    onComplete,
  })
}

/**
 * Animate keyboard keys with GSAP staggered wave effect
 * Keys animate in from bottom with scale and opacity
 */
export function animateKeyboardStaggerEntry(
  keyContainers: Phaser.GameObjects.Container[],
  onComplete?: () => void
): gsap.core.Timeline {
  // Store original positions and set initial state
  const originalData = keyContainers.map((container) => ({
    x: container.x,
    y: container.y,
    scaleX: container.scaleX,
    scaleY: container.scaleY,
    alpha: container.alpha,
  }))

  // Set initial hidden state - keys start below and invisible
  keyContainers.forEach((container) => {
    container.setAlpha(0)
    container.setScale(0.5)
    container.y += 30
  })

  // Create GSAP timeline for orchestrated animation
  const tl = gsap.timeline({
    onComplete,
  })

  // Animate all keys with stagger - wave effect from left to right
  tl.to(keyContainers, {
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    y: (index) => originalData[index]?.y ?? keyContainers[index]?.y ?? 0,
    duration: 0.35,
    ease: Easing.back,
    stagger: {
      amount: 0.6, // Total stagger time spread across all keys
      from: 'start', // Start from first key (leftmost)
      grid: 'auto',
      ease: 'power1.inOut',
    },
  })

  return tl
}

/**
 * Animate single row of keys with wave effect
 */
export function animateRowStaggerEntry(
  keyContainers: Phaser.GameObjects.Container[],
  delay: number = 0,
  onComplete?: () => void
): gsap.core.Tween {
  // Store original Y and set initial state
  const originalYs = keyContainers.map((container) => container.y)

  keyContainers.forEach((container) => {
    container.setAlpha(0)
    container.setScale(0.6)
    container.y += 25
  })

  return gsap.to(keyContainers, {
    alpha: 1,
    scaleX: 1,
    scaleY: 1,
    y: (index) => originalYs[index] ?? keyContainers[index]?.y ?? 0,
    duration: 0.3,
    ease: Easing.back,
    delay,
    stagger: {
      amount: 0.25,
      from: 'center', // Wave from center outward for visual interest
    },
    onComplete,
  })
}
