/**
 * Panel - Modern glassmorphism panel component
 *
 * Features:
 * - Frosted glass effect with blur simulation
 * - Gradient backgrounds
 * - Drop shadows for depth
 * - Rounded corners
 * - Optional border glow
 * - GSAP entrance animations
 */
import Phaser from 'phaser'

import { colors, gradients, hexToNumber, shadows } from '../../../design-system/tokens/colors'
import { DEPTH_UI } from '../../data/constants'
import { animate, bounceIn, Easing } from '../../utils/gsap'

/**
 * Panel configuration options
 */
export interface PanelOptions {
  /** Panel width */
  width: number
  /** Panel height */
  height: number
  /** X position */
  x?: number
  /** Y position */
  y?: number
  /** Corner radius (default 16) */
  borderRadius?: number
  /** Background style */
  style?: 'glass' | 'solid' | 'gradient'
  /** Gradient key if style is gradient */
  gradientKey?: keyof typeof gradients
  /** Solid color if style is solid */
  solidColor?: string
  /** Border color (optional) */
  borderColor?: string
  /** Border width (default 2) */
  borderWidth?: number
  /** Enable glow effect */
  glow?: boolean
  /** Glow color (default primary) */
  glowColor?: string
  /** Shadow size */
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  /** Background alpha (default 0.9 for solid, 0.15 for glass) */
  alpha?: number
  /** Depth/z-index */
  depth?: number
}

/**
 * Panel component - Reusable glassmorphism panel
 */
export class Panel extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene

  /** Background graphics - stored for potential future use */
  public background: Phaser.GameObjects.Graphics
  private glowGraphics: Phaser.GameObjects.Graphics | null = null
  private shadowGraphics: Phaser.GameObjects.Graphics | null = null
  private borderGraphics: Phaser.GameObjects.Graphics | null = null

  private panelWidth: number
  private panelHeight: number
  private borderRadius: number
  private options: PanelOptions

  constructor(scene: Phaser.Scene, options: PanelOptions) {
    super(scene, options.x ?? 0, options.y ?? 0)

    this.panelWidth = options.width
    this.panelHeight = options.height
    this.borderRadius = options.borderRadius ?? 16
    this.options = options

    scene.add.existing(this)
    this.setDepth(options.depth ?? DEPTH_UI)

    // Create layers in order: shadow -> glow -> background -> border
    this.createShadow()
    this.createGlow()
    this.background = this.createBackground()
    this.createBorder()
  }

  /**
   * Create drop shadow layer
   */
  private createShadow(): void {
    const shadowSize = this.options.shadow ?? 'md'
    if (shadowSize === 'none') return

    const shadowConfig = shadows[shadowSize]
    this.shadowGraphics = this.scene.add.graphics()

    // Draw shadow (offset and blurred rectangle)
    this.shadowGraphics.fillStyle(shadowConfig.color, shadowConfig.alpha)
    this.shadowGraphics.fillRoundedRect(
      -this.panelWidth / 2 + shadowConfig.offsetX,
      -this.panelHeight / 2 + shadowConfig.offsetY,
      this.panelWidth + shadowConfig.blur / 2,
      this.panelHeight + shadowConfig.blur / 2,
      this.borderRadius
    )

    this.add(this.shadowGraphics)
  }

  /**
   * Create glow effect layer
   */
  private createGlow(): void {
    if (!this.options.glow) return

    const glowColor = this.options.glowColor ?? colors.primary
    this.glowGraphics = this.scene.add.graphics()

    // Draw multiple layers for glow effect
    const layers = 3
    for (let i = layers; i > 0; i--) {
      const expand = i * 4
      const alpha = 0.15 / i
      this.glowGraphics.fillStyle(hexToNumber(glowColor), alpha)
      this.glowGraphics.fillRoundedRect(
        -this.panelWidth / 2 - expand,
        -this.panelHeight / 2 - expand,
        this.panelWidth + expand * 2,
        this.panelHeight + expand * 2,
        this.borderRadius + expand / 2
      )
    }

    this.add(this.glowGraphics)
  }

  /**
   * Create main background
   */
  private createBackground(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics()
    const style = this.options.style ?? 'glass'

    if (style === 'glass') {
      this.drawGlassBackground(graphics)
    } else if (style === 'gradient') {
      this.drawGradientBackground(graphics)
    } else {
      this.drawSolidBackground(graphics)
    }

    this.add(graphics)
    return graphics
  }

  /**
   * Draw glassmorphism background
   */
  private drawGlassBackground(graphics: Phaser.GameObjects.Graphics): void {
    const alpha = this.options.alpha ?? 0.15

    // Base dark layer
    graphics.fillStyle(hexToNumber(colors.surface), alpha * 2)
    graphics.fillRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      this.borderRadius
    )

    // Light overlay for frosted effect (top edge highlight)
    graphics.fillStyle(0xFFFFFF, alpha * 0.5)
    graphics.fillRoundedRect(
      -this.panelWidth / 2 + 1,
      -this.panelHeight / 2 + 1,
      this.panelWidth - 2,
      this.panelHeight / 3,
      { tl: this.borderRadius - 1, tr: this.borderRadius - 1, bl: 0, br: 0 }
    )

    // Inner subtle gradient simulation
    graphics.fillStyle(0xFFFFFF, alpha * 0.1)
    graphics.fillRoundedRect(
      -this.panelWidth / 2 + 2,
      -this.panelHeight / 2 + 2,
      this.panelWidth - 4,
      this.panelHeight - 4,
      this.borderRadius - 2
    )
  }

  /**
   * Draw gradient background
   */
  private drawGradientBackground(graphics: Phaser.GameObjects.Graphics): void {
    const gradientKey = this.options.gradientKey ?? 'panel'
    const gradient = gradients[gradientKey]
    const alpha = this.options.alpha ?? 0.9

    // Since Phaser Graphics doesn't support true gradients,
    // we simulate with layered rectangles
    const steps = 10
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const color = this.lerpColor(
        hexToNumber(gradient[0]),
        hexToNumber(gradient[1]),
        t
      )
      const segmentHeight = this.panelHeight / steps
      const y = -this.panelHeight / 2 + i * segmentHeight

      graphics.fillStyle(color, alpha)

      if (i === 0) {
        // Top segment with rounded corners
        graphics.fillRoundedRect(
          -this.panelWidth / 2,
          y,
          this.panelWidth,
          segmentHeight + 1,
          { tl: this.borderRadius, tr: this.borderRadius, bl: 0, br: 0 }
        )
      } else if (i === steps - 1) {
        // Bottom segment with rounded corners
        graphics.fillRoundedRect(
          -this.panelWidth / 2,
          y,
          this.panelWidth,
          segmentHeight,
          { tl: 0, tr: 0, bl: this.borderRadius, br: this.borderRadius }
        )
      } else {
        // Middle segments
        graphics.fillRect(-this.panelWidth / 2, y, this.panelWidth, segmentHeight + 1)
      }
    }
  }

  /**
   * Draw solid color background
   */
  private drawSolidBackground(graphics: Phaser.GameObjects.Graphics): void {
    const color = this.options.solidColor ?? colors.surface
    const alpha = this.options.alpha ?? 0.9

    graphics.fillStyle(hexToNumber(color), alpha)
    graphics.fillRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      this.borderRadius
    )
  }

  /**
   * Create border layer
   */
  private createBorder(): void {
    const borderColor = this.options.borderColor
    if (!borderColor && !this.options.glow) return

    this.borderGraphics = this.scene.add.graphics()
    const color = borderColor ?? (this.options.glowColor ?? colors.primary)
    const width = this.options.borderWidth ?? 2
    const alpha = borderColor ? 0.8 : 0.4

    this.borderGraphics.lineStyle(width, hexToNumber(color), alpha)
    this.borderGraphics.strokeRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      this.borderRadius
    )

    this.add(this.borderGraphics)
  }

  /**
   * Linear interpolation between two colors
   */
  private lerpColor(color1: number, color2: number, t: number): number {
    const r1 = (color1 >> 16) & 0xFF
    const g1 = (color1 >> 8) & 0xFF
    const b1 = color1 & 0xFF

    const r2 = (color2 >> 16) & 0xFF
    const g2 = (color2 >> 8) & 0xFF
    const b2 = color2 & 0xFF

    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)

    return (r << 16) | (g << 8) | b
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Get panel dimensions
   */
  public getSize(): { width: number; height: number } {
    return { width: this.panelWidth, height: this.panelHeight }
  }

  /**
   * Animate panel entrance
   */
  public animateIn(
    direction: 'top' | 'bottom' | 'left' | 'right' | 'scale' = 'scale',
    delay: number = 0
  ): void {
    bounceIn(this, 0.5, { delay, from: direction })
  }

  /**
   * Animate panel exit
   */
  public animateOut(onComplete?: () => void): void {
    animate(this, {
      alpha: 0,
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 0.3,
      ease: Easing.smoothIn,
      onComplete,
    })
  }

  /**
   * Pulse the glow effect
   */
  public pulseGlow(): void {
    if (!this.glowGraphics) return

    animate(this.glowGraphics, {
      alpha: 1.5,
      duration: 0.3,
      ease: Easing.smoothOut,
      yoyo: true,
      repeat: 1,
    })
  }

  /**
   * Set glow visibility
   */
  public setGlowVisible(visible: boolean): void {
    if (this.glowGraphics) {
      this.glowGraphics.setVisible(visible)
    }
  }

  /**
   * Update border color
   */
  public setBorderColor(color: string): void {
    if (!this.borderGraphics) return

    this.borderGraphics.clear()
    this.borderGraphics.lineStyle(
      this.options.borderWidth ?? 2,
      hexToNumber(color),
      0.8
    )
    this.borderGraphics.strokeRoundedRect(
      -this.panelWidth / 2,
      -this.panelHeight / 2,
      this.panelWidth,
      this.panelHeight,
      this.borderRadius
    )
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.shadowGraphics?.destroy()
    this.glowGraphics?.destroy()
    this.borderGraphics?.destroy()
    super.destroy(fromScene)
  }
}

/**
 * Create a simple glass panel
 */
export function createGlassPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: Partial<PanelOptions> = {}
): Panel {
  return new Panel(scene, {
    x,
    y,
    width,
    height,
    style: 'glass',
    glow: true,
    glowColor: colors.secondary,
    shadow: 'md',
    ...options,
  })
}

/**
 * Create a solid panel with gradient
 */
export function createGradientPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  gradientKey: keyof typeof gradients = 'panel',
  options: Partial<PanelOptions> = {}
): Panel {
  return new Panel(scene, {
    x,
    y,
    width,
    height,
    style: 'gradient',
    gradientKey,
    shadow: 'md',
    ...options,
  })
}
