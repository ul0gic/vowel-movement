/**
 * ParticleSystem - Reusable particle effects for game juice
 *
 * Provides various particle effects:
 * - Celebration confetti
 * - Score popup particles
 * - Win sparkles
 * - Bankrupt explosion
 * - Letter reveal glow
 */

import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { DEPTH_EFFECTS } from '../data/constants'

/**
 * Particle configuration
 */
interface ParticleConfig {
  /** Particle count */
  count: number
  /** Minimum size */
  sizeMin: number
  /** Maximum size */
  sizeMax: number
  /** Minimum lifetime in ms */
  lifetimeMin: number
  /** Maximum lifetime in ms */
  lifetimeMax: number
  /** Minimum speed */
  speedMin: number
  /** Maximum speed */
  speedMax: number
  /** Gravity (positive = down) */
  gravity: number
  /** Color palette */
  colors: string[]
}

/**
 * Default configurations for different effect types
 */
const PARTICLE_CONFIGS = {
  confetti: {
    colors: [colors.primary, colors.secondary, colors.accent, colors.success, colors.wheelGold, colors.wheelPink],
    count: 80,
    gravity: 400,
    lifetimeMax: 2000,
    lifetimeMin: 1500,
    sizeMax: 12,
    sizeMin: 6,
    speedMax: 600,
    speedMin: 300,
  },
  sparkle: {
    colors: [colors.accent, colors.wheelGold, colors.glowWhite, colors.glowYellow],
    count: 30,
    gravity: 50,
    lifetimeMax: 800,
    lifetimeMin: 400,
    sizeMax: 8,
    sizeMin: 3,
    speedMax: 200,
    speedMin: 50,
  },
  explosion: {
    colors: [colors.danger, colors.wheelRed, colors.warning, colors.wheelOrange],
    count: 40,
    gravity: 200,
    lifetimeMax: 1000,
    lifetimeMin: 600,
    sizeMax: 16,
    sizeMin: 8,
    speedMax: 500,
    speedMin: 200,
  },
  scorePopup: {
    colors: [colors.success, colors.accent, colors.wheelGold],
    count: 15,
    gravity: -100,
    lifetimeMax: 1200,
    lifetimeMin: 800,
    sizeMax: 6,
    sizeMin: 3,
    speedMax: 150,
    speedMin: 50,
  },
} as const satisfies Record<string, ParticleConfig>

/**
 * ParticleSystem singleton class
 */
export class ParticleSystem {
  private static instance: ParticleSystem | null = null
  private scene: Phaser.Scene | null = null
  private activeParticles: Phaser.GameObjects.Graphics[] = []

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ParticleSystem {
    ParticleSystem.instance ??= new ParticleSystem()
    return ParticleSystem.instance
  }

  /**
   * Set the active scene
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene
  }

  /**
   * Clean up when scene changes
   */
  public cleanup(): void {
    for (const particle of this.activeParticles) {
      if (particle.active) {
        particle.destroy()
      }
    }
    this.activeParticles = []
  }

  /**
   * Create a burst of confetti particles (for wins)
   */
  public confetti(x: number, y: number, config?: Partial<ParticleConfig>): void {
    const mergedConfig: ParticleConfig = { ...PARTICLE_CONFIGS.confetti, ...config }
    this.createBurst(x, y, mergedConfig)
  }

  /**
   * Create sparkle effect (for reveals)
   */
  public sparkle(x: number, y: number, config?: Partial<ParticleConfig>): void {
    const mergedConfig: ParticleConfig = { ...PARTICLE_CONFIGS.sparkle, ...config }
    this.createBurst(x, y, mergedConfig)
  }

  /**
   * Create explosion effect (for bankrupt)
   */
  public explosion(x: number, y: number, config?: Partial<ParticleConfig>): void {
    const mergedConfig: ParticleConfig = { ...PARTICLE_CONFIGS.explosion, ...config }
    this.createBurst(x, y, mergedConfig)
  }

  /**
   * Create score popup particles
   */
  public scorePopup(x: number, y: number, config?: Partial<ParticleConfig>): void {
    const mergedConfig: ParticleConfig = { ...PARTICLE_CONFIGS.scorePopup, ...config }
    this.createBurst(x, y, mergedConfig)
  }

  /**
   * Create a multi-point confetti shower (full screen celebration)
   */
  public celebrationShower(screenWidth: number, _screenHeight: number): void {
    if (!this.scene) return

    // Create multiple burst points across the top of the screen
    const numPoints = 5
    for (let i = 0; i < numPoints; i++) {
      const x = (screenWidth / (numPoints + 1)) * (i + 1)
      const delay = i * 100

      this.scene.time.delayedCall(delay, () => {
        this.confetti(x, 50, {
          count: 40,
          speedMax: 400,
          speedMin: 200,
        })
      })
    }
  }

  /**
   * Create a particle burst at the specified position
   */
  private createBurst(x: number, y: number, config: ParticleConfig): void {
    if (!this.scene) return

    const particles: Phaser.GameObjects.Graphics[] = []

    for (let i = 0; i < config.count; i++) {
      const particle = this.scene.add.graphics()
      particle.setDepth(DEPTH_EFFECTS)

      // Random color from palette
      const colorHex = config.colors[i % config.colors.length] ?? colors.primary
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color

      // Random size
      const size = Phaser.Math.Between(config.sizeMin, config.sizeMax)

      // Draw particle (random shape for variety)
      particle.fillStyle(color, 1)
      if (Math.random() > 0.5) {
        // Circle
        particle.fillCircle(0, 0, size / 2)
      } else {
        // Square/Rectangle
        const width = size
        const height = size * Phaser.Math.FloatBetween(0.5, 1.5)
        particle.fillRect(-width / 2, -height / 2, width, height)
      }

      // Position at origin
      particle.setPosition(x, y)

      // Random velocity
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2)
      const speed = Phaser.Math.Between(config.speedMin, config.speedMax)
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed

      // Random lifetime
      const lifetime = Phaser.Math.Between(config.lifetimeMin, config.lifetimeMax)

      // Random rotation
      const rotationSpeed = Phaser.Math.FloatBetween(-5, 5)

      // Animate particle with physics-like motion
      this.scene.tweens.add({
        targets: particle,
        x: x + velocityX,
        y: y + velocityY + (config.gravity * lifetime) / 1000,
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.3 },
        rotation: rotationSpeed * (lifetime / 1000),
        duration: lifetime,
        ease: 'Quad.easeOut',
        onComplete: () => {
          particle.destroy()
          const index = this.activeParticles.indexOf(particle)
          if (index > -1) {
            this.activeParticles.splice(index, 1)
          }
        },
      })

      particles.push(particle)
      this.activeParticles.push(particle)
    }
  }

  /**
   * Create rising star particles (for score milestones)
   */
  public risingStars(x: number, y: number, count: number = 10): void {
    if (!this.scene) return

    for (let i = 0; i < count; i++) {
      const star = this.scene.add.graphics()
      star.setDepth(DEPTH_EFFECTS)

      // Gold/yellow stars
      const colorHex = i % 2 === 0 ? colors.wheelGold : colors.accent
      const color = Phaser.Display.Color.HexStringToColor(colorHex).color

      // Draw a star shape
      star.fillStyle(color, 1)
      this.drawStar(star, 0, 0, 5, 8, 4)

      // Position with horizontal spread
      const offsetX = Phaser.Math.Between(-50, 50)
      star.setPosition(x + offsetX, y)

      // Rising animation with fade
      const delay = i * 50
      star.setAlpha(0)
      star.setScale(0.5)

      this.scene.tweens.add({
        targets: star,
        y: y - Phaser.Math.Between(100, 200),
        alpha: { from: 1, to: 0 },
        scale: { from: 1, to: 0.3 },
        duration: Phaser.Math.Between(800, 1200),
        delay,
        ease: 'Quad.easeOut',
        onComplete: () => {
          star.destroy()
        },
      })

      // Slight horizontal drift
      this.scene.tweens.add({
        targets: star,
        x: star.x + Phaser.Math.Between(-30, 30),
        duration: Phaser.Math.Between(800, 1200),
        delay,
        ease: 'Sine.easeInOut',
      })

      this.activeParticles.push(star)
    }
  }

  /**
   * Draw a star shape
   */
  private drawStar(
    graphics: Phaser.GameObjects.Graphics,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3
    const step = Math.PI / spikes

    graphics.beginPath()
    graphics.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      graphics.lineTo(
        cx + Math.cos(rot) * outerRadius,
        cy + Math.sin(rot) * outerRadius
      )
      rot += step

      graphics.lineTo(
        cx + Math.cos(rot) * innerRadius,
        cy + Math.sin(rot) * innerRadius
      )
      rot += step
    }

    graphics.lineTo(cx, cy - outerRadius)
    graphics.closePath()
    graphics.fillPath()
  }
}

/**
 * Get the global particle system instance
 */
export function getParticleSystem(): ParticleSystem {
  return ParticleSystem.getInstance()
}
