/**
 * Button - Reusable game button component
 *
 * Features:
 * - Hover and press states with visual feedback
 * - Customizable colors and sizes
 * - Disabled state
 * - Click callback
 * - Animated transitions
 */
import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_UI } from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'

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
  /** Fill color */
  fillColor?: string
  /** Stroke color */
  strokeColor?: string
  /** Text color */
  textColor?: string
  /** Font size */
  fontSize?: number
  /** Whether button starts disabled */
  disabled?: boolean
  /** Click callback */
  onClick?: () => void
}

/**
 * Button events
 */
export const ButtonEvents = {
  CLICK: 'button:click',
  HOVER_START: 'button:hoverStart',
  HOVER_END: 'button:hoverEnd',
} as const

/**
 * Button class
 */
export class Button extends Phaser.GameObjects.Container {
  /** Reference to scene - using declare to override parent */
  declare scene: Phaser.Scene

  /** Background graphics */
  private background: Phaser.GameObjects.Graphics

  /** Button text */
  private buttonText: Phaser.GameObjects.Text

  /** Button dimensions */
  private buttonWidth: number
  private buttonHeight: number

  /** Colors */
  private fillColor: string
  private strokeColor: string
  private textColor: string

  /** State */
  private isDisabled: boolean = false
  private isHovered: boolean = false
  private isPressed: boolean = false

  /** Click callback */
  private onClickCallback: (() => void) | null = null

  constructor(scene: Phaser.Scene, options: ButtonOptions) {
    super(scene, options.x, options.y)

    this.fillColor = options.fillColor ?? colors.primary
    this.strokeColor = options.strokeColor ?? colors.secondary
    this.textColor = options.textColor ?? colors.textPrimary
    this.isDisabled = options.disabled ?? false
    this.onClickCallback = options.onClick ?? null

    // Add to scene
    scene.add.existing(this)
    this.setDepth(DEPTH_UI)

    // Create text first to measure with high resolution
    this.buttonText = scene.add
      .text(0, 0, options.text, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${options.fontSize ?? typography.fontSize.lg}px`,
        color: this.textColor,
        resolution: 2,
      })
      .setOrigin(0.5)

    // Calculate dimensions
    const padding = 32
    this.buttonWidth = options.width ?? this.buttonText.width + padding * 2
    this.buttonHeight = options.height ?? 56

    // Create background
    this.background = scene.add.graphics()
    this.drawBackground()

    // Add to container
    this.add([this.background, this.buttonText])

    // Set up interactivity
    this.setSize(this.buttonWidth, this.buttonHeight)
    if (!this.isDisabled) {
      this.setInteractive({ useHandCursor: true })
      this.setupEvents()
    }
  }

  /**
   * Set up pointer events
   */
  private setupEvents(): void {
    this.on('pointerover', () => {
      if (this.isDisabled) return
      this.isHovered = true
      this.drawBackground()
      this.emit(ButtonEvents.HOVER_START)
    })

    this.on('pointerout', () => {
      this.isHovered = false
      this.isPressed = false
      this.drawBackground()
      this.animateReset()
      this.emit(ButtonEvents.HOVER_END)
    })

    this.on('pointerdown', () => {
      if (this.isDisabled) return
      this.isPressed = true
      this.drawBackground()
      this.animatePress()
    })

    this.on('pointerup', () => {
      if (this.isDisabled || !this.isPressed) return
      this.isPressed = false
      this.drawBackground()
      this.animateRelease()
      this.handleClick()
    })
  }

  /**
   * Draw the button background
   */
  private drawBackground(): void {
    this.background.clear()

    let fillColor = this.fillColor
    let alpha = 0.9
    let strokeAlpha = 0.7

    if (this.isDisabled) {
      fillColor = colors.surface
      alpha = 0.5
      strokeAlpha = 0.3
    } else if (this.isPressed) {
      alpha = 1
      strokeAlpha = 1
    } else if (this.isHovered) {
      alpha = 1
      strokeAlpha = 0.9
    }

    // Fill
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(fillColor).color,
      alpha
    )
    this.background.fillRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      8
    )

    // Stroke
    this.background.lineStyle(
      2,
      Phaser.Display.Color.HexStringToColor(this.strokeColor).color,
      strokeAlpha
    )
    this.background.strokeRoundedRect(
      -this.buttonWidth / 2,
      -this.buttonHeight / 2,
      this.buttonWidth,
      this.buttonHeight,
      8
    )
  }

  /**
   * Animate button press
   */
  private animatePress(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      ease: 'Cubic.easeOut',
    })
  }

  /**
   * Animate button release
   */
  private animateRelease(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.animateReset()
      },
    })
  }

  /**
   * Animate reset to normal
   */
  private animateReset(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1,
      scaleY: 1,
      duration: 100,
      ease: 'Cubic.easeOut',
    })
  }

  /**
   * Handle click
   */
  private handleClick(): void {
    // Play UI click sound
    getAudioSystem().playUIClick()

    this.emit(ButtonEvents.CLICK)
    if (this.onClickCallback) {
      this.onClickCallback()
    }
  }

  /**
   * Set disabled state
   */
  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled

    if (disabled) {
      this.disableInteractive()
      this.buttonText.setColor(colors.textSecondary)
    } else {
      this.setInteractive({ useHandCursor: true })
      this.buttonText.setColor(this.textColor)
    }

    this.drawBackground()
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

    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      delay,
      ease: 'Back.easeOut',
    })
  }

  /**
   * Flash the button
   */
  public flash(): void {
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 100,
      yoyo: true,
      ease: 'Cubic.easeOut',
    })
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.onClickCallback = null
    super.destroy(fromScene)
  }
}
