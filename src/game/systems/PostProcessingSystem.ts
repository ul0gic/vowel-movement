/**
 * PostProcessingSystem - Visual effects overlay system
 *
 * Provides post-processing style effects using Phaser graphics:
 * - Vignette overlay for focus
 * - Screen glow pulse for big wins
 * - Bloom approximation using layered graphics
 */

import { gsap } from 'gsap'
import Phaser from 'phaser'

import { colors, hexToNumber } from '../../design-system/tokens/colors'
import { DEPTH_EFFECTS, GAME_HEIGHT, GAME_WIDTH } from '../data/constants'

/**
 * Vignette configuration
 */
const VIGNETTE_CONFIG = {
  /** Inner radius where vignette starts (as percentage of screen) */
  innerRadius: 0.5,
  /** Outer radius where vignette is darkest */
  outerRadius: 1.2,
  /** Base darkness of vignette */
  darkness: 0.4,
  /** Number of gradient steps */
  steps: 8,
} as const

/**
 * PostProcessingSystem singleton
 */
export class PostProcessingSystem {
  private static instance: PostProcessingSystem | null = null
  private scene: Phaser.Scene | null = null

  /** Vignette overlay graphics */
  private vignetteGraphics: Phaser.GameObjects.Graphics | null = null

  /** Screen glow overlay */
  private glowOverlay: Phaser.GameObjects.Graphics | null = null

  /** Current glow tween */
  private glowTween: gsap.core.Tween | null = null

  /** Glow animation state */
  private glowState = { alpha: 0, intensity: 0 }

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PostProcessingSystem {
    PostProcessingSystem.instance ??= new PostProcessingSystem()
    return PostProcessingSystem.instance
  }

  /**
   * Initialize with scene
   */
  public setScene(scene: Phaser.Scene): void {
    this.cleanup()
    this.scene = scene
  }

  /**
   * Create vignette overlay effect
   */
  public createVignette(): void {
    if (!this.scene) return

    this.vignetteGraphics = this.scene.add.graphics()
    this.vignetteGraphics.setDepth(DEPTH_EFFECTS + 50)

    this.drawVignette()
  }

  /**
   * Draw the vignette effect
   */
  private drawVignette(): void {
    if (!this.vignetteGraphics) return

    this.vignetteGraphics.clear()

    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2
    const maxDimension = Math.sqrt(GAME_WIDTH * GAME_WIDTH + GAME_HEIGHT * GAME_HEIGHT) / 2
    const { innerRadius, outerRadius, darkness, steps } = VIGNETTE_CONFIG

    // Draw gradient rings from outer to inner
    for (let i = steps - 1; i >= 0; i--) {
      const t = i / (steps - 1)
      const radius = maxDimension * (innerRadius + (outerRadius - innerRadius) * t)
      const alpha = darkness * t * t // Quadratic falloff for smoother vignette

      // Draw a ring using a filled rectangle with a circular cutout approximation
      // We'll draw overlapping circles with increasing transparency
      this.vignetteGraphics.fillStyle(0x000000, alpha)

      // Draw corners/edges more darkened
      const cornerRadius = radius * 0.7
      this.vignetteGraphics.fillRect(0, 0, GAME_WIDTH, cornerRadius)
      this.vignetteGraphics.fillRect(0, GAME_HEIGHT - cornerRadius, GAME_WIDTH, cornerRadius)
      this.vignetteGraphics.fillRect(0, 0, cornerRadius, GAME_HEIGHT)
      this.vignetteGraphics.fillRect(GAME_WIDTH - cornerRadius, 0, cornerRadius, GAME_HEIGHT)
    }

    // Softer vignette using radial gradient approximation
    const gradientSteps = 12
    for (let i = 0; i < gradientSteps; i++) {
      const t = i / (gradientSteps - 1)
      const radius = maxDimension * (1 - t * 0.6)
      const alpha = darkness * 0.15 * (1 - t)

      this.vignetteGraphics.lineStyle(maxDimension * 0.1, 0x000000, alpha)
      this.vignetteGraphics.strokeCircle(centerX, centerY, radius)
    }
  }

  /**
   * Create screen glow overlay (used for big win effects)
   */
  public createGlowOverlay(): void {
    if (!this.scene) return

    this.glowOverlay = this.scene.add.graphics()
    this.glowOverlay.setDepth(DEPTH_EFFECTS + 40)
    this.glowOverlay.setAlpha(0)
  }

  /**
   * Trigger screen glow pulse effect
   * Used for big wins, achievements, etc.
   */
  public pulseGlow(
    color: string = colors.wheelGold,
    intensity: number = 0.3,
    duration: number = 0.8
  ): void {
    if (!this.glowOverlay || !this.scene) return

    // Kill any existing glow tween
    if (this.glowTween) {
      this.glowTween.kill()
    }

    // Draw the glow overlay
    this.glowOverlay.clear()

    const colorNum = hexToNumber(color)
    const centerX = GAME_WIDTH / 2
    const centerY = GAME_HEIGHT / 2
    const maxDim = Math.max(GAME_WIDTH, GAME_HEIGHT)

    // Create radial glow from center
    const steps = 6
    for (let i = steps - 1; i >= 0; i--) {
      const t = i / (steps - 1)
      const radius = maxDim * 0.4 * (1 + t)
      const alpha = 0.15 * (1 - t)

      this.glowOverlay.fillStyle(colorNum, alpha)
      this.glowOverlay.fillCircle(centerX, centerY, radius)
    }

    // Edge glow
    this.glowOverlay.fillStyle(colorNum, 0.1)
    this.glowOverlay.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Animate the pulse
    this.glowState = { alpha: 0, intensity }

    this.glowTween = gsap.to(this.glowState, {
      alpha: intensity,
      duration: duration * 0.3,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onUpdate: () => {
        this.glowOverlay?.setAlpha(this.glowState.alpha)
      },
      onComplete: () => {
        this.glowOverlay?.setAlpha(0)
      },
    })
  }

  /**
   * Trigger a longer, more dramatic glow for big wins
   */
  public bigWinGlow(): void {
    if (!this.scene) return

    // Pulse multiple times with gold color
    const pulseCount = 3
    let currentPulse = 0

    const doPulse = () => {
      if (currentPulse >= pulseCount) return

      this.pulseGlow(colors.wheelGold, 0.4 - currentPulse * 0.1, 0.5)
      currentPulse++

      this.scene?.time.delayedCall(400, doPulse)
    }

    doPulse()
  }

  /**
   * Create a bloom-like glow around a game object
   */
  public addBloomToObject(
    target: Phaser.GameObjects.Container,
    color: string = colors.wheelGold,
    intensity: number = 0.5
  ): Phaser.GameObjects.Graphics | null {
    if (!this.scene) return null

    const bloom = this.scene.add.graphics()
    bloom.setDepth(target.depth - 1)

    // Get bounds of target
    const bounds = target.getBounds()
    const centerX = bounds.centerX - target.x
    const centerY = bounds.centerY - target.y
    const radius = Math.max(bounds.width, bounds.height) / 2

    // Draw bloom glow layers
    const colorNum = hexToNumber(color)
    const layers = 4

    for (let i = layers - 1; i >= 0; i--) {
      const t = i / (layers - 1)
      const layerRadius = radius * (1 + t * 0.5)
      const alpha = intensity * (1 - t) * 0.5

      bloom.fillStyle(colorNum, alpha)
      bloom.fillCircle(centerX, centerY, layerRadius)
    }

    return bloom
  }

  /**
   * Update vignette intensity (for dynamic effects)
   */
  public setVignetteIntensity(intensity: number): void {
    if (!this.vignetteGraphics) return
    this.vignetteGraphics.setAlpha(Math.max(0, Math.min(1, intensity)))
  }

  /**
   * Clean up all effects
   */
  public cleanup(): void {
    if (this.glowTween) {
      this.glowTween.kill()
      this.glowTween = null
    }

    if (this.vignetteGraphics) {
      this.vignetteGraphics.destroy()
      this.vignetteGraphics = null
    }

    if (this.glowOverlay) {
      this.glowOverlay.destroy()
      this.glowOverlay = null
    }

    this.scene = null
  }
}

/**
 * Get the global PostProcessing instance
 */
export function getPostProcessing(): PostProcessingSystem {
  return PostProcessingSystem.getInstance()
}
