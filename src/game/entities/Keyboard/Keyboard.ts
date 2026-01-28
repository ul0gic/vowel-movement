/**
 * Keyboard - On-screen letter picker
 *
 * Displays:
 * - Consonants row (top)
 * - Vowels row (bottom) with cost indicator
 *
 * Features:
 * - Visual feedback on hover/press
 * - Disabled state for already-guessed letters
 * - Vowel cost display (250 pts)
 * - Event emission for letter selection
 */
import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { spacing } from '../../../design-system/tokens/spacing'
import { typography } from '../../../design-system/tokens/typography'
import { CONSONANTS, DEPTH_KEYBOARD, VOWEL_COST, VOWELS } from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'
import { animateKeyPress, animateKeyReset } from './Keyboard.animations'

/**
 * Events emitted by Keyboard
 */
export const KeyboardEvents = {
  /** Letter selected (consonant or vowel) */
  LETTER_SELECTED: 'keyboard:letterSelected',
} as const

/**
 * Letter key configuration
 */
interface LetterKey {
  /** The letter */
  letter: string
  /** Container holding the key graphics */
  container: Phaser.GameObjects.Container
  /** Background graphics */
  background: Phaser.GameObjects.Graphics
  /** Letter text */
  text: Phaser.GameObjects.Text
  /** Cost label (vowels only) */
  costLabel?: Phaser.GameObjects.Text
  /** Whether the key is disabled (already guessed) */
  disabled: boolean
  /** Whether this is a vowel */
  isVowel: boolean
}

/**
 * Key dimensions - match puzzle tile size
 */
const KEY_WIDTH = 60
const KEY_HEIGHT = 72
const KEY_GAP = 4
const VOWEL_KEY_WIDTH = 60

/**
 * Keyboard class
 */
export class Keyboard extends Phaser.GameObjects.Container {
  /** Reference to scene - using declare to override parent */
  declare scene: Phaser.Scene

  /** Map of letter to key config */
  private keys: Map<string, LetterKey> = new Map()

  /** Whether the keyboard is enabled */
  private enabled: boolean = true

  /** Current game phase for filtering */
  private allowConsonants: boolean = true
  private allowVowels: boolean = true

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Add to scene
    scene.add.existing(this)
    this.setDepth(DEPTH_KEYBOARD)

    // Create keyboard rows
    this.createConsonantRows()
    this.createVowelRow()
  }

  /**
   * Create consonant rows (split into two rows for better layout)
   */
  private createConsonantRows(): void {
    // Split consonants into two rows
    const row1 = CONSONANTS.slice(0, 10) // B C D F G H J K L M
    const row2 = CONSONANTS.slice(10) // N P Q R S T V W X Y Z

    const totalWidth1 = row1.length * KEY_WIDTH + (row1.length - 1) * KEY_GAP
    const totalWidth2 = row2.length * KEY_WIDTH + (row2.length - 1) * KEY_GAP
    const startX1 = -totalWidth1 / 2 + KEY_WIDTH / 2
    const startX2 = -totalWidth2 / 2 + KEY_WIDTH / 2

    // First row of consonants
    row1.forEach((letter, index) => {
      const x = startX1 + index * (KEY_WIDTH + KEY_GAP)
      const y = -KEY_HEIGHT - KEY_GAP / 2
      this.createKey(letter, x, y, false)
    })

    // Second row of consonants
    row2.forEach((letter, index) => {
      const x = startX2 + index * (KEY_WIDTH + KEY_GAP)
      const y = 0
      this.createKey(letter, x, y, false)
    })
  }

  /**
   * Create vowel row (bottom)
   */
  private createVowelRow(): void {
    const totalWidth = VOWELS.length * VOWEL_KEY_WIDTH + (VOWELS.length - 1) * KEY_GAP
    const startX = -totalWidth / 2 + VOWEL_KEY_WIDTH / 2

    VOWELS.forEach((letter, index) => {
      const x = startX + index * (VOWEL_KEY_WIDTH + KEY_GAP)
      const y = KEY_HEIGHT + KEY_GAP + spacing.sm
      this.createKey(letter, x, y, true)
    })
  }

  /**
   * Create a single key
   */
  private createKey(letter: string, x: number, y: number, isVowel: boolean): void {
    const width = isVowel ? VOWEL_KEY_WIDTH : KEY_WIDTH
    const height = KEY_HEIGHT

    // Create container
    const container = this.scene.add.container(x, y)

    // Create background
    const background = this.scene.add.graphics()
    this.drawKeyBackground(background, width, height, isVowel, false, false)

    // Create letter text with high resolution
    const text = this.scene.add
      .text(0, isVowel ? -4 : 0, letter, {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0.5)

    container.add([background, text])

    // Add cost label for vowels
    let costLabel: Phaser.GameObjects.Text | undefined
    if (isVowel) {
      costLabel = this.scene.add
        .text(0, 14, `$${VOWEL_COST}`, {
          fontFamily: typography.fontFamily.body,
          fontSize: `${typography.fontSize.xs}px`,
          color: colors.accent,
          resolution: 2,
        })
        .setOrigin(0.5)
      container.add(costLabel)
    }

    // Set up interactivity
    container.setSize(width, height)
    container.setInteractive({ useHandCursor: true })

    // Store key config
    const keyConfig: LetterKey = {
      background,
      container,
      costLabel,
      disabled: false,
      isVowel,
      letter,
      text,
    }
    this.keys.set(letter, keyConfig)

    // Add event handlers
    this.setupKeyEvents(keyConfig, width, height)

    // Add to keyboard container
    this.add(container)
  }

  /**
   * Set up event handlers for a key
   */
  private setupKeyEvents(key: LetterKey, width: number, height: number): void {
    const { container } = key

    container.on('pointerover', () => {
      if (key.disabled || !this.enabled || !this.isLetterAllowed(key)) return
      this.drawKeyBackground(key.background, width, height, key.isVowel, true, false)
    })

    container.on('pointerout', () => {
      if (key.disabled) return
      this.drawKeyBackground(key.background, width, height, key.isVowel, false, false)
      animateKeyReset(this.scene, key.container)
    })

    container.on('pointerdown', () => {
      if (key.disabled || !this.enabled || !this.isLetterAllowed(key)) return
      this.drawKeyBackground(key.background, width, height, key.isVowel, false, true)
      animateKeyPress(this.scene, key.container)
    })

    container.on('pointerup', () => {
      if (key.disabled || !this.enabled || !this.isLetterAllowed(key)) return
      this.drawKeyBackground(key.background, width, height, key.isVowel, true, false)
      // Play UI click sound
      getAudioSystem().playUIClick()
      this.selectLetter(key.letter, key.isVowel)
    })
  }

  /**
   * Check if a letter type is currently allowed
   */
  private isLetterAllowed(key: LetterKey): boolean {
    if (key.isVowel) return this.allowVowels
    return this.allowConsonants
  }

  /**
   * Draw key background based on state
   */
  private drawKeyBackground(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    isVowel: boolean,
    isHover: boolean,
    isPressed: boolean
  ): void {
    graphics.clear()

    // Determine colors based on state
    let fillColor: string
    let strokeColor: string
    let alpha = 0.8

    if (isPressed) {
      alpha = 1
      fillColor = isVowel ? colors.accent : colors.secondary
      strokeColor = isVowel ? colors.accent : colors.secondary
    } else if (isHover) {
      alpha = 0.95
      fillColor = isVowel ? colors.wheelPurple : colors.wheelBlue
      strokeColor = isVowel ? colors.accent : colors.secondary
    } else {
      fillColor = isVowel ? colors.wheelPurple : colors.wheelBlue
      strokeColor = isVowel ? colors.accent : colors.secondary
    }

    // Draw rounded rectangle
    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(fillColor).color,
      alpha
    )
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 6)

    // Draw border
    graphics.lineStyle(
      2,
      Phaser.Display.Color.HexStringToColor(strokeColor).color,
      isHover || isPressed ? 1 : 0.5
    )
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 6)
  }

  /**
   * Draw disabled key background
   */
  private drawDisabledKeyBackground(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number
  ): void {
    graphics.clear()

    // Grayed out appearance
    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      0.5
    )
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, 6)

    // Dim border
    graphics.lineStyle(
      1,
      Phaser.Display.Color.HexStringToColor(colors.textSecondary).color,
      0.3
    )
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, 6)
  }

  /**
   * Select a letter
   */
  private selectLetter(letter: string, isVowel: boolean): void {
    this.emit(KeyboardEvents.LETTER_SELECTED, { isVowel, letter })
  }

  /**
   * Disable a letter (mark as already guessed)
   */
  public disableLetter(letter: string): void {
    const key = this.keys.get(letter.toUpperCase())
    if (!key || key.disabled) return

    key.disabled = true
    key.container.disableInteractive()

    // Update visuals
    const width = key.isVowel ? VOWEL_KEY_WIDTH : KEY_WIDTH
    this.drawDisabledKeyBackground(key.background, width, KEY_HEIGHT)

    // Gray out text
    key.text.setColor(colors.textSecondary)
    key.text.setAlpha(0.5)

    if (key.costLabel) {
      key.costLabel.setAlpha(0.3)
    }
  }

  /**
   * Disable multiple letters
   */
  public disableLetters(letters: string[]): void {
    letters.forEach((letter) => {
      this.disableLetter(letter)
    })
  }

  /**
   * Enable a letter (reset from disabled state)
   */
  public enableLetter(letter: string): void {
    const key = this.keys.get(letter.toUpperCase())
    if (!key?.disabled) return

    key.disabled = false
    key.container.setInteractive({ useHandCursor: true })

    // Update visuals
    const width = key.isVowel ? VOWEL_KEY_WIDTH : KEY_WIDTH
    this.drawKeyBackground(key.background, width, KEY_HEIGHT, key.isVowel, false, false)

    // Restore text
    key.text.setColor(colors.textPrimary)
    key.text.setAlpha(1)

    if (key.costLabel) {
      key.costLabel.setAlpha(1)
    }
  }

  /**
   * Reset all letters to enabled state
   */
  public resetAllLetters(): void {
    this.keys.forEach((_, letter) => {
      this.enableLetter(letter)
    })
  }

  /**
   * Set keyboard enabled/disabled state
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
    this.setAlpha(enabled ? 1 : 0.5)
  }

  /**
   * Set which letter types are allowed
   */
  public setAllowedTypes(consonants: boolean, vowels: boolean): void {
    this.allowConsonants = consonants
    this.allowVowels = vowels

    // Update visual feedback for disallowed types
    this.keys.forEach((key) => {
      if (!key.disabled) {
        const allowed = this.isLetterAllowed(key)
        key.container.setAlpha(allowed ? 1 : 0.5)
      }
    })
  }

  /**
   * Check if a letter is already disabled
   */
  public isLetterDisabled(letter: string): boolean {
    const key = this.keys.get(letter.toUpperCase())
    return key?.disabled ?? false
  }

  /**
   * Get all disabled letters
   */
  public getDisabledLetters(): string[] {
    const disabled: string[] = []
    this.keys.forEach((key, letter) => {
      if (key.disabled) {
        disabled.push(letter)
      }
    })
    return disabled
  }

  /**
   * Animate a key as if it was pressed (for external triggers like keyboard input)
   */
  public triggerKeyPress(letter: string): void {
    const key = this.keys.get(letter.toUpperCase())
    if (!key || key.disabled) return

    const width = key.isVowel ? VOWEL_KEY_WIDTH : KEY_WIDTH
    this.drawKeyBackground(key.background, width, KEY_HEIGHT, key.isVowel, false, true)
    animateKeyPress(this.scene, key.container)

    // Reset after animation
    this.scene.time.delayedCall(100, () => {
      this.drawKeyBackground(key.background, width, KEY_HEIGHT, key.isVowel, false, false)
      animateKeyReset(this.scene, key.container)
    })
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.keys.clear()
    super.destroy(fromScene)
  }
}
