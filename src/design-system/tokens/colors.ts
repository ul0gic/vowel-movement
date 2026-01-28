/**
 * Game palette - Neon Trash Aesthetic
 *
 * A vibrant, high-contrast color scheme inspired by:
 * - 80s/90s game show aesthetics
 * - Neon signage and arcade vibes
 * - Trashy, over-the-top TV productions
 *
 * Colors are designed to pop on dark backgrounds
 * with maximum visibility and saturation.
 */

export const colors = {
  // ============================================
  // PRIMARY PALETTE - Core game identity
  // ============================================

  /** Hot pink/magenta - primary accent, titles, highlights */
  primary: '#FF00FF',

  /** Electric cyan - secondary accent, complements primary */
  secondary: '#00FFFF',

  /** Neon yellow - emphasis, warnings, important callouts */
  accent: '#FFE600',

  // ============================================
  // BACKGROUND & SURFACE
  // ============================================

  /** Deep dark blue - main background */
  background: '#0D0D1A',

  /** Slightly lighter dark - panels, cards, containers */
  surface: '#1A1A2E',

  /** Even lighter dark - hover states, elevated surfaces */
  surfaceLight: '#252545',

  // ============================================
  // TEXT COLORS
  // ============================================

  /** Pure white - primary text on dark backgrounds */
  textPrimary: '#FFFFFF',

  /** Muted gray - secondary text, labels, hints */
  textSecondary: '#A0A0C0',

  /** Dim gray - disabled text, subtle info */
  textMuted: '#606080',

  // ============================================
  // GAME STATE FEEDBACK
  // ============================================

  /** Bright green - correct answers, wins, positive feedback */
  success: '#00FF66',

  /** Hot red - wrong answers, bankrupt, negative feedback */
  danger: '#FF0040',

  /** Orange - warnings, cautions, attention needed */
  warning: '#FF8800',

  /** Electric blue - informational, neutral state */
  info: '#00AAFF',

  // ============================================
  // WHEEL SEGMENT COLORS
  // Classic game show wheel palette with neon twist
  // ============================================

  /** Metallic gold - jackpot, high value, premium */
  wheelGold: '#FFD700',

  /** Crimson red - danger segments, bankrupt */
  wheelRed: '#DC143C',

  /** Royal blue - mid-value segments */
  wheelBlue: '#1E90FF',

  /** Lime green - high-value segments */
  wheelGreen: '#32CD32',

  /** Deep purple - special segments */
  wheelPurple: '#9400D3',

  /** Bright orange - mid-value segments */
  wheelOrange: '#FF6600',

  /** Hot pink - variety segments */
  wheelPink: '#FF1493',

  /** Teal - variety segments */
  wheelTeal: '#00CED1',

  /** Silver - low-value segments */
  wheelSilver: '#C0C0C0',

  // ============================================
  // GLOW & EFFECTS
  // For particle effects, glows, and emphasis
  // ============================================

  /** Bright neon glow for effects */
  glowPink: '#FF69B4',

  /** Cyan glow for reveals */
  glowCyan: '#40E0D0',

  /** Yellow glow for celebrations */
  glowYellow: '#FFFF66',

  /** White glow for highlights */
  glowWhite: '#FFFFFF',

  // ============================================
  // TILE & BOARD COLORS
  // ============================================

  /** Unrevealed tile background */
  tileHidden: '#6A0DAD',

  /** Revealed tile background */
  tileRevealed: '#FFFFFF',

  /** Tile border color */
  tileBorder: '#FFD700',

  /** Letter color on revealed tiles */
  letterColor: '#0D0D1A',
} as const

/**
 * Type for color keys
 */
export type ColorKey = keyof typeof colors
