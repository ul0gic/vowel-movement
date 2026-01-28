/**
 * Game-specific types and interfaces
 * Core type definitions used throughout the game
 */

import type { CategoryType } from './categories'
import type { WedgeType, WheelWedge } from './wheelSegments'

// ============================================
// PHRASE TYPES
// ============================================

/**
 * A single phrase entry in the phrase database
 */
export interface Phrase {
  /** The phrase text (uppercase, fits board constraints) */
  phrase: string
  /** The category this phrase belongs to */
  category: CategoryType
}

/**
 * Phrase selection result from PhraseManager
 */
export interface PhraseSelection {
  /** The selected phrase */
  phrase: Phrase
  /** Index in the phrase database */
  index: number
}

// ============================================
// GAME PHASE TYPES
// ============================================

/**
 * Game phases for turn state machine
 * IDLE: Waiting for player to spin the wheel
 * SPINNING: Wheel is currently spinning
 * GUESSING: Player can guess a consonant (after landing on points)
 * BUYING_VOWEL: Player is purchasing a vowel
 * SOLVING: Player is attempting to solve the puzzle
 * ROUND_OVER: Round has ended (win/lose)
 */
export type GamePhase =
  | 'BUYING_VOWEL'
  | 'GUESSING'
  | 'IDLE'
  | 'ROUND_OVER'
  | 'SOLVING'
  | 'SPINNING'

/**
 * Result from wheel landing
 */
export interface WedgeResult {
  /** The wedge that was landed on */
  wedge: WheelWedge
  /** Type of wedge (convenience) */
  type: WedgeType
  /** Point value if applicable */
  value: number
}

/**
 * Wheel spin state
 */
export type WheelState = 'idle' | 'slowing' | 'spinning' | 'stopped'

// ============================================
// LETTER TRACKING
// ============================================

/**
 * Set of guessed letters
 */
export interface GuessedLetters {
  /** Guessed consonants */
  consonants: Set<string>
  /** Guessed/purchased vowels */
  vowels: Set<string>
}

/**
 * Result of a letter guess
 */
export interface GuessResult {
  /** The letter that was guessed */
  letter: string
  /** Whether the letter is in the phrase */
  isCorrect: boolean
  /** Number of times the letter appears (0 if not found) */
  count: number
  /** Points earned (wedge value x count) */
  pointsEarned: number
  /** Whether this was a vowel */
  isVowel: boolean
}

/**
 * Result of a solve attempt
 */
export interface SolveResult {
  /** Whether the solve was correct */
  isCorrect: boolean
  /** The guess the player made */
  guess: string
  /** The actual phrase */
  actualPhrase: string
}

// ============================================
// GAME STATE
// ============================================

/**
 * Full game state snapshot
 */
export interface GameState {
  /** Current turn phase */
  phase: GamePhase

  /** Current score */
  score: number

  /** Last wedge result (null before first spin) */
  currentWedgeResult: WedgeResult | null

  /** Letters that have been guessed */
  guessedLetters: GuessedLetters

  /** Number of free spin tokens */
  freeSpinTokens: number

  /** Whether the current round is won */
  hasWon: boolean

  /** Current phrase (uppercase) */
  phrase: string

  /** Current category */
  category: string
}

/**
 * Actions that can be taken in the game
 */
export type GameAction =
  | { type: 'SPIN' }
  | { type: 'WHEEL_STOPPED'; result: WedgeResult }
  | { type: 'GUESS_LETTER'; letter: string }
  | { type: 'BUY_VOWEL'; letter: string }
  | { type: 'SOLVE'; guess: string }
  | { type: 'USE_FREE_SPIN' }
  | { type: 'NEW_ROUND'; phrase: string; category: string }
  | { type: 'CONTINUE_TURN' }
  | { type: 'END_TURN' }

// ============================================
// EVENT TYPES
// ============================================

/**
 * Events emitted by the wheel
 */
export interface WheelSpinEvent {
  /** Initial angular velocity */
  initialVelocity: number
}

/**
 * Events emitted when wheel lands
 */
export interface WheelLandEvent {
  /** The result of the spin */
  result: WedgeResult
  /** Segment index that was landed on */
  segmentIndex: number
}

/**
 * Events emitted by GameStateSystem
 */
export interface GameStateEvents {
  /** Phase changed */
  PHASE_CHANGE: { previousPhase: GamePhase; newPhase: GamePhase }

  /** Score changed */
  SCORE_CHANGE: { previousScore: number; newScore: number; delta: number }

  /** Letter guessed */
  LETTER_GUESSED: GuessResult

  /** Vowel purchased */
  VOWEL_PURCHASED: { letter: string; cost: number }

  /** Bankrupt hit */
  BANKRUPT: { lostScore: number }

  /** Lost turn */
  LOSE_TURN: { reason: 'bankrupt' | 'loseTurn' | 'wrongGuess' | 'wrongSolve' }

  /** Free spin earned */
  FREE_SPIN_EARNED: { totalTokens: number }

  /** Free spin used */
  FREE_SPIN_USED: { remainingTokens: number }

  /** Round won */
  ROUND_WON: { finalScore: number; phrase: string }

  /** Solve attempted */
  SOLVE_ATTEMPTED: SolveResult
}

// ============================================
// TRANSITION GUARDS
// ============================================

/**
 * Reasons why a state transition might be invalid
 */
export type TransitionError =
  | 'ALREADY_SPINNING'
  | 'CANNOT_GUESS_YET'
  | 'CANNOT_BUY_VOWEL'
  | 'INSUFFICIENT_FUNDS'
  | 'LETTER_ALREADY_GUESSED'
  | 'NOT_A_VOWEL'
  | 'NOT_A_CONSONANT'
  | 'CANNOT_SOLVE_YET'
  | 'ROUND_ALREADY_OVER'
  | 'NO_FREE_SPIN'

/**
 * Result of a transition attempt
 */
export type TransitionResult<T = void> =
  | { success: true; value: T }
  | { success: false; error: TransitionError }
