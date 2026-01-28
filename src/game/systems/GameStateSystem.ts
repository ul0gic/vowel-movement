/**
 * GameStateSystem - Turn state machine
 *
 * Manages game flow including:
 * - Turn phases: IDLE -> SPINNING -> GUESSING -> SOLVING
 * - Phase transitions with proper guards
 * - Letter tracking (consonants and vowels separately)
 * - Win/lose condition detection
 *
 * Uses event emitter pattern for loose coupling with other systems.
 */

import Phaser from 'phaser'

import { CONSONANTS, VOWEL_COST, VOWELS } from '../data/constants'
import type {
  GamePhase,
  GameState,
  GuessedLetters,
  GuessResult,
  SolveResult,
  TransitionResult,
  WedgeResult,
} from '../data/types'

/**
 * Events emitted by GameStateSystem
 */
export const GameStateEvents = {
  /** Phase changed */
  PHASE_CHANGE: 'gameState:phaseChange',

  /** Score changed */
  SCORE_CHANGE: 'gameState:scoreChange',

  /** Letter guessed */
  LETTER_GUESSED: 'gameState:letterGuessed',

  /** Vowel purchased */
  VOWEL_PURCHASED: 'gameState:vowelPurchased',

  /** Bankrupt hit */
  BANKRUPT: 'gameState:bankrupt',

  /** Lost turn */
  LOSE_TURN: 'gameState:loseTurn',

  /** Free spin earned */
  FREE_SPIN_EARNED: 'gameState:freeSpinEarned',

  /** Free spin used */
  FREE_SPIN_USED: 'gameState:freeSpinUsed',

  /** Round won */
  ROUND_WON: 'gameState:roundWon',

  /** Solve attempted */
  SOLVE_ATTEMPTED: 'gameState:solveAttempted',

  /** Turn continues (correct guess) */
  TURN_CONTINUES: 'gameState:turnContinues',

  /** New round started */
  NEW_ROUND: 'gameState:newRound',
} as const

/**
 * Create initial guessed letters state
 */
function createGuessedLetters(): GuessedLetters {
  return {
    consonants: new Set<string>(),
    vowels: new Set<string>(),
  }
}

/**
 * Create initial game state
 */
function createInitialState(phrase: string = '', category: string = ''): GameState {
  return {
    category,
    currentWedgeResult: null,
    freeSpinTokens: 0,
    guessedLetters: createGuessedLetters(),
    hasWon: false,
    phase: 'IDLE',
    phrase: phrase.toUpperCase(),
    score: 0,
  }
}

/**
 * Check if a letter is a vowel
 */
function isVowel(letter: string): boolean {
  return VOWELS.includes(letter.toUpperCase() as typeof VOWELS[number])
}

/**
 * Check if a letter is a consonant
 */
function isConsonant(letter: string): boolean {
  return CONSONANTS.includes(letter.toUpperCase() as typeof CONSONANTS[number])
}

/**
 * Count occurrences of a letter in a phrase
 */
function countLetterInPhrase(letter: string, phrase: string): number {
  const upperLetter = letter.toUpperCase()
  let count = 0
  for (const char of phrase) {
    if (char === upperLetter) {
      count++
    }
  }
  return count
}

/**
 * Check if a letter has already been guessed
 */
function isLetterGuessed(letter: string, guessedLetters: GuessedLetters): boolean {
  const upperLetter = letter.toUpperCase()
  return (
    guessedLetters.consonants.has(upperLetter) ||
    guessedLetters.vowels.has(upperLetter)
  )
}

/**
 * Normalize a phrase for comparison (remove punctuation, extra spaces)
 */
function normalizePhrase(phrase: string): string {
  return phrase
    .toUpperCase()
    .replace(/[^A-Z ]/g, '') // Remove non-letters except spaces
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim()
}

/**
 * GameStateSystem class
 * Manages all game state and transitions
 */
export class GameStateSystem extends Phaser.Events.EventEmitter {
  /** Current game state */
  private state: GameState

  /** Reference to the scene (for registry access) */
  private scene: Phaser.Scene

  constructor(scene: Phaser.Scene, phrase: string = '', category: string = '') {
    super()
    this.scene = scene
    this.state = createInitialState(phrase, category)
  }

  // ============================================
  // STATE ACCESSORS
  // ============================================

  /**
   * Get current game phase
   */
  public getPhase(): GamePhase {
    return this.state.phase
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.state.score
  }

  /**
   * Get current wedge result
   */
  public getCurrentWedgeResult(): WedgeResult | null {
    return this.state.currentWedgeResult
  }

  /**
   * Get guessed letters
   */
  public getGuessedLetters(): GuessedLetters {
    return this.state.guessedLetters
  }

  /**
   * Get all guessed letters as array
   */
  public getAllGuessedLetters(): string[] {
    return [
      ...Array.from(this.state.guessedLetters.consonants),
      ...Array.from(this.state.guessedLetters.vowels),
    ]
  }

  /**
   * Get number of free spin tokens
   */
  public getFreeSpinTokens(): number {
    return this.state.freeSpinTokens
  }

  /**
   * Check if player has won
   */
  public hasWon(): boolean {
    return this.state.hasWon
  }

  /**
   * Get current phrase
   */
  public getPhrase(): string {
    return this.state.phrase
  }

  /**
   * Get current category
   */
  public getCategory(): string {
    return this.state.category
  }

  /**
   * Get full state snapshot (for debugging)
   */
  public getState(): Readonly<GameState> {
    return { ...this.state }
  }

  /**
   * Check if a specific letter has been guessed
   */
  public isLetterGuessed(letter: string): boolean {
    return isLetterGuessed(letter, this.state.guessedLetters)
  }

  /**
   * Check if player can buy a vowel
   */
  public canBuyVowel(): boolean {
    return this.state.score >= VOWEL_COST && this.state.phase === 'GUESSING'
  }

  /**
   * Check if player can spin
   */
  public canSpin(): boolean {
    return this.state.phase === 'IDLE' && !this.state.hasWon
  }

  /**
   * Check if player can guess
   */
  public canGuess(): boolean {
    return this.state.phase === 'GUESSING' && !this.state.hasWon
  }

  /**
   * Check if player can solve
   */
  public canSolve(): boolean {
    return (
      (this.state.phase === 'GUESSING' || this.state.phase === 'IDLE') &&
      !this.state.hasWon
    )
  }

  // ============================================
  // PHASE TRANSITIONS
  // ============================================

  /**
   * Set the phase with event emission
   */
  private setPhase(newPhase: GamePhase): void {
    const previousPhase = this.state.phase
    if (previousPhase === newPhase) return

    this.state.phase = newPhase

    this.emit(GameStateEvents.PHASE_CHANGE, {
      newPhase,
      previousPhase,
    })

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[GameStateSystem] Phase: ${previousPhase} -> ${newPhase}`)
    }
  }

  /**
   * Update score with event emission
   */
  private setScore(newScore: number): void {
    const previousScore = this.state.score
    const delta = newScore - previousScore

    this.state.score = newScore

    // Update registry for UIScene
    this.scene.registry.set('score', newScore)

    this.emit(GameStateEvents.SCORE_CHANGE, {
      delta,
      newScore,
      previousScore,
    })

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[GameStateSystem] Score: ${previousScore} -> ${newScore} (${delta >= 0 ? '+' : ''}${delta})`)
    }
  }

  // ============================================
  // GAME ACTIONS
  // ============================================

  /**
   * Start spinning the wheel
   */
  public startSpin(): TransitionResult {
    if (this.state.phase !== 'IDLE') {
      return { error: 'ALREADY_SPINNING', success: false }
    }

    if (this.state.hasWon) {
      return { error: 'ROUND_ALREADY_OVER', success: false }
    }

    this.setPhase('SPINNING')
    return { success: true, value: undefined }
  }

  /**
   * Handle wheel stopped - process the wedge result
   */
  public wheelStopped(result: WedgeResult): void {
    this.state.currentWedgeResult = result

    switch (result.type) {
      case 'points':
        // Player can now guess a consonant
        this.setPhase('GUESSING')
        break

      case 'bankrupt':
        this.handleBankrupt()
        break

      case 'loseTurn':
        this.handleLoseTurn('loseTurn')
        break

      case 'freeSpin':
        this.handleFreeSpin()
        break
    }
  }

  /**
   * Handle BANKRUPT wedge
   */
  private handleBankrupt(): void {
    const lostScore = this.state.score

    this.emit(GameStateEvents.BANKRUPT, { lostScore })
    this.setScore(0)
    this.handleLoseTurn('bankrupt')
  }

  /**
   * Handle LOSE A TURN
   */
  private handleLoseTurn(reason: 'bankrupt' | 'loseTurn' | 'wrongGuess' | 'wrongSolve'): void {
    this.emit(GameStateEvents.LOSE_TURN, { reason })

    // Go back to IDLE (single player, so turn just resets)
    this.setPhase('IDLE')
    this.state.currentWedgeResult = null
  }

  /**
   * Handle FREE SPIN wedge
   */
  private handleFreeSpin(): void {
    this.state.freeSpinTokens++

    this.emit(GameStateEvents.FREE_SPIN_EARNED, {
      totalTokens: this.state.freeSpinTokens,
    })

    // After free spin, go to GUESSING state so player can still act
    // But they need to spin again to get a wedge value
    this.setPhase('IDLE')
  }

  /**
   * Use a free spin token (after wrong guess)
   */
  public useFreeSpin(): TransitionResult {
    if (this.state.freeSpinTokens <= 0) {
      return { error: 'NO_FREE_SPIN', success: false }
    }

    this.state.freeSpinTokens--

    this.emit(GameStateEvents.FREE_SPIN_USED, {
      remainingTokens: this.state.freeSpinTokens,
    })

    // Can spin again
    this.setPhase('IDLE')
    return { success: true, value: undefined }
  }

  /**
   * Guess a consonant
   */
  public guessConsonant(letter: string): TransitionResult<GuessResult> {
    const upperLetter = letter.toUpperCase()

    // Validate phase
    if (this.state.phase !== 'GUESSING') {
      return { error: 'CANNOT_GUESS_YET', success: false }
    }

    // Validate letter type
    if (!isConsonant(upperLetter)) {
      return { error: 'NOT_A_CONSONANT', success: false }
    }

    // Check if already guessed
    if (isLetterGuessed(upperLetter, this.state.guessedLetters)) {
      return { error: 'LETTER_ALREADY_GUESSED', success: false }
    }

    // Record the guess
    this.state.guessedLetters.consonants.add(upperLetter)

    // Count occurrences in phrase
    const count = countLetterInPhrase(upperLetter, this.state.phrase)
    const isCorrect = count > 0

    // Calculate points
    const wedgeValue = this.state.currentWedgeResult?.value ?? 0
    const pointsEarned = isCorrect ? wedgeValue * count : 0

    const result: GuessResult = {
      count,
      isCorrect,
      isVowel: false,
      letter: upperLetter,
      pointsEarned,
    }

    // Emit letter guessed event
    this.emit(GameStateEvents.LETTER_GUESSED, result)

    if (isCorrect) {
      // Add points
      this.setScore(this.state.score + pointsEarned)

      // Check for win
      if (this.checkWinCondition()) {
        this.handleWin()
      } else {
        // Player can continue (spin again, buy vowel, or solve)
        this.emit(GameStateEvents.TURN_CONTINUES, {})
        this.setPhase('IDLE')
      }
    } else {
      // Wrong guess - lose turn
      this.handleLoseTurn('wrongGuess')
    }

    return { success: true, value: result }
  }

  /**
   * Buy and reveal a vowel
   */
  public buyVowel(letter: string): TransitionResult<GuessResult> {
    const upperLetter = letter.toUpperCase()

    // Validate phase (can buy vowel during GUESSING or IDLE)
    if (this.state.phase !== 'GUESSING' && this.state.phase !== 'IDLE') {
      return { error: 'CANNOT_BUY_VOWEL', success: false }
    }

    // Validate letter type
    if (!isVowel(upperLetter)) {
      return { error: 'NOT_A_VOWEL', success: false }
    }

    // Check if already guessed
    if (isLetterGuessed(upperLetter, this.state.guessedLetters)) {
      return { error: 'LETTER_ALREADY_GUESSED', success: false }
    }

    // Check if player can afford it
    if (this.state.score < VOWEL_COST) {
      return { error: 'INSUFFICIENT_FUNDS', success: false }
    }

    // Deduct cost
    this.setScore(this.state.score - VOWEL_COST)

    // Record the vowel
    this.state.guessedLetters.vowels.add(upperLetter)

    // Emit vowel purchased event
    this.emit(GameStateEvents.VOWEL_PURCHASED, {
      cost: VOWEL_COST,
      letter: upperLetter,
    })

    // Count occurrences in phrase
    const count = countLetterInPhrase(upperLetter, this.state.phrase)
    const isCorrect = count > 0

    const result: GuessResult = {
      count,
      isCorrect,
      isVowel: true,
      letter: upperLetter,
      pointsEarned: 0, // Vowels don't earn points, they cost points
    }

    // Emit letter guessed event
    this.emit(GameStateEvents.LETTER_GUESSED, result)

    // Check for win after vowel reveal
    if (this.checkWinCondition()) {
      this.handleWin()
    } else {
      // Player can continue (vowel purchase doesn't end turn even if no matches)
      this.emit(GameStateEvents.TURN_CONTINUES, {})
      // Stay in IDLE so they can spin again
      this.setPhase('IDLE')
    }

    return { success: true, value: result }
  }

  /**
   * Attempt to solve the puzzle
   */
  public attemptSolve(guess: string): TransitionResult<SolveResult> {
    // Can solve from GUESSING or IDLE
    if (this.state.phase !== 'GUESSING' && this.state.phase !== 'IDLE') {
      return { error: 'CANNOT_SOLVE_YET', success: false }
    }

    if (this.state.hasWon) {
      return { error: 'ROUND_ALREADY_OVER', success: false }
    }

    const normalizedGuess = normalizePhrase(guess)
    const normalizedPhrase = normalizePhrase(this.state.phrase)
    const isCorrect = normalizedGuess === normalizedPhrase

    const result: SolveResult = {
      actualPhrase: this.state.phrase,
      guess,
      isCorrect,
    }

    this.emit(GameStateEvents.SOLVE_ATTEMPTED, result)

    if (isCorrect) {
      this.handleWin()
    } else {
      this.handleLoseTurn('wrongSolve')
    }

    return { success: true, value: result }
  }

  /**
   * Check if all letters in the phrase have been revealed
   */
  private checkWinCondition(): boolean {
    // Check each letter in the phrase
    for (const char of this.state.phrase) {
      // Skip non-letters (spaces, punctuation)
      if (!/[A-Z]/i.test(char)) continue

      // Check if this letter has been guessed
      if (!isLetterGuessed(char, this.state.guessedLetters)) {
        return false
      }
    }
    return true
  }

  /**
   * Handle winning the round
   */
  private handleWin(): void {
    this.state.hasWon = true
    this.setPhase('ROUND_OVER')

    this.emit(GameStateEvents.ROUND_WON, {
      finalScore: this.state.score,
      phrase: this.state.phrase,
    })

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[GameStateSystem] Round won! Final score: ${this.state.score}`)
    }
  }

  // ============================================
  // ROUND MANAGEMENT
  // ============================================

  /**
   * Start a new round with a new phrase
   */
  public newRound(phrase: string, category: string): void {
    // Reset state but preserve score for cumulative gameplay
    const preservedScore = this.state.score

    this.state = createInitialState(phrase, category)
    this.state.score = preservedScore

    // Update registry
    this.scene.registry.set('score', preservedScore)

    this.emit(GameStateEvents.NEW_ROUND, {
      category: this.state.category,
      phrase: this.state.phrase,
    })

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[GameStateSystem] New round: "${phrase}" (${category})`)
    }
  }

  /**
   * Reset everything for a completely new game
   */
  public resetGame(phrase: string = '', category: string = ''): void {
    this.state = createInitialState(phrase, category)
    this.scene.registry.set('score', 0)

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[GameStateSystem] Game reset')
    }
  }

  /**
   * Set phrase (for initialization or testing)
   */
  public setPhrase(phrase: string, category: string): void {
    this.state.phrase = phrase.toUpperCase()
    this.state.category = category.toUpperCase()
    this.state.guessedLetters = createGuessedLetters()
    this.state.hasWon = false
    this.state.currentWedgeResult = null
    this.setPhase('IDLE')
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Clean up event listeners
   */
  public destroy(): void {
    this.removeAllListeners()
  }
}
