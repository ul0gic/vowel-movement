/**
 * GSAP Integration Helpers for Phaser
 *
 * Provides utilities to animate Phaser game objects using GSAP:
 * - Timeline helpers for complex sequences
 * - Easing presets for game feel
 * - Phaser-specific property animations
 * - Staggered animations for UI elements
 */
import { gsap } from 'gsap'

// ============================================
// TYPES
// ============================================

/** Animation target - Phaser game objects or plain objects */
type AnimationTarget =
  | Phaser.GameObjects.Container
  | Phaser.GameObjects.Graphics
  | Phaser.GameObjects.Sprite
  | Phaser.GameObjects.Text
  | Phaser.GameObjects.Image
  | { [key: string]: number }

/** Common easing presets for game feel */
export const Easing = {
  /** Smooth deceleration - great for UI entrances */
  smoothOut: 'power2.out',
  /** Smooth acceleration - great for exits */
  smoothIn: 'power2.in',
  /** Symmetric smooth - great for hover states */
  smoothInOut: 'power2.inOut',
  /** Bouncy landing - great for buttons, celebrations */
  bounce: 'bounce.out',
  /** Elastic overshoot - great for emphasis */
  elastic: 'elastic.out(1, 0.5)',
  /** Anticipation - pulls back before going */
  back: 'back.out(1.7)',
  /** Strong back easing for menus */
  backStrong: 'back.out(2.5)',
  /** Linear - for constant motion */
  linear: 'none',
  /** Snap - quick ease for responsive feel */
  snap: 'power3.out',
  /** Circ out - nice for scale animations */
  circOut: 'circ.out',
} as const

// ============================================
// BASIC ANIMATIONS
// ============================================

/**
 * Animate a single property or multiple properties
 */
export function animate(
  target: AnimationTarget | AnimationTarget[],
  vars: gsap.TweenVars
): gsap.core.Tween {
  return gsap.to(target, vars)
}

/**
 * Animate from a state to current state
 */
export function animateFrom(
  target: AnimationTarget | AnimationTarget[],
  vars: gsap.TweenVars
): gsap.core.Tween {
  return gsap.from(target, vars)
}

/**
 * Set properties immediately (no animation)
 */
export function setProps(
  target: AnimationTarget | AnimationTarget[],
  vars: gsap.TweenVars
): gsap.core.Tween {
  return gsap.set(target, vars)
}

// ============================================
// PHASER-SPECIFIC ANIMATIONS
// ============================================

/**
 * Fade in a Phaser game object
 */
export function fadeIn(
  target: AnimationTarget | AnimationTarget[],
  duration: number = 0.3,
  options: { delay?: number; ease?: string; onComplete?: () => void } = {}
): gsap.core.Tween {
  return gsap.fromTo(
    target,
    { alpha: 0 },
    {
      alpha: 1,
      duration,
      ease: options.ease ?? Easing.smoothOut,
      delay: options.delay ?? 0,
      onComplete: options.onComplete,
    }
  )
}

/**
 * Fade out a Phaser game object
 */
export function fadeOut(
  target: AnimationTarget | AnimationTarget[],
  duration: number = 0.3,
  options: { delay?: number; ease?: string; onComplete?: () => void } = {}
): gsap.core.Tween {
  return gsap.to(target, {
    alpha: 0,
    duration,
    ease: options.ease ?? Easing.smoothIn,
    delay: options.delay ?? 0,
    onComplete: options.onComplete,
  })
}

/**
 * Scale pop animation - great for buttons and emphasis
 */
export function scalePop(
  target: AnimationTarget | AnimationTarget[],
  scale: number = 1.2,
  duration: number = 0.15,
  options: { ease?: string; yoyo?: boolean } = {}
): gsap.core.Tween {
  return gsap.to(target, {
    scaleX: scale,
    scaleY: scale,
    duration,
    ease: options.ease ?? Easing.back,
    yoyo: options.yoyo ?? true,
    repeat: options.yoyo !== false ? 1 : 0,
  })
}

/**
 * Bounce in animation - element enters with bounce
 */
export function bounceIn(
  target: AnimationTarget | AnimationTarget[],
  duration: number = 0.5,
  options: { delay?: number; from?: 'top' | 'bottom' | 'left' | 'right' | 'scale' } = {}
): gsap.core.Tween {
  const from = options.from ?? 'scale'

  const fromVars: gsap.TweenVars = { alpha: 0 }
  if (from === 'scale') {
    fromVars.scaleX = 0
    fromVars.scaleY = 0
  } else if (from === 'top') {
    fromVars.y = '-=50'
  } else if (from === 'bottom') {
    fromVars.y = '+=50'
  } else if (from === 'left') {
    fromVars.x = '-=50'
  } else {
    // from === 'right'
    fromVars.x = '+=50'
  }

  return gsap.from(target, {
    ...fromVars,
    duration,
    ease: Easing.back,
    delay: options.delay ?? 0,
  })
}

/**
 * Shake animation - great for errors or impacts
 */
export function shake(
  target: AnimationTarget,
  intensity: number = 5,
  duration: number = 0.4
): gsap.core.Timeline {
  const tl = gsap.timeline()
  const steps = 6
  const stepDuration = duration / steps

  for (let i = 0; i < steps; i++) {
    const offset = (i % 2 === 0 ? 1 : -1) * intensity * (1 - i / steps)
    tl.to(target, { x: `+=${offset}`, duration: stepDuration, ease: 'power1.inOut' })
  }

  tl.to(target, { x: '+=0', duration: 0.1 }) // Reset

  return tl
}

/**
 * Pulse animation - subtle attention grabber
 */
export function pulse(
  target: AnimationTarget | AnimationTarget[],
  scale: number = 1.05,
  duration: number = 0.8,
  options: { repeat?: number } = {}
): gsap.core.Tween {
  return gsap.to(target, {
    scaleX: scale,
    scaleY: scale,
    duration: duration / 2,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: options.repeat ?? -1, // -1 = infinite
  })
}

/**
 * Float animation - gentle hover effect
 */
export function float(
  target: AnimationTarget | AnimationTarget[],
  distance: number = 8,
  duration: number = 2,
  options: { delay?: number } = {}
): gsap.core.Tween {
  return gsap.to(target, {
    y: `+=${distance}`,
    duration,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: options.delay ?? 0,
  })
}

// ============================================
// STAGGERED ANIMATIONS
// ============================================

/**
 * Stagger fade in multiple elements
 */
export function staggerFadeIn(
  targets: AnimationTarget[],
  staggerTime: number = 0.1,
  options: {
    duration?: number
    ease?: string
    from?: 'start' | 'end' | 'center' | 'edges' | 'random'
    onComplete?: () => void
  } = {}
): gsap.core.Tween {
  return gsap.from(targets, {
    alpha: 0,
    duration: options.duration ?? 0.3,
    ease: options.ease ?? Easing.smoothOut,
    stagger: {
      amount: staggerTime * targets.length,
      from: options.from ?? 'start',
    },
    onComplete: options.onComplete,
  })
}

/**
 * Stagger scale in multiple elements
 */
export function staggerScaleIn(
  targets: AnimationTarget[],
  staggerTime: number = 0.05,
  options: {
    duration?: number
    ease?: string
    from?: 'start' | 'end' | 'center' | 'edges' | 'random'
  } = {}
): gsap.core.Tween {
  return gsap.from(targets, {
    scaleX: 0,
    scaleY: 0,
    alpha: 0,
    duration: options.duration ?? 0.4,
    ease: options.ease ?? Easing.back,
    stagger: {
      amount: staggerTime * targets.length,
      from: options.from ?? 'start',
    },
  })
}

/**
 * Stagger slide in from direction
 */
export function staggerSlideIn(
  targets: AnimationTarget[],
  direction: 'left' | 'right' | 'top' | 'bottom' = 'left',
  staggerTime: number = 0.08,
  options: { duration?: number; distance?: number; ease?: string } = {}
): gsap.core.Tween {
  const distance = options.distance ?? 40

  const fromVars: gsap.TweenVars = { alpha: 0 }
  if (direction === 'left') fromVars.x = -distance
  else if (direction === 'right') fromVars.x = distance
  else if (direction === 'top') fromVars.y = -distance
  else fromVars.y = distance // direction === 'bottom'

  return gsap.from(targets, {
    ...fromVars,
    duration: options.duration ?? 0.4,
    ease: options.ease ?? Easing.smoothOut,
    stagger: staggerTime,
  })
}

// ============================================
// TIMELINE HELPERS
// ============================================

/**
 * Create a new GSAP timeline
 */
export function createTimeline(
  options: gsap.TimelineVars = {}
): gsap.core.Timeline {
  return gsap.timeline(options)
}

/**
 * Create a sequence of animations
 */
export function sequence(
  animations: Array<{
    target: AnimationTarget | AnimationTarget[]
    vars: gsap.TweenVars
    position?: string | number
  }>,
  options: gsap.TimelineVars = {}
): gsap.core.Timeline {
  const tl = gsap.timeline(options)

  animations.forEach(({ target, vars, position }) => {
    tl.to(target, vars, position)
  })

  return tl
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Kill all tweens on a target
 */
export function killTweens(target: AnimationTarget | AnimationTarget[]): void {
  gsap.killTweensOf(target)
}

/**
 * Pause all GSAP animations
 */
export function pauseAll(): void {
  gsap.globalTimeline.pause()
}

/**
 * Resume all GSAP animations
 */
export function resumeAll(): void {
  gsap.globalTimeline.resume()
}

/**
 * Get the GSAP instance for advanced usage
 */
export function getGsap(): typeof gsap {
  return gsap
}

// ============================================
// GAME-SPECIFIC ANIMATIONS
// ============================================

/**
 * Celebration animation - scale + rotate + particles feeling
 */
export function celebrate(
  target: AnimationTarget,
  options: { duration?: number; rotations?: number } = {}
): gsap.core.Timeline {
  const duration = options.duration ?? 1
  const rotations = options.rotations ?? 0.1

  const tl = gsap.timeline()

  tl.to(target, {
    scaleX: 1.3,
    scaleY: 1.3,
    rotation: Math.PI * 2 * rotations,
    duration: duration * 0.3,
    ease: Easing.back,
  })
    .to(target, {
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      duration: duration * 0.7,
      ease: Easing.elastic,
    })

  return tl
}

/**
 * Impact animation - quick scale punch for hit feedback
 */
export function impact(
  target: AnimationTarget,
  options: { scale?: number; duration?: number } = {}
): gsap.core.Tween {
  const scale = options.scale ?? 1.15
  const duration = options.duration ?? 0.1

  return gsap.to(target, {
    scaleX: scale,
    scaleY: scale,
    duration,
    ease: 'power2.out',
    yoyo: true,
    repeat: 1,
  })
}

/**
 * Spin animation - continuous rotation
 */
export function spin(
  target: AnimationTarget,
  duration: number = 1,
  options: { clockwise?: boolean; repeat?: number } = {}
): gsap.core.Tween {
  const direction = options.clockwise === false ? -1 : 1

  return gsap.to(target, {
    rotation: `+=${Math.PI * 2 * direction}`,
    duration,
    ease: 'none',
    repeat: options.repeat ?? -1,
  })
}

/**
 * Typewriter reveal - for text elements
 */
export function typewriter(
  textObj: Phaser.GameObjects.Text,
  finalText: string,
  duration: number = 1,
  options: { onComplete?: () => void } = {}
): gsap.core.Tween {
  const obj = { progress: 0 }

  return gsap.to(obj, {
    progress: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      const charCount = Math.floor(obj.progress * finalText.length)
      textObj.setText(finalText.substring(0, charCount))
    },
    onComplete: options.onComplete,
  })
}
