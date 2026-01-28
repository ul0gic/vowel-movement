/**
 * Wheel wedge configuration
 * Defines all 24 segments with their types, values, and colors
 */

import { colors } from '../../design-system/tokens/colors'

/**
 * Types of wedges on the wheel
 */
export type WedgeType = 'bankrupt' | 'freeSpin' | 'loseTurn' | 'points'

/**
 * Configuration for a single wheel wedge
 */
export interface WheelWedge {
  /** Unique identifier for this wedge */
  id: string
  /** Type of wedge */
  type: WedgeType
  /** Point value (only for points type) */
  value: number
  /** Display label on the wedge */
  label: string
  /** Wedge color (hex) */
  color: string
  /** Text color for label (hex) */
  textColor: string
}

/**
 * Color palette for wheel wedges
 * Using neon trash aesthetic with high saturation
 */
const WEDGE_COLORS = {
  // Point value colors (variety for visual interest)
  blue: colors.wheelBlue,
  cyan: colors.wheelTeal,
  gold: colors.wheelGold,
  green: colors.wheelGreen,
  lime: '#7FFF00',
  orange: colors.wheelOrange,
  pink: colors.wheelPink,
  purple: colors.wheelPurple,
  red: colors.wheelRed,
  teal: '#20B2AA',
  // Special wedge colors
  bankrupt: '#0A0A0A',
  freeSpin: colors.wheelGold,
  loseTurn: colors.wheelSilver,
}

/**
 * All 24 wheel segments configuration
 * Order matters - this is clockwise from the top
 *
 * Wheel wedge values from PRD:
 * 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000
 * BANKRUPT (x2), LOSE A TURN, FREE SPIN
 */
export const wheelSegments: WheelWedge[] = [
  // Segment 0 - Top (pointer position)
  {
    color: WEDGE_COLORS.blue,
    id: 'w0',
    label: '500',
    textColor: '#ffffff',
    type: 'points',
    value: 500,
  },
  // Segment 1
  {
    color: WEDGE_COLORS.pink,
    id: 'w1',
    label: '600',
    textColor: '#000000',
    type: 'points',
    value: 600,
  },
  // Segment 2
  {
    color: WEDGE_COLORS.green,
    id: 'w2',
    label: '700',
    textColor: '#000000',
    type: 'points',
    value: 700,
  },
  // Segment 3 - LOSE A TURN
  {
    color: WEDGE_COLORS.loseTurn,
    id: 'w3',
    label: 'LOSE\nA TURN',
    textColor: '#000000',
    type: 'loseTurn',
    value: 0,
  },
  // Segment 4
  {
    color: WEDGE_COLORS.purple,
    id: 'w4',
    label: '800',
    textColor: '#ffffff',
    type: 'points',
    value: 800,
  },
  // Segment 5
  {
    color: WEDGE_COLORS.orange,
    id: 'w5',
    label: '350',
    textColor: '#000000',
    type: 'points',
    value: 350,
  },
  // Segment 6 - BANKRUPT #1
  {
    color: WEDGE_COLORS.bankrupt,
    id: 'w6',
    label: 'BANKRUPT',
    textColor: '#ff0000',
    type: 'bankrupt',
    value: 0,
  },
  // Segment 7
  {
    color: WEDGE_COLORS.cyan,
    id: 'w7',
    label: '450',
    textColor: '#000000',
    type: 'points',
    value: 450,
  },
  // Segment 8
  {
    color: WEDGE_COLORS.red,
    id: 'w8',
    label: '200',
    textColor: '#ffffff',
    type: 'points',
    value: 200,
  },
  // Segment 9
  {
    color: WEDGE_COLORS.lime,
    id: 'w9',
    label: '900',
    textColor: '#000000',
    type: 'points',
    value: 900,
  },
  // Segment 10
  {
    color: WEDGE_COLORS.teal,
    id: 'w10',
    label: '300',
    textColor: '#ffffff',
    type: 'points',
    value: 300,
  },
  // Segment 11
  {
    color: WEDGE_COLORS.gold,
    id: 'w11',
    label: '1000',
    textColor: '#000000',
    type: 'points',
    value: 1000,
  },
  // Segment 12 - FREE SPIN
  {
    color: WEDGE_COLORS.freeSpin,
    id: 'w12',
    label: 'FREE\nSPIN',
    textColor: '#000000',
    type: 'freeSpin',
    value: 0,
  },
  // Segment 13
  {
    color: WEDGE_COLORS.blue,
    id: 'w13',
    label: '250',
    textColor: '#ffffff',
    type: 'points',
    value: 250,
  },
  // Segment 14
  {
    color: WEDGE_COLORS.pink,
    id: 'w14',
    label: '100',
    textColor: '#000000',
    type: 'points',
    value: 100,
  },
  // Segment 15
  {
    color: WEDGE_COLORS.green,
    id: 'w15',
    label: '550',
    textColor: '#000000',
    type: 'points',
    value: 550,
  },
  // Segment 16
  {
    color: WEDGE_COLORS.purple,
    id: 'w16',
    label: '400',
    textColor: '#ffffff',
    type: 'points',
    value: 400,
  },
  // Segment 17 - BANKRUPT #2
  {
    color: WEDGE_COLORS.bankrupt,
    id: 'w17',
    label: 'BANKRUPT',
    textColor: '#ff0000',
    type: 'bankrupt',
    value: 0,
  },
  // Segment 18
  {
    color: WEDGE_COLORS.orange,
    id: 'w18',
    label: '650',
    textColor: '#000000',
    type: 'points',
    value: 650,
  },
  // Segment 19
  {
    color: WEDGE_COLORS.cyan,
    id: 'w19',
    label: '150',
    textColor: '#000000',
    type: 'points',
    value: 150,
  },
  // Segment 20
  {
    color: WEDGE_COLORS.red,
    id: 'w20',
    label: '750',
    textColor: '#ffffff',
    type: 'points',
    value: 750,
  },
  // Segment 21
  {
    color: WEDGE_COLORS.lime,
    id: 'w21',
    label: '850',
    textColor: '#000000',
    type: 'points',
    value: 850,
  },
  // Segment 22
  {
    color: WEDGE_COLORS.teal,
    id: 'w22',
    label: '300',
    textColor: '#ffffff',
    type: 'points',
    value: 300,
  },
  // Segment 23
  {
    color: WEDGE_COLORS.gold,
    id: 'w23',
    label: '500',
    textColor: '#000000',
    type: 'points',
    value: 500,
  },
]

/**
 * Total number of segments on the wheel
 */
export const WHEEL_SEGMENT_COUNT = wheelSegments.length

/**
 * Angle per segment in radians
 */
export const SEGMENT_ANGLE = (Math.PI * 2) / WHEEL_SEGMENT_COUNT

/**
 * Angle per segment in degrees
 */
export const SEGMENT_ANGLE_DEG = 360 / WHEEL_SEGMENT_COUNT
