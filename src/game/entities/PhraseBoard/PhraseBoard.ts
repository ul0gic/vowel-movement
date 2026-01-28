/**
 * Phrase board display
 * Shows the grid of letter tiles with reveal animations
 */

import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import {
  BOARD_MAX_CHARS_PER_ROW,
  BOARD_MAX_ROWS,
  DEPTH_BOARD,
  TILE_GAP,
  TILE_HEIGHT,
  TILE_WIDTH,
} from '../../data/constants'
import { LetterTile } from './LetterTile'
import {
  animateRevealAll,
  animateRevealLetter,
} from './PhraseBoard.animations'

/**
 * Configuration for phrase board appearance
 */
const BOARD_CONFIG = {
  /** Padding around the board */
  padding: 24,

  /** Space between category label and board */
  categoryGap: 20,

  /** Category label font size */
  categoryFontSize: 20,

  /** Background color */
  backgroundColor: colors.surfaceLight,

  /** Border color */
  borderColor: colors.accent,

  /** Border width */
  borderWidth: 4,

  /** Corner radius */
  cornerRadius: 16,
} as const

/**
 * Word layout information for multi-line phrases
 */
interface WordLayout {
  word: string
  row: number
  startIndex: number
}

/**
 * Row of tiles
 */
interface TileRow {
  tiles: LetterTile[]
  width: number
}

/**
 * PhraseBoard - The grid of letter tiles
 * Extends Phaser.GameObjects.Container to hold all board elements
 */
export class PhraseBoard extends Phaser.GameObjects.Container {
  /** The current phrase */
  private phrase: string = ''

  /** The category of the phrase */
  private category: string = ''

  /** All letter tiles */
  private tiles: LetterTile[] = []

  /** Category text label */
  private categoryLabel!: Phaser.GameObjects.Text

  /** Background panel */
  private background!: Phaser.GameObjects.Graphics

  /** Container for tiles */
  private tilesContainer!: Phaser.GameObjects.Container

  /** Rows of tiles for layout */
  private tileRows: TileRow[] = []

  /** Total board width */
  private boardWidth: number = 0

  /** Total board height */
  private boardHeight: number = 0

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Set depth
    this.setDepth(DEPTH_BOARD)

    // Create containers
    this.tilesContainer = scene.add.container(0, 0)
    this.add(this.tilesContainer)

    // Create background (behind tiles)
    this.background = scene.add.graphics()
    this.addAt(this.background, 0)

    // Create category label with high resolution
    this.categoryLabel = scene.add
      .text(0, 0, '', {
        color: colors.secondary,
        fontFamily: typography.fontFamily.display,
        fontSize: `${BOARD_CONFIG.categoryFontSize}px`,
        fontStyle: 'bold',
        resolution: 2,
      })
      .setOrigin(0.5, 1)

    this.add(this.categoryLabel)

    // Add to scene
    scene.add.existing(this)
  }

  /**
   * Set the phrase and category to display
   */
  public setPhrase(phrase: string, category: string): void {
    this.phrase = phrase.toUpperCase()
    this.category = category.toUpperCase()

    // Clear existing tiles
    this.clearTiles()

    // Build the board
    this.buildBoard()

    // Update category label
    this.categoryLabel.setText(this.category)
    this.categoryLabel.setY(
      -this.boardHeight / 2 - BOARD_CONFIG.categoryGap
    )
  }

  /**
   * Clear all existing tiles
   */
  private clearTiles(): void {
    for (const tile of this.tiles) {
      tile.destroy()
    }
    this.tiles = []
    this.tileRows = []
    this.tilesContainer.removeAll()
  }

  /**
   * Build the phrase board layout
   */
  private buildBoard(): void {
    // Split phrase into words
    const words = this.splitIntoWords(this.phrase)

    // Calculate row layouts
    const rowLayouts = this.calculateRowLayouts(words)

    // Create tiles for each row
    this.createTiles(rowLayouts)

    // Draw background
    this.drawBackground()
  }

  /**
   * Split phrase into words (preserving spaces for positioning)
   */
  private splitIntoWords(phrase: string): string[] {
    // Split on spaces but keep track of multiple spaces
    const words: string[] = []
    let currentWord = ''

    for (const char of phrase) {
      if (char === ' ') {
        if (currentWord) {
          words.push(currentWord)
          currentWord = ''
        }
        // Add space as its own "word" to preserve spacing
        words.push(' ')
      } else {
        currentWord += char
      }
    }

    if (currentWord) {
      words.push(currentWord)
    }

    return words
  }

  /**
   * Calculate how words should be laid out across rows
   */
  private calculateRowLayouts(words: string[]): WordLayout[] {
    const layouts: WordLayout[] = []
    let currentRow = 0
    let currentRowLength = 0
    let charIndex = 0

    for (const word of words) {
      // Check if this is a space
      if (word === ' ') {
        // Spaces don't take up visual space at end of row
        if (currentRowLength > 0 && currentRowLength < BOARD_MAX_CHARS_PER_ROW) {
          // Add space to current row count (will be skipped if at end)
          currentRowLength += 1
          charIndex += 1
        }
        continue
      }

      const wordLength = word.length

      // Check if word fits on current row
      if (currentRowLength + wordLength > BOARD_MAX_CHARS_PER_ROW) {
        // Move to next row if we have content on current row
        if (currentRowLength > 0) {
          currentRow++
          currentRowLength = 0
        }

        // Check if we exceeded max rows
        if (currentRow >= BOARD_MAX_ROWS) {
          // Truncate - shouldn't happen with proper phrase validation
          break
        }
      }

      // Add word to layout
      layouts.push({
        row: currentRow,
        startIndex: charIndex,
        word,
      })

      currentRowLength += wordLength
      charIndex += wordLength

      // Add space after word if not at end of row
      if (currentRowLength < BOARD_MAX_CHARS_PER_ROW) {
        currentRowLength += 1 // Account for space
        charIndex += 1
      }
    }

    return layouts
  }

  /**
   * Create tiles based on row layouts
   */
  private createTiles(layouts: WordLayout[]): void {
    // Group layouts by row
    const rowMap = new Map<number, WordLayout[]>()

    for (const layout of layouts) {
      if (!rowMap.has(layout.row)) {
        rowMap.set(layout.row, [])
      }
      rowMap.get(layout.row)?.push(layout)
    }

    // Calculate total rows
    const numRows = Math.max(...Array.from(rowMap.keys())) + 1

    // Create tiles for each row
    let globalIndex = 0

    for (let row = 0; row < numRows; row++) {
      const rowLayouts = rowMap.get(row) ?? []
      const rowTiles: LetterTile[] = []

      // Build the characters for this row
      const rowChars: string[] = []

      for (let i = 0; i < rowLayouts.length; i++) {
        const layout = rowLayouts[i]
        if (!layout) continue

        // Add each character of the word
        for (const char of layout.word) {
          rowChars.push(char)
        }

        // Add space between words (but not after last word)
        if (i < rowLayouts.length - 1) {
          rowChars.push(' ')
        }
      }

      // Calculate row width
      const rowWidth =
        rowChars.length * TILE_WIDTH + (rowChars.length - 1) * TILE_GAP

      // Calculate starting X position to center the row
      const startX = -rowWidth / 2 + TILE_WIDTH / 2

      // Calculate Y position
      const startY =
        (row - (numRows - 1) / 2) * (TILE_HEIGHT + TILE_GAP)

      // Create tiles for this row
      for (let i = 0; i < rowChars.length; i++) {
        const char = rowChars[i]
        if (char === undefined) continue

        const tileX = startX + i * (TILE_WIDTH + TILE_GAP)
        const tileY = startY

        const tile = new LetterTile(
          this.scene,
          tileX,
          tileY,
          char,
          globalIndex
        )

        this.tilesContainer.add(tile)
        this.tiles.push(tile)
        rowTiles.push(tile)
        globalIndex++
      }

      this.tileRows.push({
        tiles: rowTiles,
        width: rowWidth,
      })
    }

    // Calculate board dimensions
    this.calculateBoardDimensions()
  }

  /**
   * Calculate total board dimensions
   */
  private calculateBoardDimensions(): void {
    if (this.tileRows.length === 0) {
      this.boardWidth = 0
      this.boardHeight = 0
      return
    }

    // Width is the widest row
    this.boardWidth =
      Math.max(...this.tileRows.map((r) => r.width)) +
      BOARD_CONFIG.padding * 2

    // Height is based on number of rows
    this.boardHeight =
      this.tileRows.length * TILE_HEIGHT +
      (this.tileRows.length - 1) * TILE_GAP +
      BOARD_CONFIG.padding * 2
  }

  /**
   * Draw the background panel
   */
  private drawBackground(): void {
    this.background.clear()

    if (this.boardWidth === 0 || this.boardHeight === 0) {
      return
    }

    // Draw background fill
    this.background.fillStyle(
      Phaser.Display.Color.HexStringToColor(BOARD_CONFIG.backgroundColor).color,
      0.9
    )
    this.background.fillRoundedRect(
      -this.boardWidth / 2,
      -this.boardHeight / 2,
      this.boardWidth,
      this.boardHeight,
      BOARD_CONFIG.cornerRadius
    )

    // Draw border
    this.background.lineStyle(
      BOARD_CONFIG.borderWidth,
      Phaser.Display.Color.HexStringToColor(BOARD_CONFIG.borderColor).color,
      1
    )
    this.background.strokeRoundedRect(
      -this.boardWidth / 2,
      -this.boardHeight / 2,
      this.boardWidth,
      this.boardHeight,
      BOARD_CONFIG.cornerRadius
    )
  }

  /**
   * Reveal a specific letter with animation
   * Returns the number of instances found
   */
  public revealLetter(letter: string): number {
    const matchingTiles = this.tiles.filter(
      (tile) => tile.hasLetter(letter) && !tile.isRevealed
    )

    if (matchingTiles.length === 0) {
      return 0
    }

    // Animate reveal for all matching tiles
    animateRevealLetter(this.scene, matchingTiles)

    return matchingTiles.length
  }

  /**
   * Reveal all remaining letters (for solve state)
   */
  public revealAll(): void {
    const unrevealedTiles = this.tiles.filter(
      (tile) => !tile.isRevealed && tile.getTileType() === 'letter'
    )

    if (unrevealedTiles.length === 0) {
      return
    }

    animateRevealAll(this.scene, unrevealedTiles, this)
  }

  /**
   * Check if all letters have been revealed
   */
  public isComplete(): boolean {
    return this.tiles
      .filter((tile) => tile.getTileType() === 'letter')
      .every((tile) => tile.isRevealed)
  }

  /**
   * Get the current phrase
   */
  public getPhrase(): string {
    return this.phrase
  }

  /**
   * Get all revealed letters so far
   */
  public getRevealedLetters(): string[] {
    const revealed = new Set<string>()

    for (const tile of this.tiles) {
      if (tile.isRevealed && tile.getTileType() === 'letter') {
        revealed.add(tile.getCharacter())
      }
    }

    return Array.from(revealed)
  }

  /**
   * Get count of unrevealed letters
   */
  public getUnrevealedCount(): number {
    return this.tiles.filter(
      (tile) => !tile.isRevealed && tile.getTileType() === 'letter'
    ).length
  }

  /**
   * Check if a letter exists in the phrase (regardless of reveal state)
   */
  public hasLetter(letter: string): boolean {
    return this.tiles.some((tile) => tile.hasLetter(letter))
  }

  /**
   * Check if a letter has been revealed
   */
  public isLetterRevealed(letter: string): boolean {
    const tile = this.tiles.find((t) => t.hasLetter(letter))
    return tile?.isRevealed ?? false
  }

  /**
   * Get the board width
   */
  public getBoardWidth(): number {
    return this.boardWidth
  }

  /**
   * Get the board height
   */
  public getBoardHeight(): number {
    return this.boardHeight
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.clearTiles()
    super.destroy(fromScene)
  }
}
