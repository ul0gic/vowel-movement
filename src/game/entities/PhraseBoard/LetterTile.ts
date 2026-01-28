/**
 * Individual letter tile for the phrase board
 * Represents a single letter box that can be revealed with animation
 * Features modern styling with depth, shadows, and gradients
 */

import Phaser from 'phaser'

import { colors, hexToNumber, shadows } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { TILE_HEIGHT, TILE_WIDTH } from '../../data/constants'

/**
 * Tile types for different display behaviors
 */
export type TileType = 'letter' | 'punctuation' | 'space'

/**
 * Configuration for tile appearance - Modern design with depth and shadows
 */
const TILE_CONFIG = {
  /** Background color for unrevealed letter tiles (base) */
  backgroundColor: colors.tileHidden,

  /** Border color for tiles */
  borderColor: colors.tileBorder,

  /** Border width */
  borderWidth: 3,

  /** Corner radius for rounded tiles */
  cornerRadius: 12,

  /** Color when tile is revealed (base) */
  revealedColor: colors.tileRevealed,

  /** Glow color on reveal */
  glowColor: colors.glowCyan,

  /** Letter color */
  letterColor: colors.letterColor,

  /** Punctuation color (always visible) */
  punctuationColor: colors.accent,

  /** Shadow offset for 3D depth effect */
  shadowOffset: 4,

  /** Inner highlight opacity */
  highlightOpacity: 0.25,

  /** Gradient steps for smooth color transitions */
  gradientSteps: 4,
} as const

/**
 * LetterTile - Individual letter box on the phrase board
 * Extends Phaser.GameObjects.Container to hold tile elements
 */
export class LetterTile extends Phaser.GameObjects.Container {
  /** The character this tile represents */
  private readonly character: string

  /** Type of tile (letter, punctuation, space) */
  private readonly tileType: TileType

  /** Whether the tile has been revealed */
  private _isRevealed: boolean

  /** Background graphics */
  private background!: Phaser.GameObjects.Graphics

  /** The letter text object */
  private letterText!: Phaser.GameObjects.Text

  /** Glow effect graphics */
  private glow!: Phaser.GameObjects.Graphics

  /** Index position in the phrase (for staggered animations) */
  public readonly index: number

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    character: string,
    index: number
  ) {
    super(scene, x, y)

    this.character = character.toUpperCase()
    this.index = index
    this.tileType = this.determineTileType(character)
    this._isRevealed = this.tileType !== 'letter' // Non-letters start revealed

    this.createTile()

    // Add to scene
    scene.add.existing(this)
  }

  /**
   * Determine the type of tile based on character
   */
  private determineTileType(char: string): TileType {
    if (char === ' ') {
      return 'space'
    }
    // Check if it's a letter (A-Z)
    if (/^[A-Za-z]$/.test(char)) {
      return 'letter'
    }
    // Everything else is punctuation
    return 'punctuation'
  }

  /**
   * Create the tile visual elements
   */
  private createTile(): void {
    // Create glow effect (hidden by default)
    this.createGlow()

    // Create background
    this.createBackground()

    // Create letter text
    this.createLetterText()

    // Set initial visibility based on tile type
    this.updateVisibility()
  }

  /**
   * Create the glow effect for reveal animation - Modern multi-layer glow
   */
  private createGlow(): void {
    this.glow = this.scene.add.graphics()

    const { cornerRadius } = TILE_CONFIG
    const glowColor = hexToNumber(TILE_CONFIG.glowColor)

    // Multi-layer glow for smoother effect
    const glowLayers = [
      { padding: 16, alpha: 0.15 },
      { padding: 12, alpha: 0.25 },
      { padding: 8, alpha: 0.35 },
      { padding: 4, alpha: 0.5 },
    ]

    glowLayers.forEach(({ padding, alpha }) => {
      this.glow.fillStyle(glowColor, alpha)
      this.glow.fillRoundedRect(
        -TILE_WIDTH / 2 - padding,
        -TILE_HEIGHT / 2 - padding,
        TILE_WIDTH + padding * 2,
        TILE_HEIGHT + padding * 2,
        cornerRadius + padding / 2
      )
    })

    this.glow.setAlpha(0)
    this.add(this.glow)
  }

  /**
   * Create the background rectangle with modern 3D styling
   */
  private createBackground(): void {
    this.background = this.scene.add.graphics()

    // Space tiles are invisible
    if (this.tileType === 'space') {
      this.add(this.background)
      return
    }

    // Draw the tile background with modern styling
    const isRevealed = this.tileType !== 'letter' || this._isRevealed
    this.drawModernTileBackground(isRevealed)

    this.add(this.background)
  }

  /**
   * Draw modern tile background with gradients, shadows, and depth
   */
  private drawModernTileBackground(revealed: boolean): void {
    this.background.clear()

    const baseColor = revealed ? TILE_CONFIG.revealedColor : TILE_CONFIG.backgroundColor
    const baseColorNum = hexToNumber(baseColor)
    const { cornerRadius, shadowOffset, highlightOpacity, gradientSteps } = TILE_CONFIG

    // 1. Draw drop shadow for 3D depth
    this.background.fillStyle(shadows.md.color, shadows.md.alpha)
    this.background.fillRoundedRect(
      -TILE_WIDTH / 2 + shadowOffset,
      -TILE_HEIGHT / 2 + shadowOffset,
      TILE_WIDTH,
      TILE_HEIGHT,
      cornerRadius
    )

    // 2. Draw gradient background (darker at bottom for 3D effect)
    for (let i = 0; i < gradientSteps; i++) {
      const t = i / (gradientSteps - 1)
      const segmentHeight = TILE_HEIGHT / gradientSteps
      const y = -TILE_HEIGHT / 2 + i * segmentHeight

      // Darken color towards bottom
      const brightness = revealed ? (1 - t * 0.1) : (0.9 - t * 0.2)
      const color = this.adjustColorBrightness(baseColorNum, brightness)

      this.background.fillStyle(color, 1)

      if (i === 0) {
        // Top segment with rounded corners
        this.background.fillRoundedRect(
          -TILE_WIDTH / 2,
          y,
          TILE_WIDTH,
          segmentHeight + 1,
          { tl: cornerRadius, tr: cornerRadius, bl: 0, br: 0 }
        )
      } else if (i === gradientSteps - 1) {
        // Bottom segment with rounded corners
        this.background.fillRoundedRect(
          -TILE_WIDTH / 2,
          y,
          TILE_WIDTH,
          segmentHeight,
          { tl: 0, tr: 0, bl: cornerRadius, br: cornerRadius }
        )
      } else {
        // Middle segments
        this.background.fillRect(-TILE_WIDTH / 2, y, TILE_WIDTH, segmentHeight + 1)
      }
    }

    // 3. Draw top highlight (glass effect)
    this.background.fillStyle(0xFFFFFF, highlightOpacity)
    this.background.fillRoundedRect(
      -TILE_WIDTH / 2 + 3,
      -TILE_HEIGHT / 2 + 3,
      TILE_WIDTH - 6,
      TILE_HEIGHT * 0.35,
      { tl: cornerRadius - 3, tr: cornerRadius - 3, bl: 0, br: 0 }
    )

    // 4. Draw inner shadow at bottom (more depth)
    if (!revealed) {
      this.background.fillStyle(0x000000, 0.2)
      this.background.fillRoundedRect(
        -TILE_WIDTH / 2 + 2,
        TILE_HEIGHT / 2 - 12,
        TILE_WIDTH - 4,
        10,
        { tl: 0, tr: 0, bl: cornerRadius - 2, br: cornerRadius - 2 }
      )
    }

    // 5. Draw border with gradient effect
    const borderColor = revealed
      ? hexToNumber(colors.tileBorder)
      : this.adjustColorBrightness(hexToNumber(colors.wheelPurple), 1.3)
    const borderAlpha = revealed ? 1 : 0.8

    this.background.lineStyle(TILE_CONFIG.borderWidth, borderColor, borderAlpha)
    this.background.strokeRoundedRect(
      -TILE_WIDTH / 2,
      -TILE_HEIGHT / 2,
      TILE_WIDTH,
      TILE_HEIGHT,
      cornerRadius
    )

    // 6. Add subtle outer glow for unrevealed tiles
    if (!revealed) {
      this.background.lineStyle(1, hexToNumber(colors.primary), 0.3)
      this.background.strokeRoundedRect(
        -TILE_WIDTH / 2 - 1,
        -TILE_HEIGHT / 2 - 1,
        TILE_WIDTH + 2,
        TILE_HEIGHT + 2,
        cornerRadius + 1
      )
    }
  }

  /**
   * Adjust brightness of a color
   */
  private adjustColorBrightness(color: number, factor: number): number {
    const r = Math.min(255, Math.round(((color >> 16) & 0xFF) * factor))
    const g = Math.min(255, Math.round(((color >> 8) & 0xFF) * factor))
    const b = Math.min(255, Math.round((color & 0xFF) * factor))
    return (r << 16) | (g << 8) | b
  }

  /**
   * Create the letter text
   */
  private createLetterText(): void {
    // Determine text color based on tile type
    const textColor =
      this.tileType === 'punctuation'
        ? TILE_CONFIG.punctuationColor
        : TILE_CONFIG.letterColor

    this.letterText = this.scene.add
      .text(0, 0, this.character, {
        color: textColor,
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['2xl']}px`,
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5)

    this.add(this.letterText)
  }

  /**
   * Update visibility based on tile state
   */
  private updateVisibility(): void {
    if (this.tileType === 'space') {
      // Space tiles are completely invisible
      this.letterText.setVisible(false)
      return
    }

    if (this.tileType === 'punctuation') {
      // Punctuation is always visible
      this.letterText.setVisible(true)
      return
    }

    // Letter tiles - only show letter when revealed
    this.letterText.setVisible(this._isRevealed)
  }

  /**
   * Redraw background (used during reveal animation)
   */
  public redrawBackground(revealed: boolean): void {
    if (this.tileType !== 'letter') return
    this.drawModernTileBackground(revealed)
  }

  /**
   * Reveal the letter (without animation - animation is handled by PhraseBoard.animations)
   */
  public reveal(): void {
    if (this._isRevealed || this.tileType !== 'letter') {
      return
    }

    this._isRevealed = true
    this.redrawBackground(true)
    this.letterText.setVisible(true)
  }

  /**
   * Check if this tile contains a specific letter
   */
  public hasLetter(letter: string): boolean {
    return (
      this.tileType === 'letter' &&
      this.character.toUpperCase() === letter.toUpperCase()
    )
  }

  /**
   * Get whether tile is revealed
   */
  public get isRevealed(): boolean {
    return this._isRevealed
  }

  /**
   * Get the character
   */
  public getCharacter(): string {
    return this.character
  }

  /**
   * Get the tile type
   */
  public getTileType(): TileType {
    return this.tileType
  }

  /**
   * Get the glow graphics for animation
   */
  public getGlow(): Phaser.GameObjects.Graphics {
    return this.glow
  }

  /**
   * Get the letter text for animation
   */
  public getLetterText(): Phaser.GameObjects.Text {
    return this.letterText
  }

  /**
   * Get the background graphics for animation
   */
  public getBackground(): Phaser.GameObjects.Graphics {
    return this.background
  }
}
