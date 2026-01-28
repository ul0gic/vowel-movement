/**
 * InputSystem - Centralized input handling
 *
 * Manages:
 * - Physical keyboard input (A-Z keys)
 * - Input event routing to game state
 * - Input blocking during certain phases
 *
 * Provides a unified interface for both on-screen keyboard and physical keyboard.
 */
import Phaser from 'phaser'

import { CONSONANTS, VOWELS } from '../data/constants'
import type { GamePhase } from '../data/types'

/**
 * Events emitted by InputSystem
 */
export const InputEvents = {
  /** A letter key was pressed */
  LETTER_PRESSED: 'input:letterPressed',

  /** Input was blocked (phase doesn't allow it) */
  INPUT_BLOCKED: 'input:blocked',

  /** Solve key was pressed (Enter) */
  SOLVE_PRESSED: 'input:solvePressed',

  /** Cancel key was pressed (Escape) */
  CANCEL_PRESSED: 'input:cancelPressed',
} as const

/**
 * Letter input event data
 */
export interface LetterInputEvent {
  /** The letter pressed */
  letter: string
  /** Whether it's a vowel */
  isVowel: boolean
  /** Input source */
  source: 'keyboard' | 'onscreen'
}

/**
 * InputSystem class
 */
export class InputSystem extends Phaser.Events.EventEmitter {
  /** Keyboard input handler */
  private keyboard: Phaser.Input.Keyboard.KeyboardPlugin | null = null

  /** Map of key objects for cleanup */
  private keyObjects: Phaser.Input.Keyboard.Key[] = []

  /** Whether input is currently enabled */
  private enabled: boolean = true

  /** Current game phase */
  private currentPhase: GamePhase = 'IDLE'

  /** Callback for letter selection */
  private onLetterCallback: ((event: LetterInputEvent) => void) | null = null

  constructor(scene: Phaser.Scene) {
    super()
    this.keyboard = scene.input.keyboard

    this.setupKeyboardInput()
  }

  /**
   * Set up physical keyboard input
   */
  private setupKeyboardInput(): void {
    if (!this.keyboard) return

    // Set up A-Z keys
    const letters = [...CONSONANTS, ...VOWELS]

    const kb = this.keyboard
    letters.forEach((letter) => {
      const keyCode = Phaser.Input.Keyboard.KeyCodes[letter as keyof typeof Phaser.Input.Keyboard.KeyCodes]
      if (typeof keyCode !== 'number') return

      const key = kb.addKey(keyCode, false)
      this.keyObjects.push(key)

      key.on('down', () => {
        this.handleLetterInput(letter, 'keyboard')
      })
    })

    // Set up Enter key for solve
    const enterKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false)
    this.keyObjects.push(enterKey)
    enterKey.on('down', () => {
      if (this.enabled) {
        this.emit(InputEvents.SOLVE_PRESSED)
      }
    })

    // Set up Escape key for cancel
    const escKey = this.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, false)
    this.keyObjects.push(escKey)
    escKey.on('down', () => {
      if (this.enabled) {
        this.emit(InputEvents.CANCEL_PRESSED)
      }
    })
  }

  /**
   * Handle letter input from any source
   */
  public handleLetterInput(letter: string, source: 'keyboard' | 'onscreen'): void {
    if (!this.enabled) {
      this.emit(InputEvents.INPUT_BLOCKED, { reason: 'disabled' })
      return
    }

    const upperLetter = letter.toUpperCase()
    const isVowel = VOWELS.includes(upperLetter as typeof VOWELS[number])
    const isConsonant = CONSONANTS.includes(upperLetter as typeof CONSONANTS[number])

    // Validate it's a valid letter
    if (!isVowel && !isConsonant) {
      return
    }

    // Check if input is allowed in current phase
    if (!this.isInputAllowed(isVowel)) {
      this.emit(InputEvents.INPUT_BLOCKED, {
        isVowel,
        letter: upperLetter,
        phase: this.currentPhase,
        reason: 'phase',
      })
      return
    }

    const event: LetterInputEvent = {
      isVowel,
      letter: upperLetter,
      source,
    }

    // Emit event
    this.emit(InputEvents.LETTER_PRESSED, event)

    // Call callback if set
    if (this.onLetterCallback) {
      this.onLetterCallback(event)
    }
  }

  /**
   * Check if input is allowed in current phase
   */
  private isInputAllowed(isVowel: boolean): boolean {
    switch (this.currentPhase) {
      case 'GUESSING':
        // Can guess consonants, can buy vowels if have enough points
        return true

      case 'IDLE':
        // Can buy vowels from IDLE state
        return isVowel

      case 'SPINNING':
      case 'ROUND_OVER':
      case 'SOLVING':
      case 'BUYING_VOWEL':
        return false

      default:
        return false
    }
  }

  /**
   * Set the current game phase
   */
  public setPhase(phase: GamePhase): void {
    this.currentPhase = phase
  }

  /**
   * Set whether input is enabled
   */
  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  /**
   * Check if input is enabled
   */
  public isEnabled(): boolean {
    return this.enabled
  }

  /**
   * Register a callback for letter selection
   */
  public onLetterSelected(callback: (event: LetterInputEvent) => void): void {
    this.onLetterCallback = callback
  }

  /**
   * Remove the letter selection callback
   */
  public offLetterSelected(): void {
    this.onLetterCallback = null
  }

  /**
   * Clean up
   */
  public destroy(): void {
    // Remove all key listeners
    this.keyObjects.forEach((key) => {
      key.removeAllListeners()
    })
    this.keyObjects = []

    // Remove all event listeners
    this.removeAllListeners()
    this.onLetterCallback = null
  }
}
