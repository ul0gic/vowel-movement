/**
 * Individual letter tile for the phrase board
 * Represents a single letter box that can be revealed with animation
 */

import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { TILE_HEIGHT, TILE_WIDTH } from '../../data/constants'

/**
 * Tile types for different display behaviors
 */
export type TileType = 'letter' | 'punctuation' | 'space'

/**
 * Configuration for tile appearance
 */
const TILE_CONFIG = {
  /** Background color for unrevealed letter tiles */
  backgroundColor: colors.tileHidden,

  /** Border color for tiles */
  borderColor: colors.tileBorder,

  /** Border width */
  borderWidth: 3,

  /** Corner radius for rounded tiles */
  cornerRadius: 8,

  /** Color when tile is revealed */
  revealedColor: colors.tileRevealed,

  /** Glow color on reveal */
  glowColor: colors.glowCyan,

  /** Letter color */
  letterColor: colors.letterColor,

  /** Punctuation color (always visible) */
  punctuationColor: colors.accent,
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
   * Create the glow effect for reveal animation
   */
  private createGlow(): void {
    this.glow = this.scene.add.graphics()

    // Draw glow rectangle slightly larger than tile
    const padding = 8
    this.glow.fillStyle(
      Phaser.Display.Color.HexStringToColor(TILE_CONFIG.glowColor).color,
      0.5
    )
    this.glow.fillRoundedRect(
      -TILE_WIDTH / 2 - padding,
      -TILE_HEIGHT / 2 - padding,
      TILE_WIDTH + padding * 2,
      TILE_HEIGHT + padding * 2,
      TILE_CONFIG.cornerRadius + 4
    )

    this.glow.setAlpha(0)
    this.add(this.glow)
  }

  /**
   * Create the background rectangle
   */
  private createBackground(): void {
    this.background = this.scene.add.graphics()

    // Space tiles are invisible
    if (this.tileType === 'space') {
      this.add(this.background)
      return
    }

    // Draw the tile background
    const fillColor =
      this.tileType === 'letter' && !this._isRevealed
        ? TILE_CONFIG.backgroundColor
        : TILE_CONFIG.revealedColor

    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(fillColor).color,
      1
    )
    this.background.fillRoundedRect(
      -TILE_WIDTH / 2,
      -TILE_HEIGHT / 2,
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_CONFIG.cornerRadius
    )

    // Draw border
    this.background.lineStyle(
      TILE_CONFIG.borderWidth,
      Phaser.Display.Color.HexStringToColor(TILE_CONFIG.borderColor).color,
      1
    )
    this.background.strokeRoundedRect(
      -TILE_WIDTH / 2,
      -TILE_HEIGHT / 2,
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_CONFIG.cornerRadius
    )

    this.add(this.background)
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

    this.background.clear()

    const fillColor = revealed
      ? TILE_CONFIG.revealedColor
      : TILE_CONFIG.backgroundColor

    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(fillColor).color,
      1
    )
    this.background.fillRoundedRect(
      -TILE_WIDTH / 2,
      -TILE_HEIGHT / 2,
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_CONFIG.cornerRadius
    )

    // Draw border
    this.background.lineStyle(
      TILE_CONFIG.borderWidth,
      Phaser.Display.Color.HexStringToColor(TILE_CONFIG.borderColor).color,
      1
    )
    this.background.strokeRoundedRect(
      -TILE_WIDTH / 2,
      -TILE_HEIGHT / 2,
      TILE_WIDTH,
      TILE_HEIGHT,
      TILE_CONFIG.cornerRadius
    )
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
