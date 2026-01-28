/**
 * Keyboard animations
 *
 * Provides satisfying press and release animations for keyboard keys.
 */
import Phaser from 'phaser'

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
