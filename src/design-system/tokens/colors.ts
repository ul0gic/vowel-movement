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
 * Gradient definitions for modern styling
 * Format: [startColor, endColor] for linear gradients
 */
export const gradients = {
  // ============================================
  // PRIMARY GRADIENTS
  // ============================================

  /** Primary button/accent gradient - magenta to purple */
  primary: ['#FF00FF', '#9400D3'] as const,

  /** Secondary gradient - cyan to blue */
  secondary: ['#00FFFF', '#1E90FF'] as const,

  /** Accent gradient - yellow to orange */
  accent: ['#FFE600', '#FF8800'] as const,

  /** Success gradient - green spectrum */
  success: ['#00FF66', '#00CC44'] as const,

  /** Danger gradient - red spectrum */
  danger: ['#FF0040', '#CC0033'] as const,

  // ============================================
  // SURFACE GRADIENTS
  // ============================================

  /** Panel background - subtle dark gradient */
  panel: ['#1A1A2E', '#12121F'] as const,

  /** Card elevated - slightly lighter */
  card: ['#252545', '#1A1A2E'] as const,

  /** Glass effect base */
  glass: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)'] as const,

  // ============================================
  // SPECIAL EFFECT GRADIENTS
  // ============================================

  /** Gold shimmer for high scores */
  gold: ['#FFD700', '#FFA500'] as const,

  /** Silver shine */
  silver: ['#E0E0E0', '#A0A0A0'] as const,

  /** Rainbow celebration */
  rainbow: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#9400D3'] as const,

  /** Neon pink glow */
  neonPink: ['#FF69B4', '#FF1493'] as const,

  /** Neon cyan glow */
  neonCyan: ['#40E0D0', '#00FFFF'] as const,

  /** Wheel rim shine */
  wheelRim: ['#FFD700', '#FFC000', '#FFD700'] as const,
} as const

/**
 * Shadow definitions for depth effects
 */
export const shadows = {
  /** Subtle shadow for cards */
  sm: {
    color: 0x000000,
    alpha: 0.3,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
  },
  /** Medium shadow for buttons */
  md: {
    color: 0x000000,
    alpha: 0.4,
    offsetX: 4,
    offsetY: 4,
    blur: 8,
  },
  /** Large shadow for modals */
  lg: {
    color: 0x000000,
    alpha: 0.5,
    offsetX: 8,
    offsetY: 8,
    blur: 16,
  },
  /** Glow shadow (for neon effect) */
  glow: {
    color: 0xFF00FF,
    alpha: 0.6,
    offsetX: 0,
    offsetY: 0,
    blur: 20,
  },
  /** Gold glow for premium elements */
  goldGlow: {
    color: 0xFFD700,
    alpha: 0.5,
    offsetX: 0,
    offsetY: 0,
    blur: 15,
  },
} as const

/**
 * Type for color keys
 */
export type ColorKey = keyof typeof colors

/**
 * Type for gradient keys
 */
export type GradientKey = keyof typeof gradients

/**
 * Helper to convert hex to Phaser color number
 */
export function hexToNumber(hex: string): number {
  return parseInt(hex.replace('#', ''), 16)
}

/**
 * Helper to get gradient colors as numbers
 */
export function getGradientColors(key: GradientKey): number[] {
  const gradient = gradients[key]
  return gradient.map((color) => {
    // Handle rgba strings
    if (color.startsWith('rgba')) {
      // Extract RGB values from rgba string
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
      if (match?.[1] && match[2] && match[3]) {
        const r = parseInt(match[1], 10)
        const g = parseInt(match[2], 10)
        const b = parseInt(match[3], 10)
        return (r << 16) | (g << 8) | b
      }
      return 0xFFFFFF
    }
    return hexToNumber(color)
  })
}
