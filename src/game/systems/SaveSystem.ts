/**
 * SaveSystem - High score and settings persistence via localStorage
 *
 * Centralizes all localStorage access for the game:
 * - High score save/load
 * - Settings persistence (mute state)
 * - Games played counter
 * - Graceful fallback when localStorage is unavailable
 *
 * Uses a singleton pattern so all systems access the same data.
 */

/** localStorage key prefix to namespace game data */
const STORAGE_PREFIX = 'vowelMovement_'

/** Individual storage keys */
const KEYS = {
  gamesPlayed: `${STORAGE_PREFIX}gamesPlayed`,
  highScore: `${STORAGE_PREFIX}highScore`,
  muted: `${STORAGE_PREFIX}muted`,
  totalScore: `${STORAGE_PREFIX}totalScore`,
} as const

/**
 * Shape of persisted save data
 */
export interface SaveData {
  /** All-time high score */
  highScore: number
  /** Total games played */
  gamesPlayed: number
  /** Cumulative score across all games */
  totalScore: number
  /** Whether audio is muted */
  muted: boolean
}

/**
 * SaveSystem singleton class
 */
export class SaveSystem {
  private static instance: SaveSystem | null = null

  /** Whether localStorage is available */
  private storageAvailable: boolean

  /** Cached save data */
  private data: SaveData

  private constructor() {
    this.storageAvailable = SaveSystem.checkStorageAvailable()
    this.data = this.loadAll()
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SaveSystem {
    SaveSystem.instance ??= new SaveSystem()
    return SaveSystem.instance
  }

  /**
   * Check if localStorage is available and writable
   */
  private static checkStorageAvailable(): boolean {
    try {
      const testKey = `${STORAGE_PREFIX}__test__`
      localStorage.setItem(testKey, '1')
      localStorage.removeItem(testKey)
      return true
    } catch {
      return false
    }
  }

  // ============================================
  // HIGH SCORE
  // ============================================

  /**
   * Get the current high score
   */
  public getHighScore(): number {
    return this.data.highScore
  }

  /**
   * Check if a score beats the current high score
   */
  public isHighScore(score: number): boolean {
    return score > this.data.highScore && score > 0
  }

  /**
   * Save a new high score (only if it beats current)
   * Returns true if a new high score was set
   */
  public saveHighScore(score: number): boolean {
    if (score <= this.data.highScore) return false

    this.data.highScore = score
    this.writeValue(KEYS.highScore, score.toString())

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[SaveSystem] New high score: ${score}`)
    }

    return true
  }

  // ============================================
  // SETTINGS
  // ============================================

  /**
   * Get muted state
   */
  public getMuted(): boolean {
    return this.data.muted
  }

  /**
   * Save muted state
   */
  public setMuted(muted: boolean): void {
    this.data.muted = muted
    this.writeValue(KEYS.muted, muted ? '1' : '0')
  }

  // ============================================
  // STATS
  // ============================================

  /**
   * Get total games played
   */
  public getGamesPlayed(): number {
    return this.data.gamesPlayed
  }

  /**
   * Increment games played counter
   */
  public recordGamePlayed(): void {
    this.data.gamesPlayed++
    this.writeValue(KEYS.gamesPlayed, this.data.gamesPlayed.toString())
  }

  /**
   * Get total cumulative score
   */
  public getTotalScore(): number {
    return this.data.totalScore
  }

  /**
   * Add to the total cumulative score
   */
  public addToTotalScore(score: number): void {
    if (score <= 0) return
    this.data.totalScore += score
    this.writeValue(KEYS.totalScore, this.data.totalScore.toString())
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Get all save data
   */
  public getAllData(): Readonly<SaveData> {
    return { ...this.data }
  }

  /**
   * Clear all saved data (factory reset)
   */
  public clearAll(): void {
    this.data = {
      gamesPlayed: 0,
      highScore: 0,
      muted: false,
      totalScore: 0,
    }

    if (!this.storageAvailable) return

    try {
      for (const key of Object.values(KEYS)) {
        localStorage.removeItem(key)
      }
    } catch {
      // Ignore errors on clear
    }

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[SaveSystem] All data cleared')
    }
  }

  // ============================================
  // INTERNAL I/O
  // ============================================

  /**
   * Load all data from localStorage
   */
  private loadAll(): SaveData {
    return {
      gamesPlayed: this.readInt(KEYS.gamesPlayed, 0),
      highScore: this.readInt(KEYS.highScore, 0),
      muted: this.readBool(KEYS.muted, false),
      totalScore: this.readInt(KEYS.totalScore, 0),
    }
  }

  /**
   * Read an integer value from localStorage
   */
  private readInt(key: string, fallback: number): number {
    if (!this.storageAvailable) return fallback

    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      const parsed = parseInt(raw, 10)
      return isNaN(parsed) ? fallback : parsed
    } catch {
      return fallback
    }
  }

  /**
   * Read a boolean value from localStorage
   */
  private readBool(key: string, fallback: boolean): boolean {
    if (!this.storageAvailable) return fallback

    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return raw === '1'
    } catch {
      return fallback
    }
  }

  /**
   * Write a value to localStorage
   */
  private writeValue(key: string, value: string): void {
    if (!this.storageAvailable) return

    try {
      localStorage.setItem(key, value)
    } catch {
      // Storage full or blocked - degrade gracefully
    }
  }
}

/**
 * Get the global SaveSystem instance
 */
export function getSaveSystem(): SaveSystem {
  return SaveSystem.getInstance()
}
