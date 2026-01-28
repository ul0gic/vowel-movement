/**
 * Button - Modern game button component
 *
 * Features:
 * - Gradient backgrounds
 * - Drop shadows for depth
 * - Glow effects
 * - Icon support (left/right)
 * - Ripple effect on click
 * - GSAP animations
 * - Hover and press states with visual feedback
 * - Disabled state
 */
import Phaser from 'phaser'

import { colors, gradients, hexToNumber, shadows } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_UI } from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'
import { animate, Easing, killTweens } from '../../utils/gsap'

/**
 * Button style variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'

/**
 * Button size presets
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button options
 */
export interface ButtonOptions {
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Button text */
  text: string
  /** Button width (auto if not specified) */
  width?: number
  /** Button height */
  height?: number
  /** Style variant */
  variant?: ButtonVariant
  /** Size preset */
  size?: ButtonSize
  /** Fill color (overrides variant) */
  fillColor?: string
  /** Stroke color (overrides variant) */
  strokeColor?: string
  /** Text color */
  textColor?: string
  /** Font size (overrides size preset) */
  fontSize?: number
  /** Whether button starts disabled */
  disabled?: boolean
  /** Click callback */
  onClick?: () => void
  /** Enable glow effect */
  glow?: boolean
  /** Glow color */
  glowColor?: string
  /** Border radius */
  borderRadius?: number
  /** Icon texture key (shows left of text) */
  icon?: string
  /** Icon on right side */
  iconRight?: boolean
  /** Icon scale */
  iconScale?: number
}

/**
 * Button events
 */
export const ButtonEvents = {
  CLICK: 'button:click',
  HOVER_END: 'button:hoverEnd',
  HOVER_START: 'button:hoverStart',
} as const

/**
 * Size presets
 */
const SIZE_PRESETS: Record<ButtonSize, { height: number; fontSize: number; padding: number; borderRadius: number }> = {
  sm: { height: 36, fontSize: 14, padding: 16, borderRadius: 8 },
  md: { height: 48, fontSize: 16, padding: 24, borderRadius: 10 },
  lg: { height: 56, fontSize: 20, padding: 32, borderRadius: 12 },
  xl: { height: 72, fontSize: 28, padding: 40, borderRadius: 16 },
}

/**
 * Variant colors
 */
const VARIANT_COLORS: Record<ButtonVariant, { fill: readonly [string, string]; stroke: string; glow: string }> = {
  primary: { fill: gradients.primary, stroke: colors.secondary, glow: colors.primary },
  secondary: { fill: gradients.secondary, stroke: colors.primary, glow: colors.secondary },
  success: { fill: gradients.success, stroke: colors.success, glow: colors.success },
  danger: { fill: gradients.danger, stroke: colors.danger, glow: colors.danger },
  ghost: { fill: ['transparent', 'transparent'] as const, stroke: colors.textSecondary, glow: colors.textSecondary },
}

/**
 * Modern Button class
 */
export class Button extends Phaser.GameObjects.Container {
  declare scene: Phaser.Scene

  /** Shadow graphics */
  private shadowGraphics: Phaser.GameObjects.Graphics | null = null

  /** Glow graphics */
  private glowGraphics: Phaser.GameObjects.Graphics | null = null

  /** Background graphics */
  private background: Phaser.GameObjects.Graphics

  /** Highlight overlay for hover */
  private highlightOverlay: Phaser.GameObjects.Graphics

  /** Button text */
  private buttonText: Phaser.GameObjects.Text

  /** Icon image */
  private iconImage: Phaser.GameObjects.Image | null = null

  /** Button dimensions */
  private buttonWidth: number
  private buttonHeight: number
  private borderRadius: number

  /** Colors */
  private fillColors: readonly [string, string]
  private strokeColor: string
  private textColor: string
  private glowColor: string

  /** State */
  private isDisabled: boolean = false
  private isHovered: boolean = false
  private isPressed: boolean = false

  /** Options reference */
  private options: ButtonOptions

  /** Click callback */
  private onClickCallback: (() => void) | null = null

  constructor(scene: Phaser.Scene, options: ButtonOptions) {
    super(scene, options.x, options.y)

    this.options = options

    // Get size preset
    const sizePreset = SIZE_PRESETS[options.size ?? 'md']

    // Get variant colors
    const variant = options.variant ?? 'primary'
    const variantColors = VARIANT_COLORS[variant]

    // Set colors (options override variant)
    this.fillColors = options.fillColor
      ? [options.fillColor, options.fillColor]
      : variantColors.fill
    this.strokeColor = options.strokeColor ?? variantColors.stroke
    this.textColor = options.textColor ?? colors.textPrimary
    this.glowColor = options.glowColor ?? variantColors.glow
    this.borderRadius = options.borderRadius ?? sizePreset.borderRadius

    this.isDisabled = options.disabled ?? false
    this.onClickCallback = options.onClick ?? null

    // Add to scene
    scene.add.existing(this)
    this.setDepth(DEPTH_UI)

    // Create text to measure
    const fontSize = options.fontSize ?? sizePreset.fontSize
    this.buttonText = scene.add
      .text(0, 0, options.text, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${fontSize}px`,
        color: this.textColor,
        resolution: 2,
      })
      .setOrigin(0.5)

    // Calculate dimensions
    const iconWidth = options.icon ? fontSize + 8 : 0
    this.buttonWidth = options.width ?? this.buttonText.width + sizePreset.padding * 2 + iconWidth
    this.buttonHeight = options.height ?? sizePreset.height

    // Create layers
    this.createShadow()
    this.createGlow()
    this.background = this.createBackground()
    this.highlightOverlay = this.createHighlightOverlay()
    this.createIcon(options, fontSize)

    // Add text last (on top)
    this.add(this.buttonText)
    this.positionTextAndIcon()

    // Set up interactivity
    this.setSize(this.buttonWidth, this.buttonHeight)
    if (!this.isDisabled) {
      this.setInteractive({ useHandCursor: true })
      this.setupEvents()
    }
  }

  /**
   * Create drop shadow
   */
  private createShadow(): void {
    if (this.options.variant === 'ghost') return

    this.shadowGraphics = this.scene.add.graphics()
    const shadow = shadows.sm

    this.shadowGraphics.fillStyle(shadow.color, shadow.alpha)
    this.shadowGraphics.fillRoundedRect(
      -this.buttonWidth / 2 + shadow.offsetX,
      -this.buttonHeight / 2 + shadow.offsetY,
      this.buttonWidth,
      this.buttonHeight,
      this.borderRadius
    )

    this.add(this.shadowGraphics)
  }

  /**
   * Create glow effect
   */
  private createGlow(): void {
    if (!this.options.glow) return

    this.glowGraphics = this.scene.add.graphics()

    // Draw multiple layers for glow
    for (let i = 3; i > 0; i--) {
      const expand = i * 3
      const alpha = 0.1 / i
      this.glowGraphics.fillStyle(hexToNumber(this.glowColor), alpha)
      this.glowGraphics.fillRoundedRect(
        -this.buttonWidth / 2 - expand,
        -this.buttonHeight / 2 - expand,
        this.buttonWidth + expand * 2,
        this.buttonHeight + expand * 2,
        this.borderRadius + expand / 2
      )
    }

    this.glowGraphics.setVisible(false) // Show on hover
    this.add(this.glowGraphics)
  }

  /**
   * Create background with gradient
   */
  private createBackground(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics()
    this.drawBackground(graphics, false, false)
    this.add(graphics)
    return graphics
  }

  /**
   * Draw the button background with gradient
   */
  private drawBackground(
    graphics: Phaser.GameObjects.Graphics,
    isHovered: boolean,
    isPressed: boolean
  ): void {
    graphics.clear()

    const isGhost = this.options.variant === 'ghost'

    if (this.isDisabled) {
      // Disabled state
      graphics.fillStyle(hexToNumber(colors.surface), 0.5)
      graphics.fillRoundedRect(
        -this.buttonWidth / 2,
        -this.buttonHeight / 2,
        this.buttonWidth,
        this.buttonHeight,
        this.borderRadius
      )
    } else if (!isGhost) {
      // Draw gradient fill
      const steps = 8
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1)
        const color = this.lerpColor(
          hexToNumber(this.fillColors[0]),
          hexToNumber(this.fillColors[1]),
          t
        )

        // Adjust brightness for states
        let alpha = 0.9
        if (isPressed) {
          alpha = 0.95
        } else if (isHovered) {
          alpha = 1
        }

        const segmentHeight = this.buttonHeight / steps
        const y = -this.buttonHeight / 2 + i * segmentHeight

        graphics.fillStyle(color, alpha)

        if (i === 0) {
          graphics.fillRoundedRect(
            -this.buttonWidth / 2,
            y,
            this.buttonWidth,
            segmentHeight + 1,
            { tl: this.borderRadius, tr: this.borderRadius, bl: 0, br: 0 }
          )
        } else if (i === steps - 1) {
          graphics.fillRoundedRect(
            -this.buttonWidth / 2,
            y,
            this.buttonWidth,
            segmentHeight,
            { tl: 0, tr: 0, bl: this.borderRadius, br: this.borderRadius }
          )
        } else {
          graphics.fillRect(-this.buttonWidth / 2, y, this.buttonWidth, segmentHeight + 1)
        }
      }
    }

    // Draw border
    let strokeAlpha = isGhost ? 0.5 : 0.7
    if (isHovered) strokeAlpha = 1
    if (this.isDisabled) strokeAlpha = 0.3

    graphics.lineStyle(2, hexToNumber(this.strokeColor), strokeAlpha)
    graphics.strokeRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      this.borderRadius
    )
  }

  /**
   * Create highlight overlay for hover effect
   */
  private createHighlightOverlay(): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics()

    // Top edge highlight
    graphics.fillStyle(0xFFFFFF, 0.15)
    graphics.fillRoundedRect(
      -this.buttonWidth / 2 + 2,
      -this.buttonHeight / 2 + 2,
      this.buttonWidth - 4,
      this.buttonHeight / 3,
      { tl: this.borderRadius - 2, tr: this.borderRadius - 2, bl: 0, br: 0 }
    )

    graphics.setAlpha(0)
    this.add(graphics)
    return graphics
  }

  /**
   * Create icon if specified
   */
  private createIcon(options: ButtonOptions, _fontSize: number): void {
    if (!options.icon) return

    // Check if texture exists
    if (!this.scene.textures.exists(options.icon)) {
      console.warn(`[Button] Icon texture not found: ${options.icon}`)
      return
    }

    this.iconImage = this.scene.add.image(0, 0, options.icon)
    this.iconImage.setScale(options.iconScale ?? 1)
    this.add(this.iconImage)
  }

  /**
   * Position text and icon
   */
  private positionTextAndIcon(): void {
    if (!this.iconImage) {
      this.buttonText.setPosition(0, 0)
      return
    }

    const iconWidth = this.iconImage.displayWidth
    const gap = 8
    const totalWidth = iconWidth + gap + this.buttonText.width

    if (this.options.iconRight) {
      this.buttonText.setPosition(-totalWidth / 2 + this.buttonText.width / 2, 0)
      this.iconImage.setPosition(totalWidth / 2 - iconWidth / 2, 0)
    } else {
      this.iconImage.setPosition(-totalWidth / 2 + iconWidth / 2, 0)
      this.buttonText.setPosition(totalWidth / 2 - this.buttonText.width / 2, 0)
    }
  }

  /**
   * Linear interpolation between colors
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

  /**
   * Set up pointer events
   */
  private setupEvents(): void {
    this.on('pointerover', () => {
      if (this.isDisabled) return
      this.isHovered = true
      this.onHoverStart()
    })

    this.on('pointerout', () => {
      this.isHovered = false
      this.isPressed = false
      this.onHoverEnd()
    })

    this.on('pointerdown', () => {
      if (this.isDisabled) return
      this.isPressed = true
      this.onPressStart()
    })

    this.on('pointerup', () => {
      if (this.isDisabled || !this.isPressed) return
      this.isPressed = false
      this.onPressEnd()
      this.handleClick()
    })
  }

  /**
   * Handle hover start
   */
  private onHoverStart(): void {
    this.drawBackground(this.background, true, false)

    // Show glow
    if (this.glowGraphics) {
      this.glowGraphics.setVisible(true)
      animate(this.glowGraphics, {
        alpha: 1,
        duration: 0.2,
        ease: Easing.smoothOut,
      })
    }

    // Show highlight
    animate(this.highlightOverlay, {
      alpha: 1,
      duration: 0.15,
      ease: Easing.smoothOut,
    })

    // Scale up slightly
    animate(this, {
      scaleX: 1.02,
      scaleY: 1.02,
      duration: 0.15,
      ease: Easing.smoothOut,
    })

    this.emit(ButtonEvents.HOVER_START)
  }

  /**
   * Handle hover end
   */
  private onHoverEnd(): void {
    this.drawBackground(this.background, false, false)

    // Hide glow
    if (this.glowGraphics) {
      animate(this.glowGraphics, {
        alpha: 0,
        duration: 0.2,
        ease: Easing.smoothIn,
        onComplete: () => {
          this.glowGraphics?.setVisible(false)
        },
      })
    }

    // Hide highlight
    animate(this.highlightOverlay, {
      alpha: 0,
      duration: 0.15,
      ease: Easing.smoothIn,
    })

    // Scale back
    animate(this, {
      scaleX: 1,
      scaleY: 1,
      duration: 0.15,
      ease: Easing.smoothOut,
    })

    this.emit(ButtonEvents.HOVER_END)
  }

  /**
   * Handle press start
   */
  private onPressStart(): void {
    this.drawBackground(this.background, true, true)

    animate(this, {
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 0.05,
      ease: Easing.smoothOut,
    })
  }

  /**
   * Handle press end
   */
  private onPressEnd(): void {
    this.drawBackground(this.background, true, false)

    animate(this, {
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 0.1,
      ease: Easing.back,
      onComplete: () => {
        if (this.isHovered) {
          animate(this, {
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 0.1,
            ease: Easing.smoothOut,
          })
        } else {
          animate(this, {
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
            ease: Easing.smoothOut,
          })
        }
      },
    })
  }

  /**
   * Handle click
   */
  private handleClick(): void {
    getAudioSystem().playUIClick()
    this.emit(ButtonEvents.CLICK)
    this.onClickCallback?.()
  }

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled

    if (disabled) {
      this.disableInteractive()
      this.buttonText.setColor(colors.textSecondary)
      if (this.iconImage) {
        this.iconImage.setAlpha(0.5)
      }
    } else {
      this.setInteractive({ useHandCursor: true })
      this.buttonText.setColor(this.textColor)
      if (this.iconImage) {
        this.iconImage.setAlpha(1)
      }
    }

    this.drawBackground(this.background, false, false)
  }

  /**
   * Check if button is disabled
   */
  public isButtonDisabled(): boolean {
    return this.isDisabled
  }

  /**
   * Update button text
   */
  public setText(text: string): void {
    this.buttonText.setText(text)
    this.positionTextAndIcon()
  }

  /**
   * Set click callback
   */
  public setOnClick(callback: () => void): void {
    this.onClickCallback = callback
  }

  /**
   * Animate entry
   */
  public animateEntry(delay: number = 0): void {
    this.setAlpha(0)
    this.setScale(0.8)

    animate(this, {
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 0.3,
      delay,
      ease: Easing.back,
    })
  }

  /**
   * Flash the button
   */
  public flash(): void {
    animate(this, {
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: Easing.smoothOut,
    })

    // Flash glow
    if (this.glowGraphics) {
      this.glowGraphics.setVisible(true)
      animate(this.glowGraphics, {
        alpha: 1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: Easing.smoothOut,
        onComplete: () => {
          if (!this.isHovered) {
            this.glowGraphics?.setVisible(false)
          }
        },
      })
    }
  }

  /**
   * Pulse animation for attention
   */
  public pulse(): void {
    animate(this, {
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 0.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut',
    })
  }

  /**
   * Stop all animations
   */
  public stopAnimations(): void {
    killTweens(this)
    if (this.glowGraphics) killTweens(this.glowGraphics)
    killTweens(this.highlightOverlay)
    this.setScale(1)
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.stopAnimations()
    this.onClickCallback = null
    this.shadowGraphics?.destroy()
    this.glowGraphics?.destroy()
    this.iconImage?.destroy()
    super.destroy(fromScene)
  }
}
