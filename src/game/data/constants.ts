/**
 * Game constants - named magic numbers
 * All tunable values in one place for easy balancing
 */

// ============================================
// GAME DIMENSIONS
// ============================================

/** Base game width (16:9 aspect ratio) */
export const GAME_WIDTH = 1920

/** Base game height (16:9 aspect ratio) */
export const GAME_HEIGHT = 1080

/** Minimum supported width */
export const MIN_WIDTH = 960

/** Minimum supported height */
export const MIN_HEIGHT = 540

/** Maximum supported width */
export const MAX_WIDTH = 1920

/** Maximum supported height */
export const MAX_HEIGHT = 1080

// ============================================
// GAMEPLAY RULES
// ============================================

/** Cost to buy a vowel (in points) */
export const VOWEL_COST = 250

/** All vowels in the game */
export const VOWELS = ['A', 'E', 'I', 'O', 'U'] as const

/** All consonants in the game */
export const CONSONANTS = [
  'B',
  'C',
  'D',
  'F',
  'G',
  'H',
  'J',
  'K',
  'L',
  'M',
  'N',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const

// ============================================
// WHEEL CONFIGURATION
// ============================================

/** Number of segments on the wheel */
export const WHEEL_SEGMENTS = 24

/** Minimum spin duration in milliseconds */
export const WHEEL_MIN_SPIN_DURATION = 3000

/** Maximum spin duration in milliseconds */
export const WHEEL_MAX_SPIN_DURATION = 6000

/** Minimum rotations per spin */
export const WHEEL_MIN_ROTATIONS = 3

/** Maximum rotations per spin */
export const WHEEL_MAX_ROTATIONS = 6

// ============================================
// PHRASE BOARD
// ============================================

/** Maximum characters per row on the phrase board */
export const BOARD_MAX_CHARS_PER_ROW = 14

/** Maximum rows on the phrase board */
export const BOARD_MAX_ROWS = 4

/** Letter tile width in pixels */
export const TILE_WIDTH = 60

/** Letter tile height in pixels */
export const TILE_HEIGHT = 72

/** Gap between tiles */
export const TILE_GAP = 4

// ============================================
// ANIMATION TIMING
// ============================================

/** Standard UI transition duration in ms */
export const TRANSITION_DURATION = 300

/** Letter reveal animation duration in ms */
export const LETTER_REVEAL_DURATION = 400

/** Stagger delay between multiple letter reveals */
export const LETTER_REVEAL_STAGGER = 100

/** Score count-up animation duration */
export const SCORE_COUNT_DURATION = 500

/** Scene fade transition duration */
export const SCENE_FADE_DURATION = 500

// ============================================
// SCREEN SHAKE
// ============================================

/** Bankrupt screen shake intensity (very noticeable) */
export const SHAKE_INTENSITY_BANKRUPT = 0.035

/** Bankrupt screen shake duration in ms */
export const SHAKE_DURATION_BANKRUPT = 600

/** Win screen shake intensity (subtle celebration) */
export const SHAKE_INTENSITY_WIN = 0.008

/** Win screen shake duration in ms */
export const SHAKE_DURATION_WIN = 400

/** Wrong guess screen shake intensity (mild) */
export const SHAKE_INTENSITY_WRONG = 0.012

/** Wrong guess screen shake duration in ms */
export const SHAKE_DURATION_WRONG = 200

// ============================================
// HIT PAUSE / FREEZE FRAMES
// ============================================

/** Hit pause duration for significant events in ms */
export const HIT_PAUSE_DURATION = 50

/** Hit pause duration for major events (bankrupt) in ms */
export const HIT_PAUSE_MAJOR = 80

// ============================================
// DEPTHS (Z-ordering)
// ============================================

/** Background elements depth */
export const DEPTH_BACKGROUND = 0

/** Wheel depth */
export const DEPTH_WHEEL = 10

/** Phrase board depth */
export const DEPTH_BOARD = 20

/** Keyboard depth */
export const DEPTH_KEYBOARD = 30

/** UI overlay depth */
export const DEPTH_UI = 100

/** Particles and effects depth */
export const DEPTH_EFFECTS = 200

/** Modal and popup depth */
export const DEPTH_MODAL = 300
