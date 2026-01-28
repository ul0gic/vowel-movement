/**
 * Wheel game object
 * The spinning wheel with wedges, physics, and landing detection
 */

import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_WHEEL } from '../../data/constants'
import type { WedgeResult, WheelState } from '../../data/types'
import {
  SEGMENT_ANGLE,
  WHEEL_SEGMENT_COUNT,
  wheelSegments,
  type WheelWedge,
} from '../../data/wheelSegments'
import { GameEvents } from '../../scenes/GameScene'
import { getAudioSystem } from '../../systems/AudioSystem'
import {
  animatePointerTick,
  animateWheelLanding,
  checkTick,
  createTickTracker,
  type TickTracker,
} from './Wheel.animations'
import {
  calculateLandingSegment,
  createPhysicsState,
  generateSpinVelocity,
  startSpin,
  updatePhysics,
  type WheelPhysicsState,
} from './Wheel.physics'

/**
 * Configuration for wheel appearance
 */
const WHEEL_CONFIG = {
  /** Wheel radius in pixels */
  radius: 320,

  /** Inner radius for hub */
  hubRadius: 50,

  /** Outer rim width */
  rimWidth: 12,

  /** Pointer size */
  pointerSize: 32,

  /** Border between segments */
  segmentBorderWidth: 3,

  /** Font size for labels */
  labelFontSize: 18,

  /** Label distance from center (percentage of radius) */
  labelRadiusPercent: 0.68,
} as const

/**
 * Wheel - The spinning game wheel
 * Extends Phaser.GameObjects.Container to hold all wheel elements
 */
export class Wheel extends Phaser.GameObjects.Container {
  /** The graphics object for wheel segments */
  private wheelGraphics!: Phaser.GameObjects.Graphics

  /** Container for segment labels */
  private labelsContainer!: Phaser.GameObjects.Container

  /** The pointer/ticker at top */
  private pointer!: Phaser.GameObjects.Graphics

  /** Physics state */
  private physicsState: WheelPhysicsState

  /** Tick tracking for feedback */
  private tickTracker: TickTracker

  /** Current wheel state */
  private wheelState: WheelState = 'idle'

  /** Whether the wheel can be spun */
  private canSpin = true

  /** Cached segment data for hit detection */
  private readonly segmentData: readonly WheelWedge[] = wheelSegments

  /** Spin start time for timeout fallback */
  private spinStartTime: number = 0

  /** Maximum spin duration in ms before forcing stop */
  private readonly MAX_SPIN_DURATION = 15000

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)

    // Initialize physics
    this.physicsState = createPhysicsState()
    this.tickTracker = createTickTracker()

    // Build the wheel
    this.createWheel()
    this.createLabels()
    this.createHub()
    this.createRim()
    this.createPointer()

    // Set depth
    this.setDepth(DEPTH_WHEEL)

    // Make interactive for spinning
    this.setupInteraction()

    // Add to scene
    scene.add.existing(this)
  }

  /**
   * Creates the wheel segments using Graphics
   */
  private createWheel(): void {
    this.wheelGraphics = this.scene.add.graphics()
    this.add(this.wheelGraphics)

    this.drawSegments()
  }

  /**
   * Draws all wheel segments
   */
  private drawSegments(): void {
    const { radius, segmentBorderWidth } = WHEEL_CONFIG

    this.wheelGraphics.clear()

    for (let i = 0; i < WHEEL_SEGMENT_COUNT; i++) {
      const wedge = this.segmentData[i]
      if (!wedge) continue

      const startAngle = i * SEGMENT_ANGLE - Math.PI / 2 - SEGMENT_ANGLE / 2
      const endAngle = startAngle + SEGMENT_ANGLE

      // Draw segment fill
      this.wheelGraphics.fillStyle(
        Phaser.Display.Color.HexStringToColor(wedge.color).color,
        1
      )
      this.wheelGraphics.slice(0, 0, radius, startAngle, endAngle, false)
      this.wheelGraphics.fillPath()

      // Draw segment border
      this.wheelGraphics.lineStyle(
        segmentBorderWidth,
        Phaser.Display.Color.HexStringToColor(colors.surface).color,
        1
      )
      this.wheelGraphics.slice(0, 0, radius, startAngle, endAngle, false)
      this.wheelGraphics.strokePath()
    }
  }

  /**
   * Creates labels for each segment
   */
  private createLabels(): void {
    this.labelsContainer = this.scene.add.container(0, 0)
    this.add(this.labelsContainer)

    const { labelFontSize, labelRadiusPercent, radius } = WHEEL_CONFIG
    const labelRadius = radius * labelRadiusPercent

    for (let i = 0; i < WHEEL_SEGMENT_COUNT; i++) {
      const wedge = this.segmentData[i]
      if (!wedge) continue

      // Calculate position at center of segment
      const angle = i * SEGMENT_ANGLE - Math.PI / 2

      const x = Math.cos(angle) * labelRadius
      const y = Math.sin(angle) * labelRadius

      // Create text with high resolution for crisp rendering
      const text = this.scene.add
        .text(x, y, wedge.label, {
          align: 'center',
          color: wedge.textColor,
          fontFamily: typography.fontFamily.display,
          fontSize: `${labelFontSize}px`,
          fontStyle: 'bold',
          resolution: 2,
        })
        .setOrigin(0.5)

      // Rotate text to align with segment
      text.setRotation(angle + Math.PI / 2)

      this.labelsContainer.add(text)
    }
  }

  /**
   * Creates the center hub
   */
  private createHub(): void {
    const { hubRadius } = WHEEL_CONFIG
    const hub = this.scene.add.graphics()

    // Outer hub ring
    hub.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      1
    )
    hub.fillCircle(0, 0, hubRadius + 5)

    // Inner hub
    hub.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.wheelGold).color,
      1
    )
    hub.fillCircle(0, 0, hubRadius)

    // Hub highlight
    hub.fillStyle(0xffffff, 0.3)
    hub.fillCircle(-5, -5, hubRadius * 0.5)

    this.add(hub)
  }

  /**
   * Creates the outer rim
   */
  private createRim(): void {
    const { radius, rimWidth } = WHEEL_CONFIG
    const rim = this.scene.add.graphics()

    // Outer ring
    rim.lineStyle(
      rimWidth,
      Phaser.Display.Color.HexStringToColor(colors.wheelGold).color,
      1
    )
    rim.strokeCircle(0, 0, radius + rimWidth / 2)

    // Inner accent ring
    rim.lineStyle(
      2,
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      0.5
    )
    rim.strokeCircle(0, 0, radius - 1)

    this.add(rim)
  }

  /**
   * Creates the pointer/ticker at the top
   * The pointer is positioned outside the container so it doesn't rotate with the wheel
   */
  private createPointer(): void {
    const { pointerSize, radius, rimWidth } = WHEEL_CONFIG

    // Pointer is positioned above the wheel
    this.pointer = this.scene.add.graphics()

    // Draw triangle pointing down
    this.pointer.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.danger).color,
      1
    )
    this.pointer.beginPath()
    this.pointer.moveTo(0, pointerSize) // Bottom point
    this.pointer.lineTo(-pointerSize * 0.7, -pointerSize * 0.3) // Top left
    this.pointer.lineTo(pointerSize * 0.7, -pointerSize * 0.3) // Top right
    this.pointer.closePath()
    this.pointer.fillPath()

    // Add border
    this.pointer.lineStyle(2, 0xffffff, 1)
    this.pointer.beginPath()
    this.pointer.moveTo(0, pointerSize)
    this.pointer.lineTo(-pointerSize * 0.7, -pointerSize * 0.3)
    this.pointer.lineTo(pointerSize * 0.7, -pointerSize * 0.3)
    this.pointer.closePath()
    this.pointer.strokePath()

    // Position pointer at top of wheel (outside container)
    this.pointer.setPosition(this.x, this.y - radius - rimWidth - pointerSize * 0.3)

    // Add to scene directly (not to container) so it doesn't rotate
    this.scene.add.existing(this.pointer)
    this.pointer.setDepth(DEPTH_WHEEL + 1)
  }

  /**
   * Sets up click/tap interaction to spin
   */
  private setupInteraction(): void {
    const { radius } = WHEEL_CONFIG

    // Create hit area for the wheel
    this.setSize(radius * 2, radius * 2)
    this.setInteractive({
      hitArea: new Phaser.Geom.Circle(0, 0, radius),
      hitAreaCallback: (hitArea: Phaser.Geom.Circle, x: number, y: number) =>
        Phaser.Geom.Circle.Contains(hitArea, x, y),
      useHandCursor: true,
    })

    // Spin on click/tap
    this.on('pointerdown', () => {
      this.spin()
    })
  }

  /**
   * Spin the wheel
   * @returns true if spin started, false if wheel is already spinning
   */
  public spin(): boolean {
    if (!this.canSpin || this.wheelState !== 'idle') {
      return false
    }

    // Generate random velocity
    const velocity = generateSpinVelocity()

    // Start physics
    this.physicsState = startSpin(this.physicsState, velocity)

    // Reset tick tracker
    this.tickTracker = createTickTracker()

    // Record start time for timeout fallback
    this.spinStartTime = Date.now()

    // Update state
    this.wheelState = 'spinning'
    this.canSpin = false

    // Emit spin event
    this.scene.events.emit(GameEvents.WHEEL_SPIN, {
      initialVelocity: velocity,
    })

    // Log for development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Wheel] Spin started with velocity: ${velocity.toFixed(2)}`)
    }

    return true
  }

  /**
   * Update called each frame
   */
  public update(_time: number, delta: number): void {
    if (!this.physicsState.isSpinning) {
      return
    }

    const deltaSeconds = delta / 1000

    // Update physics - may transition to stopped state
    this.physicsState = updatePhysics(this.physicsState, deltaSeconds)

    // Apply rotation to wheel graphics and labels
    this.wheelGraphics.setRotation(this.physicsState.rotation)
    this.labelsContainer.setRotation(this.physicsState.rotation)

    // Check for tick (segment boundary crossing)
    const currentSegment = calculateLandingSegment(
      this.physicsState.rotation,
      WHEEL_SEGMENT_COUNT
    )

    const tickResult = checkTick(this.tickTracker, currentSegment)
    this.tickTracker = tickResult.tracker

    if (tickResult.shouldTick) {
      // Animate pointer tick
      animatePointerTick(
        this.scene,
        this.pointer,
        this.physicsState.angularVelocity
      )

      // Play tick sound with pitch based on speed
      const maxVelocity = 15 // Approximate max velocity
      const speedFactor = Math.min(this.physicsState.angularVelocity / maxVelocity, 1)
      getAudioSystem().playWheelTick(speedFactor)
    }

    // Check if wheel just stopped (physics update can stop the wheel)
    // Also check for timeout fallback to prevent getting stuck
    const timedOut = Date.now() - this.spinStartTime > this.MAX_SPIN_DURATION
    if (!this.physicsState.isSpinning || timedOut) {
      if (timedOut) {
        // Force stop the physics
        this.physicsState = {
          ...this.physicsState,
          angularVelocity: 0,
          isSpinning: false,
        }
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[Wheel] Spin timed out, forcing stop')
        }
      }
      this.onSpinComplete()
    }
  }

  /**
   * Called when spin completes
   */
  private onSpinComplete(): void {
    // Get landing segment
    const segmentIndex = calculateLandingSegment(
      this.physicsState.rotation,
      WHEEL_SEGMENT_COUNT
    )

    // Get wedge - segmentIndex is guaranteed to be valid (0 to WHEEL_SEGMENT_COUNT-1)
    const wedge = this.segmentData[segmentIndex] as WheelWedge

    // Create result
    const result: WedgeResult = {
      type: wedge.type,
      value: wedge.value,
      wedge,
    }

    // Update state
    this.wheelState = 'stopped'

    // Animate landing
    animateWheelLanding(this.scene, this)

    // Re-enable spinning after short delay
    this.scene.time.delayedCall(500, () => {
      this.wheelState = 'idle'
      this.canSpin = true
    })

    // Log for development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Wheel] Landed on segment ${segmentIndex}: ${wedge.label} (${wedge.type})`)
    }

    // Emit landed event
    this.scene.events.emit(GameEvents.WHEEL_LANDED, {
      result,
      segmentIndex,
    })
  }

  /**
   * Enable or disable spinning
   */
  public setSpinEnabled(enabled: boolean): void {
    this.canSpin = enabled

    if (enabled) {
      this.setInteractive()
    } else {
      this.disableInteractive()
    }
  }

  /**
   * Get current wheel state
   */
  public getState(): WheelState {
    return this.wheelState
  }

  /**
   * Get current rotation in radians
   */
  public getRotation(): number {
    return this.physicsState.rotation
  }

  /**
   * Get current angular velocity
   */
  public getAngularVelocity(): number {
    return this.physicsState.angularVelocity
  }

  /**
   * Check if wheel is currently spinning
   */
  public isSpinning(): boolean {
    return this.physicsState.isSpinning
  }

  /**
   * Clean up when wheel is destroyed
   */
  public destroy(fromScene?: boolean): void {
    // Remove pointer from scene
    this.pointer.destroy()

    super.destroy(fromScene)
  }
}
