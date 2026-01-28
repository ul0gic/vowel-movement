/**
 * Wheel game object
 * The spinning wheel with wedges, physics, and landing detection
 */

import { gsap } from 'gsap'
import Phaser from 'phaser'

import { colors, hexToNumber } from '../../../design-system/tokens/colors'
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
  hubRadius: 55,

  /** Outer rim width */
  rimWidth: 16,

  /** Pointer size */
  pointerSize: 36,

  /** Border between segments */
  segmentBorderWidth: 2,

  /** Font size for labels */
  labelFontSize: 18,

  /** Label distance from center (percentage of radius) */
  labelRadiusPercent: 0.68,

  /** Enable gradient segments */
  useGradients: true,

  /** Number of gradient steps per segment */
  gradientSteps: 5,
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

  /** Whether GSAP is handling the final deceleration */
  private gsapFinalPhase: boolean = false

  /** GSAP tween for final spin */
  private gsapSpinTween: gsap.core.Tween | null = null

  /** Velocity threshold to switch to GSAP final deceleration */
  private readonly GSAP_THRESHOLD = 3.5

  /** Animation state object for GSAP */
  private gsapAnimState = { rotation: 0 }

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
   * Draws all wheel segments with gradient effect
   */
  private drawSegments(): void {
    const { radius, segmentBorderWidth, gradientSteps } = WHEEL_CONFIG

    this.wheelGraphics.clear()

    for (let i = 0; i < WHEEL_SEGMENT_COUNT; i++) {
      const wedge = this.segmentData[i]
      if (!wedge) continue

      const startAngle = i * SEGMENT_ANGLE - Math.PI / 2 - SEGMENT_ANGLE / 2
      const endAngle = startAngle + SEGMENT_ANGLE

      // Draw gradient segment using multiple concentric arcs
      this.drawGradientSegment(startAngle, endAngle, wedge.color, radius, gradientSteps)

      // Draw segment border
      this.wheelGraphics.lineStyle(
        segmentBorderWidth,
        hexToNumber(colors.surface),
        0.8
      )
      this.wheelGraphics.beginPath()
      this.wheelGraphics.moveTo(0, 0)
      this.wheelGraphics.lineTo(
        Math.cos(startAngle) * radius,
        Math.sin(startAngle) * radius
      )
      this.wheelGraphics.strokePath()
    }

    // Draw outer edge circle
    this.wheelGraphics.lineStyle(segmentBorderWidth, hexToNumber(colors.surface), 0.5)
    this.wheelGraphics.strokeCircle(0, 0, radius)
  }

  /**
   * Draw a single segment with radial gradient effect
   */
  private drawGradientSegment(
    startAngle: number,
    endAngle: number,
    baseColor: string,
    radius: number,
    steps: number
  ): void {
    const baseColorNum = hexToNumber(baseColor)
    const innerRadius = WHEEL_CONFIG.hubRadius + 10

    for (let s = 0; s < steps; s++) {
      const t = s / (steps - 1)
      const outerR = innerRadius + (radius - innerRadius) * ((s + 1) / steps)
      const innerR = innerRadius + (radius - innerRadius) * (s / steps)

      // Create gradient by darkening towards center
      const brightness = 0.7 + t * 0.3
      const color = this.adjustBrightness(baseColorNum, brightness)

      this.wheelGraphics.fillStyle(color, 1)

      // Draw arc segment
      this.wheelGraphics.beginPath()
      this.wheelGraphics.arc(0, 0, outerR, startAngle, endAngle, false)
      this.wheelGraphics.arc(0, 0, innerR, endAngle, startAngle, true)
      this.wheelGraphics.closePath()
      this.wheelGraphics.fillPath()
    }

    // Add highlight at top of segment
    const highlightR = innerRadius + (radius - innerRadius) * 0.15
    this.wheelGraphics.fillStyle(0xFFFFFF, 0.15)
    this.wheelGraphics.beginPath()
    this.wheelGraphics.arc(0, 0, highlightR, startAngle, endAngle, false)
    this.wheelGraphics.arc(0, 0, innerRadius, endAngle, startAngle, true)
    this.wheelGraphics.closePath()
    this.wheelGraphics.fillPath()
  }

  /**
   * Adjust brightness of a color
   */
  private adjustBrightness(color: number, factor: number): number {
    const r = Math.min(255, Math.round(((color >> 16) & 0xFF) * factor))
    const g = Math.min(255, Math.round(((color >> 8) & 0xFF) * factor))
    const b = Math.min(255, Math.round((color & 0xFF) * factor))
    return (r << 16) | (g << 8) | b
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
   * Creates the center hub with 3D effect
   */
  private createHub(): void {
    const { hubRadius } = WHEEL_CONFIG
    const hub = this.scene.add.graphics()

    // Outer shadow
    hub.fillStyle(0x000000, 0.4)
    hub.fillCircle(3, 3, hubRadius + 8)

    // Outer hub ring (dark)
    hub.fillStyle(hexToNumber(colors.surface), 1)
    hub.fillCircle(0, 0, hubRadius + 8)

    // Gold rim
    hub.lineStyle(4, hexToNumber(colors.wheelGold), 1)
    hub.strokeCircle(0, 0, hubRadius + 4)

    // Main hub gradient (gold)
    const steps = 6
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const r = hubRadius * (1 - t * 0.15)
      const brightness = 0.8 + t * 0.2
      const color = this.adjustBrightness(hexToNumber(colors.wheelGold), brightness)
      hub.fillStyle(color, 1)
      hub.fillCircle(0, 0, r)
    }

    // Central highlight
    hub.fillStyle(0xFFFFFF, 0.4)
    hub.fillCircle(-hubRadius * 0.2, -hubRadius * 0.2, hubRadius * 0.35)

    // Inner dark ring
    hub.lineStyle(2, hexToNumber(colors.surface), 0.5)
    hub.strokeCircle(0, 0, hubRadius * 0.6)

    this.add(hub)
  }

  /**
   * Creates the outer rim with 3D shine effect
   */
  private createRim(): void {
    const { radius, rimWidth } = WHEEL_CONFIG
    const rim = this.scene.add.graphics()

    // Outer shadow
    rim.lineStyle(rimWidth + 4, 0x000000, 0.3)
    rim.strokeCircle(0, 0, radius + rimWidth / 2 + 2)

    // Main gold rim - darker base
    rim.lineStyle(rimWidth, this.adjustBrightness(hexToNumber(colors.wheelGold), 0.7), 1)
    rim.strokeCircle(0, 0, radius + rimWidth / 2)

    // Lighter inner edge
    rim.lineStyle(rimWidth * 0.4, hexToNumber(colors.wheelGold), 1)
    rim.strokeCircle(0, 0, radius + rimWidth * 0.3)

    // Highlight at top
    rim.lineStyle(rimWidth * 0.2, 0xFFFFFF, 0.4)
    rim.strokeCircle(0, 0, radius + rimWidth * 0.2)

    // Inner dark edge
    rim.lineStyle(3, hexToNumber(colors.surface), 0.8)
    rim.strokeCircle(0, 0, radius)

    // Outer dark edge
    rim.lineStyle(2, hexToNumber(colors.surface), 0.6)
    rim.strokeCircle(0, 0, radius + rimWidth)

    // Add tick marks on rim
    const tickCount = WHEEL_SEGMENT_COUNT
    const tickLength = 8
    rim.lineStyle(2, hexToNumber(colors.surface), 0.5)

    for (let i = 0; i < tickCount; i++) {
      const angle = (i / tickCount) * Math.PI * 2 - Math.PI / 2
      const innerR = radius + rimWidth - tickLength
      const outerR = radius + rimWidth

      rim.beginPath()
      rim.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR)
      rim.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR)
      rim.strokePath()
    }

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

    // Reset GSAP state
    this.gsapFinalPhase = false
    if (this.gsapSpinTween) {
      this.gsapSpinTween.kill()
      this.gsapSpinTween = null
    }
    this.gsapAnimState.rotation = this.physicsState.rotation

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

    // If GSAP is handling the final phase, just update tick tracking
    if (this.gsapFinalPhase) {
      this.updateGsapPhase()
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

    // Check if we should switch to GSAP for final dramatic deceleration
    if (
      this.physicsState.angularVelocity < this.GSAP_THRESHOLD &&
      this.physicsState.angularVelocity > 0 &&
      this.physicsState.rotationsCompleted >= 2
    ) {
      this.startGsapFinalPhase()
      return
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
           
          console.warn('[Wheel] Spin timed out, forcing stop')
        }
      }
      this.onSpinComplete()
    }
  }

  /**
   * Start GSAP-based final deceleration for dramatic effect
   */
  private startGsapFinalPhase(): void {
    this.gsapFinalPhase = true

    // Calculate remaining rotation - add 0.5-1.5 extra rotations for suspense
    const currentRotation = this.physicsState.rotation
    const extraRotation = (0.5 + Math.random()) * Math.PI * 2
    const finalRotation = currentRotation + extraRotation

    // Set up GSAP animation state
    this.gsapAnimState.rotation = currentRotation

    // Determine duration based on remaining rotation (slower = more dramatic)
    const duration = 2 + (extraRotation / (Math.PI * 2)) * 1.5

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[Wheel] Starting GSAP final phase, duration: ${duration.toFixed(2)}s`)
    }

    // Create GSAP tween with dramatic easing
    this.gsapSpinTween = gsap.to(this.gsapAnimState, {
      rotation: finalRotation,
      duration,
      ease: 'power3.out', // Strong deceleration curve
      onUpdate: () => {
        // Apply rotation to wheel
        this.wheelGraphics.setRotation(this.gsapAnimState.rotation)
        this.labelsContainer.setRotation(this.gsapAnimState.rotation)

        // Update physics state for consistency
        this.physicsState = {
          ...this.physicsState,
          rotation: this.gsapAnimState.rotation,
        }
      },
      onComplete: () => {
        // Update final physics state
        this.physicsState = {
          ...this.physicsState,
          angularVelocity: 0,
          isSpinning: false,
          rotation: finalRotation,
        }
        this.gsapFinalPhase = false
        this.gsapSpinTween = null
        this.onSpinComplete()
      },
    })
  }

  /**
   * Update during GSAP final phase - handle tick sounds
   */
  private updateGsapPhase(): void {
    // Check for tick (segment boundary crossing)
    const currentSegment = calculateLandingSegment(
      this.gsapAnimState.rotation,
      WHEEL_SEGMENT_COUNT
    )

    const tickResult = checkTick(this.tickTracker, currentSegment)
    this.tickTracker = tickResult.tracker

    if (tickResult.shouldTick) {
      // Calculate approximate velocity for tick intensity
      // During GSAP phase, velocity decreases over time
      const tweenProgress = this.gsapSpinTween?.progress() ?? 1
      const velocityApprox = this.GSAP_THRESHOLD * (1 - tweenProgress * 0.9)

      // Animate pointer tick with decreasing intensity
      animatePointerTick(
        this.scene,
        this.pointer,
        velocityApprox
      )

      // Play tick sound with pitch based on approximate speed
      const maxVelocity = 15
      const speedFactor = Math.min(velocityApprox / maxVelocity, 1)
      getAudioSystem().playWheelTick(speedFactor)
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
    // Kill any running GSAP tween
    if (this.gsapSpinTween) {
      this.gsapSpinTween.kill()
      this.gsapSpinTween = null
    }

    // Remove pointer from scene
    this.pointer.destroy()

    super.destroy(fromScene)
  }
}
