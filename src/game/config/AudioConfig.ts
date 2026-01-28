/**
 * AudioConfig - Sound parameters for procedural audio generation
 *
 * All sounds are generated using Web Audio API oscillators.
 * No audio files needed - pure procedural synthesis.
 */

/**
 * Oscillator types for different sound characteristics
 */
export type OscillatorType = 'sine' | 'square' | 'sawtooth' | 'triangle'

/**
 * ADSR envelope configuration
 */
export interface EnvelopeConfig {
  /** Attack time in seconds */
  attack: number
  /** Decay time in seconds */
  decay: number
  /** Sustain level (0-1) */
  sustain: number
  /** Release time in seconds */
  release: number
}

/**
 * Sound configuration for a single procedural sound
 */
export interface SoundConfig {
  /** Base frequency in Hz */
  frequency: number
  /** Oscillator type */
  type: OscillatorType
  /** Volume (0-1) */
  volume: number
  /** Duration in seconds */
  duration: number
  /** ADSR envelope */
  envelope: EnvelopeConfig
  /** Optional frequency modulation */
  frequencyRamp?: {
    /** End frequency in Hz */
    endFrequency: number
    /** Ramp type */
    type: 'linear' | 'exponential'
  }
}

/**
 * Note configuration for arpeggio sequences
 */
export interface NoteConfig {
  /** Frequency in Hz */
  frequency: number
  /** Duration in seconds */
  duration: number
}

/**
 * Arpeggio configuration
 */
export interface ArpeggioConfig {
  /** Notes to play in sequence */
  notes: NoteConfig[]
  /** Oscillator type */
  type: OscillatorType
  /** Volume (0-1) */
  volume: number
  /** Envelope for each note */
  envelope: EnvelopeConfig
  /** Gap between notes in seconds */
  gap: number
}

// ============================================
// AUDIO CONFIGURATIONS
// ============================================

/**
 * Master volume control
 */
export const MASTER_VOLUME = 0.4

/**
 * Wheel tick sound - short click that varies with speed
 */
export const WHEEL_TICK_CONFIG: SoundConfig = {
  duration: 0.02,
  envelope: {
    attack: 0.001,
    decay: 0.01,
    release: 0.01,
    sustain: 0.3,
  },
  frequency: 800,
  type: 'square',
  volume: 0.25,
}

/**
 * Letter reveal sound - pleasant blip
 */
export const LETTER_REVEAL_CONFIG: SoundConfig = {
  duration: 0.08,
  envelope: {
    attack: 0.005,
    decay: 0.03,
    release: 0.04,
    sustain: 0.4,
  },
  frequency: 523.25, // C5
  type: 'sine',
  volume: 0.3,
}

/**
 * Correct guess sound - ascending 3-note arpeggio (C-E-G)
 */
export const CORRECT_GUESS_CONFIG: ArpeggioConfig = {
  envelope: {
    attack: 0.01,
    decay: 0.05,
    release: 0.08,
    sustain: 0.5,
  },
  gap: 0.02,
  notes: [
    { duration: 0.1, frequency: 523.25 }, // C5
    { duration: 0.1, frequency: 659.25 }, // E5
    { duration: 0.15, frequency: 783.99 }, // G5
  ],
  type: 'triangle',
  volume: 0.3,
}

/**
 * Wrong guess sound - descending buzz
 */
export const WRONG_GUESS_CONFIG: SoundConfig = {
  duration: 0.2,
  envelope: {
    attack: 0.01,
    decay: 0.05,
    release: 0.1,
    sustain: 0.6,
  },
  frequency: 200,
  frequencyRamp: {
    endFrequency: 100,
    type: 'exponential',
  },
  type: 'sawtooth',
  volume: 0.25,
}

/**
 * Win fanfare - celebratory arpeggio
 */
export const WIN_FANFARE_CONFIG: ArpeggioConfig = {
  envelope: {
    attack: 0.01,
    decay: 0.08,
    release: 0.15,
    sustain: 0.5,
  },
  gap: 0.03,
  notes: [
    { duration: 0.12, frequency: 523.25 }, // C5
    { duration: 0.12, frequency: 659.25 }, // E5
    { duration: 0.12, frequency: 783.99 }, // G5
    { duration: 0.2, frequency: 1046.5 }, // C6
    { duration: 0.12, frequency: 783.99 }, // G5
    { duration: 0.3, frequency: 1046.5 }, // C6 (held)
  ],
  type: 'triangle',
  volume: 0.35,
}

/**
 * Bankrupt sound - dramatic low rumble + descending tone
 */
export const BANKRUPT_CONFIG = {
  rumble: {
    duration: 0.6,
    envelope: {
      attack: 0.02,
      decay: 0.2,
      release: 0.3,
      sustain: 0.5,
    },
    frequency: 60,
    type: 'sawtooth' as OscillatorType,
    volume: 0.35,
  },
  sweep: {
    duration: 0.5,
    envelope: {
      attack: 0.01,
      decay: 0.1,
      release: 0.3,
      sustain: 0.4,
    },
    frequency: 400,
    frequencyRamp: {
      endFrequency: 50,
      type: 'exponential' as const,
    },
    type: 'square' as OscillatorType,
    volume: 0.3,
  },
}

/**
 * UI click sound - soft blip
 */
export const UI_CLICK_CONFIG: SoundConfig = {
  duration: 0.04,
  envelope: {
    attack: 0.002,
    decay: 0.02,
    release: 0.02,
    sustain: 0.3,
  },
  frequency: 600,
  type: 'sine',
  volume: 0.2,
}

/**
 * Vowel purchase sound - coin-like chime
 */
export const VOWEL_PURCHASE_CONFIG: ArpeggioConfig = {
  envelope: {
    attack: 0.005,
    decay: 0.05,
    release: 0.1,
    sustain: 0.3,
  },
  gap: 0.01,
  notes: [
    { duration: 0.08, frequency: 880 }, // A5
    { duration: 0.12, frequency: 1100 }, // ~C#6
  ],
  type: 'sine',
  volume: 0.25,
}

/**
 * Lose turn sound - short descending tone
 */
export const LOSE_TURN_CONFIG: SoundConfig = {
  duration: 0.3,
  envelope: {
    attack: 0.01,
    decay: 0.1,
    release: 0.15,
    sustain: 0.3,
  },
  frequency: 300,
  frequencyRamp: {
    endFrequency: 150,
    type: 'exponential',
  },
  type: 'triangle',
  volume: 0.25,
}

/**
 * Free spin sound - happy ascending tones
 */
export const FREE_SPIN_CONFIG: ArpeggioConfig = {
  envelope: {
    attack: 0.01,
    decay: 0.05,
    release: 0.08,
    sustain: 0.4,
  },
  gap: 0.02,
  notes: [
    { duration: 0.1, frequency: 659.25 }, // E5
    { duration: 0.1, frequency: 783.99 }, // G5
    { duration: 0.15, frequency: 987.77 }, // B5
  ],
  type: 'sine',
  volume: 0.3,
}
