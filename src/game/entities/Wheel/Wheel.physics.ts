/**
 * Wheel spin physics
 * Physics-based deceleration for natural wheel spin feel
 */

/**
 * Physics configuration for wheel spin
 */
export const WheelPhysicsConfig = {
  /** Friction coefficient - affects deceleration rate */
  friction: 0.985,

  /** Minimum velocity before stopping (radians per second) */
  minVelocity: 0.001,

  /** Minimum spin velocity (radians per second) */
  minSpinVelocity: 15,

  /** Maximum spin velocity (radians per second) */
  maxSpinVelocity: 30,

  /** Extra friction applied when velocity is very low for dramatic slowdown */
  lowSpeedFriction: 0.97,

  /** Velocity threshold for applying low speed friction */
  lowSpeedThreshold: 2,

  /** Minimum number of full rotations before stopping */
  minRotations: 3,

  /** Extra friction to apply during final rotations for tension */
  finalFriction: 0.99,

  /** Velocity threshold for "final" slowdown phase */
  finalPhaseThreshold: 4,
} as const

/**
 * Wheel physics state
 */
export interface WheelPhysicsState {
  /** Current angular velocity in radians per second */
  angularVelocity: number
  /** Current rotation angle in radians */
  rotation: number
  /** Is the wheel currently spinning */
  isSpinning: boolean
  /** Total rotations completed in this spin */
  rotationsCompleted: number
  /** Starting rotation when spin began */
  spinStartRotation: number
}

/**
 * Creates initial physics state
 */
export function createPhysicsState(): WheelPhysicsState {
  return {
    angularVelocity: 0,
    isSpinning: false,
    rotation: 0,
    rotationsCompleted: 0,
    spinStartRotation: 0,
  }
}

/**
 * Generates a random initial spin velocity
 */
export function generateSpinVelocity(): number {
  const { maxSpinVelocity, minSpinVelocity } = WheelPhysicsConfig
  return minSpinVelocity + Math.random() * (maxSpinVelocity - minSpinVelocity)
}

/**
 * Updates physics state for one frame
 * @param state Current physics state
 * @param deltaSeconds Time since last update in seconds
 * @returns Updated physics state
 */
export function updatePhysics(
  state: WheelPhysicsState,
  deltaSeconds: number
): WheelPhysicsState {
  if (!state.isSpinning) {
    return state
  }

  const { finalFriction, finalPhaseThreshold, friction, lowSpeedFriction, lowSpeedThreshold, minRotations, minVelocity } =
    WheelPhysicsConfig

  // Calculate rotations completed
  const totalRotation = Math.abs(state.rotation - state.spinStartRotation)
  const rotationsCompleted = totalRotation / (Math.PI * 2)

  // Determine which friction to use
  let currentFriction: number = friction

  // Apply stronger friction in final phase for drama
  if (state.angularVelocity < finalPhaseThreshold && rotationsCompleted >= minRotations) {
    currentFriction = finalFriction
  }

  // Apply even stronger friction at very low speeds
  if (state.angularVelocity < lowSpeedThreshold && rotationsCompleted >= minRotations) {
    currentFriction = lowSpeedFriction
  }

  // Apply friction based on frame time
  // For frame-rate independence, we need to scale friction by deltaTime
  const frictionScale = Math.pow(currentFriction, deltaSeconds * 60)
  const newVelocity = state.angularVelocity * frictionScale

  // Update rotation
  const newRotation = state.rotation + state.angularVelocity * deltaSeconds

  // Check if we should stop
  const shouldStop =
    newVelocity < minVelocity && rotationsCompleted >= minRotations

  if (shouldStop) {
    return {
      ...state,
      angularVelocity: 0,
      isSpinning: false,
      rotation: newRotation,
      rotationsCompleted,
    }
  }

  return {
    ...state,
    angularVelocity: newVelocity,
    rotation: newRotation,
    rotationsCompleted,
  }
}

/**
 * Start a spin with initial velocity
 */
export function startSpin(
  state: WheelPhysicsState,
  initialVelocity: number
): WheelPhysicsState {
  return {
    ...state,
    angularVelocity: initialVelocity,
    isSpinning: true,
    rotationsCompleted: 0,
    spinStartRotation: state.rotation,
  }
}

/**
 * Calculate which segment index is at the pointer position
 * Pointer is at the top (12 o'clock position)
 * @param rotation Current wheel rotation in radians
 * @param segmentCount Number of segments on the wheel
 * @returns Index of the segment at the pointer
 */
export function calculateLandingSegment(
  rotation: number,
  segmentCount: number
): number {
  // Normalize rotation to 0 - 2PI range
  const normalizedRotation = ((rotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)

  // Calculate segment angle
  const segmentAngle = (Math.PI * 2) / segmentCount

  // Pointer is at top (PI/2 from right = 12 o'clock)
  // Wheel rotates clockwise (positive direction)
  // We need to find which segment is at the top

  // Offset by half a segment so we measure from segment centers
  const adjustedRotation = normalizedRotation + segmentAngle / 2

  // Calculate segment index (wheel rotates, so we go backwards through segments)
  const segmentIndex =
    Math.floor(adjustedRotation / segmentAngle) % segmentCount

  // Since wheel rotates clockwise, we actually go through segments in reverse
  return (segmentCount - segmentIndex) % segmentCount
}
