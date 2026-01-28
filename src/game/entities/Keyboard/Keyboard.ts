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

import { colors, hexToNumber, shadows } from '../../../design-system/tokens/colors'
import { spacing } from '../../../design-system/tokens/spacing'
import { typography } from '../../../design-system/tokens/typography'
import { CONSONANTS, DEPTH_KEYBOARD, VOWEL_COST, VOWELS } from '../../data/constants'
import { getAudioSystem } from '../../systems/AudioSystem'
import { animateKeyboardStaggerEntry, animateKeyPress, animateKeyReset } from './Keyboard.animations'

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
const KEY_WIDTH = 56
const KEY_HEIGHT = 68
const KEY_GAP = 6
const VOWEL_KEY_WIDTH = 56
const KEY_BORDER_RADIUS = 10

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
   * Draw key background based on state with modern styling
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
    const baseColor = isVowel ? colors.wheelPurple : colors.wheelBlue
    const accentColor = isVowel ? colors.accent : colors.secondary

    // Shadow (offset rectangle)
    if (!isPressed) {
      graphics.fillStyle(shadows.sm.color, shadows.sm.alpha)
      graphics.fillRoundedRect(
        -width / 2 + 2,
        -height / 2 + 3,
        width,
        height,
        KEY_BORDER_RADIUS
      )
    }

    // Main background with gradient effect (darker at bottom)
    const steps = 4
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const segmentHeight = height / steps
      const y = -height / 2 + i * segmentHeight + (isPressed ? 2 : 0)

      // Darken towards bottom for 3D effect
      const brightness = isPressed ? 0.7 : (isHover ? 1.0 : 0.85) - t * 0.15
      const color = this.adjustColorBrightness(hexToNumber(baseColor), brightness)
      const alpha = isPressed ? 1 : (isHover ? 1 : 0.9)

      graphics.fillStyle(color, alpha)

      if (i === 0) {
        graphics.fillRoundedRect(
          -width / 2,
          y,
          width,
          segmentHeight + 1,
          { tl: KEY_BORDER_RADIUS, tr: KEY_BORDER_RADIUS, bl: 0, br: 0 }
        )
      } else if (i === steps - 1) {
        graphics.fillRoundedRect(
          -width / 2,
          y,
          width,
          segmentHeight,
          { tl: 0, tr: 0, bl: KEY_BORDER_RADIUS, br: KEY_BORDER_RADIUS }
        )
      } else {
        graphics.fillRect(-width / 2, y, width, segmentHeight + 1)
      }
    }

    // Top highlight
    if (!isPressed) {
      graphics.fillStyle(0xFFFFFF, isHover ? 0.25 : 0.15)
      graphics.fillRoundedRect(
        -width / 2 + 2,
        -height / 2 + 2,
        width - 4,
        height * 0.35,
        { tl: KEY_BORDER_RADIUS - 2, tr: KEY_BORDER_RADIUS - 2, bl: 0, br: 0 }
      )
    }

    // Border
    const borderAlpha = isHover || isPressed ? 0.9 : 0.5
    graphics.lineStyle(2, hexToNumber(accentColor), borderAlpha)
    graphics.strokeRoundedRect(
      -width / 2,
      -height / 2 + (isPressed ? 2 : 0),
      width,
      height,
      KEY_BORDER_RADIUS
    )

    // Glow on hover
    if (isHover && !isPressed) {
      graphics.lineStyle(1, hexToNumber(accentColor), 0.3)
      graphics.strokeRoundedRect(
        -width / 2 - 2,
        -height / 2 - 2,
        width + 4,
        height + 4,
        KEY_BORDER_RADIUS + 2
      )
    }
  }

  /**
   * Adjust color brightness
   */
  private adjustColorBrightness(color: number, factor: number): number {
    const r = Math.min(255, Math.round(((color >> 16) & 0xFF) * factor))
    const g = Math.min(255, Math.round(((color >> 8) & 0xFF) * factor))
    const b = Math.min(255, Math.round((color & 0xFF) * factor))
    return (r << 16) | (g << 8) | b
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

    // Grayed out appearance with subtle depth
    graphics.fillStyle(hexToNumber(colors.surface), 0.4)
    graphics.fillRoundedRect(-width / 2, -height / 2, width, height, KEY_BORDER_RADIUS)

    // Subtle inner shadow
    graphics.fillStyle(0x000000, 0.1)
    graphics.fillRoundedRect(
      -width / 2 + 2,
      -height / 2 + 2,
      width - 4,
      height / 2,
      { tl: KEY_BORDER_RADIUS - 2, tr: KEY_BORDER_RADIUS - 2, bl: 0, br: 0 }
    )

    // Dim border
    graphics.lineStyle(1, hexToNumber(colors.textMuted), 0.3)
    graphics.strokeRoundedRect(-width / 2, -height / 2, width, height, KEY_BORDER_RADIUS)
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
   * Get all key containers for animation purposes
   * Returns keys in visual order (top-left to bottom-right)
   */
  public getKeyContainers(): Phaser.GameObjects.Container[] {
    const containers: Phaser.GameObjects.Container[] = []
    // Get consonant row 1 (B-M)
    CONSONANTS.slice(0, 10).forEach((letter) => {
      const key = this.keys.get(letter)
      if (key) containers.push(key.container)
    })
    // Get consonant row 2 (N-Z)
    CONSONANTS.slice(10).forEach((letter) => {
      const key = this.keys.get(letter)
      if (key) containers.push(key.container)
    })
    // Get vowel row
    VOWELS.forEach((letter) => {
      const key = this.keys.get(letter)
      if (key) containers.push(key.container)
    })
    return containers
  }

  /**
   * Play the staggered entrance animation for all keys
   */
  public playEntranceAnimation(onComplete?: () => void): void {
    const keyContainers = this.getKeyContainers()
    animateKeyboardStaggerEntry(keyContainers, onComplete)
  }

  /**
   * Clean up
   */
  public destroy(fromScene?: boolean): void {
    this.keys.clear()
    super.destroy(fromScene)
  }
}
