/**
 * AudioSystem - Procedural audio generation using Web Audio API
 *
 * Generates all game sounds procedurally without audio files.
 * Uses oscillators, gain nodes, and frequency scheduling.
 *
 * IMPORTANT: AudioContext must be created after user interaction
 * (browser requirement for autoplay policy).
 */

import {
  type ArpeggioConfig,
  BANKRUPT_CONFIG,
  CORRECT_GUESS_CONFIG,
  type EnvelopeConfig,
  FREE_SPIN_CONFIG,
  LETTER_REVEAL_CONFIG,
  LOSE_TURN_CONFIG,
  MASTER_VOLUME,
  type OscillatorType,
  type SoundConfig,
  UI_CLICK_CONFIG,
  VOWEL_PURCHASE_CONFIG,
  WHEEL_TICK_CONFIG,
  WIN_FANFARE_CONFIG,
  WRONG_GUESS_CONFIG,
} from '../config/AudioConfig'

const devLog = (message: string): void => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(message)
  }
}

/**
 * AudioSystem singleton for procedural sound generation
 */
export class AudioSystem {
  private static instance: AudioSystem | null = null
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isInitialized = false
  private isMuted = false

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AudioSystem {
    AudioSystem.instance ??= new AudioSystem()
    return AudioSystem.instance
  }

  /**
   * Initialize the audio context (must be called after user interaction)
   */
  public initialize(): boolean {
    if (this.isInitialized) return true

    try {
      this.audioContext = new AudioContext()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = MASTER_VOLUME
      this.masterGain.connect(this.audioContext.destination)
      this.isInitialized = true

      devLog('[AudioSystem] Initialized successfully')

      return true
    } catch {
      // Audio initialization can fail in some browser contexts
      return false
    }
  }

  /**
   * Resume audio context (needed after browser suspends it)
   */
  public async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  /**
   * Set muted state
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : MASTER_VOLUME
    }
  }

  /**
   * Get muted state
   */
  public getMuted(): boolean {
    return this.isMuted
  }

  /**
   * Set master volume (0-1)
   */
  public setVolume(volume: number): void {
    if (this.masterGain && !this.isMuted) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }

  // ============================================
  // SOUND EFFECTS
  // ============================================

  /**
   * Play wheel tick sound
   * @param speedFactor Speed factor (0-1) affects pitch
   */
  public playWheelTick(speedFactor: number = 1): void {
    if (!this.isReady()) return

    // Higher pitch when spinning faster
    const pitchMultiplier = 0.8 + speedFactor * 0.4
    const config = {
      ...WHEEL_TICK_CONFIG,
      frequency: WHEEL_TICK_CONFIG.frequency * pitchMultiplier,
    }

    this.playSound(config)
  }

  /**
   * Play letter reveal sound
   * @param tileIndex Tile position (affects pitch for musical variation)
   */
  public playLetterReveal(tileIndex: number = 0): void {
    if (!this.isReady()) return

    // Vary pitch based on tile position for musical effect
    const basePitch = 0.8 + (tileIndex % 8) * 0.1
    const config = {
      ...LETTER_REVEAL_CONFIG,
      frequency: LETTER_REVEAL_CONFIG.frequency * basePitch,
    }

    this.playSound(config)
  }

  /**
   * Play correct guess sound (ascending arpeggio)
   */
  public playCorrectGuess(): void {
    if (!this.isReady()) return
    this.playArpeggio(CORRECT_GUESS_CONFIG)
  }

  /**
   * Play wrong guess sound
   */
  public playWrongGuess(): void {
    if (!this.isReady()) return
    this.playSound(WRONG_GUESS_CONFIG)
  }

  /**
   * Play win fanfare
   */
  public playWinFanfare(): void {
    if (!this.isReady()) return
    this.playArpeggio(WIN_FANFARE_CONFIG)
  }

  /**
   * Play bankrupt sound (rumble + sweep)
   */
  public playBankrupt(): void {
    if (!this.isReady()) return

    // Play rumble
    this.playSound(BANKRUPT_CONFIG.rumble)

    // Play sweep slightly delayed
    setTimeout(() => {
      this.playSound(BANKRUPT_CONFIG.sweep)
    }, 50)
  }

  /**
   * Play UI click sound
   */
  public playUIClick(): void {
    if (!this.isReady()) return
    this.playSound(UI_CLICK_CONFIG)
  }

  /**
   * Play vowel purchase sound
   */
  public playVowelPurchase(): void {
    if (!this.isReady()) return
    this.playArpeggio(VOWEL_PURCHASE_CONFIG)
  }

  /**
   * Play lose turn sound
   */
  public playLoseTurn(): void {
    if (!this.isReady()) return
    this.playSound(LOSE_TURN_CONFIG)
  }

  /**
   * Play free spin sound
   */
  public playFreeSpin(): void {
    if (!this.isReady()) return
    this.playArpeggio(FREE_SPIN_CONFIG)
  }

  // ============================================
  // CORE AUDIO GENERATION
  // ============================================

  /**
   * Check if audio system is ready
   */
  private isReady(): boolean {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      return false
    }

    // Resume if suspended
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        // Ignore resume errors
      })
    }

    return true
  }

  /**
   * Play a single sound with configuration
   */
  private playSound(config: SoundConfig): void {
    if (!this.audioContext || !this.masterGain) return

    const ctx = this.audioContext
    const now = ctx.currentTime

    // Create oscillator
    const oscillator = ctx.createOscillator()
    oscillator.type = config.type
    oscillator.frequency.setValueAtTime(config.frequency, now)

    // Apply frequency ramp if configured
    if (config.frequencyRamp) {
      const endTime = now + config.duration
      if (config.frequencyRamp.type === 'exponential') {
        oscillator.frequency.exponentialRampToValueAtTime(
          config.frequencyRamp.endFrequency,
          endTime
        )
      } else {
        oscillator.frequency.linearRampToValueAtTime(
          config.frequencyRamp.endFrequency,
          endTime
        )
      }
    }

    // Create gain node for envelope
    const gainNode = ctx.createGain()
    this.applyEnvelope(gainNode, config.envelope, config.volume, now, config.duration)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    // Start and stop
    oscillator.start(now)
    oscillator.stop(now + config.duration + config.envelope.release)

    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  /**
   * Play an arpeggio (sequence of notes)
   */
  private playArpeggio(config: ArpeggioConfig): void {
    if (!this.audioContext || !this.masterGain) return

    const ctx = this.audioContext
    let currentTime = ctx.currentTime

    for (const note of config.notes) {
      this.playNoteAt(
        currentTime,
        note.frequency,
        note.duration,
        config.type,
        config.volume,
        config.envelope
      )

      currentTime += note.duration + config.gap
    }
  }

  /**
   * Play a single note at a specific time
   */
  private playNoteAt(
    startTime: number,
    frequency: number,
    duration: number,
    type: OscillatorType,
    volume: number,
    envelope: EnvelopeConfig
  ): void {
    if (!this.audioContext || !this.masterGain) return

    const ctx = this.audioContext

    // Create oscillator
    const oscillator = ctx.createOscillator()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, startTime)

    // Create gain node for envelope
    const gainNode = ctx.createGain()
    this.applyEnvelope(gainNode, envelope, volume, startTime, duration)

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    // Start and stop
    oscillator.start(startTime)
    oscillator.stop(startTime + duration + envelope.release)

    // Clean up
    oscillator.onended = () => {
      oscillator.disconnect()
      gainNode.disconnect()
    }
  }

  /**
   * Apply ADSR envelope to gain node
   */
  private applyEnvelope(
    gainNode: GainNode,
    envelope: EnvelopeConfig,
    volume: number,
    startTime: number,
    duration: number
  ): void {
    const { attack, decay, sustain, release } = envelope
    const sustainLevel = volume * sustain

    // Start at zero
    gainNode.gain.setValueAtTime(0, startTime)

    // Attack: ramp to full volume
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attack)

    // Decay: ramp to sustain level
    gainNode.gain.linearRampToValueAtTime(sustainLevel, startTime + attack + decay)

    // Sustain: hold until duration
    gainNode.gain.setValueAtTime(sustainLevel, startTime + duration)

    // Release: fade to zero
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration + release)
  }

  /**
   * Clean up audio context
   */
  public destroy(): void {
    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore close errors
      })
      this.audioContext = null
      this.masterGain = null
      this.isInitialized = false
    }
  }
}

/**
 * Get the global audio system instance
 */
export function getAudioSystem(): AudioSystem {
  return AudioSystem.getInstance()
}
