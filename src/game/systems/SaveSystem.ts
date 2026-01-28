/**
 * SaveSystem - Comprehensive game persistence via localStorage
 *
 * Centralizes all localStorage access for the game:
 * - High score save/load
 * - Settings persistence (mute state)
 * - Games played counter
 * - Game history (last 15 games)
 * - Detailed statistics
 * - Achievements tracking
 * - Graceful fallback when localStorage is unavailable
 *
 * Uses a singleton pattern so all systems access the same data.
 */

/** localStorage key prefix to namespace game data */
const STORAGE_PREFIX = 'vowelMovement_'

/** Maximum number of game records to keep */
const MAX_GAME_HISTORY = 15

/** Individual storage keys */
const KEYS = {
  achievements: `${STORAGE_PREFIX}achievements`,
  gameHistory: `${STORAGE_PREFIX}gameHistory`,
  gamesPlayed: `${STORAGE_PREFIX}gamesPlayed`,
  highScore: `${STORAGE_PREFIX}highScore`,
  muted: `${STORAGE_PREFIX}muted`,
  stats: `${STORAGE_PREFIX}stats`,
  totalScore: `${STORAGE_PREFIX}totalScore`,
} as const

// ============================================
// TYPES
// ============================================

/**
 * Record of a single game
 */
export interface GameRecord {
  /** ISO date string when game was played */
  date: string
  /** Final score */
  score: number
  /** Number of puzzles solved this game */
  puzzlesSolved: number
  /** Number of puzzles attempted this game */
  puzzlesAttempted: number
  /** Number of bankrupts hit this game */
  bankrupts: number
  /** Number of vowels purchased this game */
  vowelsPurchased: number
  /** Was this a winning game (at least one puzzle solved)? */
  won: boolean
}

/**
 * Detailed game statistics
 */
export interface GameStats {
  /** Total puzzles solved across all games */
  puzzlesSolved: number
  /** Total bankrupts hit */
  totalBankrupts: number
  /** Total vowels purchased */
  vowelsPurchased: number
  /** Biggest score comeback (from lowest to final) */
  biggestComeback: number
  /** Longest win streak */
  longestWinStreak: number
  /** Current win streak */
  currentWinStreak: number
  /** Total consonants guessed correctly */
  consonantsCorrect: number
  /** Total consonants guessed incorrectly */
  consonantsIncorrect: number
  /** Perfect games (no wrong guesses) */
  perfectGames: number
  /** Average score per game */
  averageScore: number
}

/**
 * Achievement definition
 */
export interface Achievement {
  /** Achievement ID */
  id: string
  /** Display name */
  name: string
  /** Description of how to unlock */
  description: string
  /** Icon name from IconNames */
  icon: string
  /** Whether it's unlocked */
  unlocked: boolean
  /** Date unlocked (ISO string) */
  unlockedAt?: string
}

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
  /** Game history (last 15 games) */
  gameHistory: GameRecord[]
  /** Detailed statistics */
  stats: GameStats
  /** Achievements */
  achievements: Achievement[]
}

/**
 * Default stats
 */
const DEFAULT_STATS: GameStats = {
  averageScore: 0,
  biggestComeback: 0,
  consonantsCorrect: 0,
  consonantsIncorrect: 0,
  currentWinStreak: 0,
  longestWinStreak: 0,
  perfectGames: 0,
  puzzlesSolved: 0,
  totalBankrupts: 0,
  vowelsPurchased: 0,
}

/**
 * Achievement definitions
 */
const ACHIEVEMENT_DEFINITIONS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_spin',
    name: 'First Spin',
    description: 'Spin the wheel for the first time',
    icon: 'gamepad',
  },
  {
    id: 'first_solve',
    name: 'Puzzle Master',
    description: 'Solve your first puzzle',
    icon: 'trophy',
  },
  {
    id: 'big_winner',
    name: 'Big Winner',
    description: 'Score $5,000 or more in a single game',
    icon: 'coins',
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Score $10,000 or more in a single game',
    icon: 'crown',
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 3 games in a row',
    icon: 'flame',
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Win after going bankrupt twice in one game',
    icon: 'trendingUp',
  },
  {
    id: 'wordsmith',
    name: 'Wordsmith',
    description: 'Solve 50 puzzles total',
    icon: 'star',
  },
  {
    id: 'bankruptcy_survivor',
    name: 'Bankruptcy Survivor',
    description: 'Win a game after hitting bankrupt',
    icon: 'skull',
  },
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win without any wrong guesses',
    icon: 'zap',
  },
  {
    id: 'vowel_collector',
    name: 'Vowel Collector',
    description: 'Purchase 100 vowels total',
    icon: 'gift',
  },
]

/**
 * SaveSystem singleton class
 */
export class SaveSystem {
  private static instance: SaveSystem | null = null

  /** Whether localStorage is available */
  private storageAvailable: boolean

  /** Cached save data */
  private data: SaveData

  /** Pending achievements to show */
  private pendingAchievements: Achievement[] = []

  private constructor() {
    this.storageAvailable = SaveSystem.checkStorageAvailable()
    this.data = this.loadAll()
    this.migrateAchievements()
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

  /**
   * Migrate achievements - ensure all defined achievements exist
   */
  private migrateAchievements(): void {
    const existingIds = new Set(this.data.achievements.map(a => a.id))

    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (!existingIds.has(def.id)) {
        this.data.achievements.push({
          ...def,
          unlocked: false,
        })
      }
    }

    this.saveAchievements()
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

    // Check achievements
    if (score >= 5000) this.unlockAchievement('big_winner')
    if (score >= 10000) this.unlockAchievement('high_roller')

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
  // BASIC STATS
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

    // First spin achievement
    this.unlockAchievement('first_spin')
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
  // GAME HISTORY
  // ============================================

  /**
   * Get game history (most recent first)
   */
  public getGameHistory(): readonly GameRecord[] {
    return [...this.data.gameHistory]
  }

  /**
   * Add a game record to history
   */
  public addGameRecord(record: Omit<GameRecord, 'date'>): void {
    const fullRecord: GameRecord = {
      ...record,
      date: new Date().toISOString(),
    }

    // Add to beginning (most recent first)
    this.data.gameHistory.unshift(fullRecord)

    // Trim to max size
    if (this.data.gameHistory.length > MAX_GAME_HISTORY) {
      this.data.gameHistory = this.data.gameHistory.slice(0, MAX_GAME_HISTORY)
    }

    this.saveGameHistory()

    // Update stats
    this.updateStatsFromRecord(fullRecord)

    // Check achievements
    this.checkRecordAchievements(fullRecord)
  }

  /**
   * Save game history to localStorage
   */
  private saveGameHistory(): void {
    this.writeValue(KEYS.gameHistory, JSON.stringify(this.data.gameHistory))
  }

  /**
   * Load game history from localStorage
   */
  private loadGameHistory(): GameRecord[] {
    if (!this.storageAvailable) return []

    try {
      const raw = localStorage.getItem(KEYS.gameHistory)
      if (!raw) return []
      const parsed = JSON.parse(raw) as GameRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  // ============================================
  // DETAILED STATS
  // ============================================

  /**
   * Get detailed statistics
   */
  public getStats(): Readonly<GameStats> {
    return { ...this.data.stats }
  }

  /**
   * Update stats from a game record
   */
  private updateStatsFromRecord(record: GameRecord): void {
    const stats = this.data.stats

    // Update totals
    stats.puzzlesSolved += record.puzzlesSolved
    stats.totalBankrupts += record.bankrupts
    stats.vowelsPurchased += record.vowelsPurchased

    // Update win streak
    if (record.won) {
      stats.currentWinStreak++
      if (stats.currentWinStreak > stats.longestWinStreak) {
        stats.longestWinStreak = stats.currentWinStreak
      }
    } else {
      stats.currentWinStreak = 0
    }

    // Update average score
    const history = this.data.gameHistory
    const totalScores = history.reduce((sum, g) => sum + g.score, 0)
    stats.averageScore = history.length > 0 ? Math.round(totalScores / history.length) : 0

    this.saveStats()
  }

  /**
   * Record a consonant guess
   */
  public recordConsonantGuess(correct: boolean): void {
    if (correct) {
      this.data.stats.consonantsCorrect++
    } else {
      this.data.stats.consonantsIncorrect++
    }
    this.saveStats()
  }

  /**
   * Record a comeback (from low score to high)
   */
  public recordComeback(lowestScore: number, finalScore: number): void {
    const comeback = finalScore - lowestScore
    if (comeback > this.data.stats.biggestComeback) {
      this.data.stats.biggestComeback = comeback
      this.saveStats()
    }
  }

  /**
   * Record a perfect game
   */
  public recordPerfectGame(): void {
    this.data.stats.perfectGames++
    this.saveStats()
    this.unlockAchievement('perfect_game')
  }

  /**
   * Save stats to localStorage
   */
  private saveStats(): void {
    this.writeValue(KEYS.stats, JSON.stringify(this.data.stats))
  }

  /**
   * Load stats from localStorage
   */
  private loadStats(): GameStats {
    if (!this.storageAvailable) return { ...DEFAULT_STATS }

    try {
      const raw = localStorage.getItem(KEYS.stats)
      if (!raw) return { ...DEFAULT_STATS }
      const parsed = JSON.parse(raw) as Partial<GameStats>
      return { ...DEFAULT_STATS, ...parsed }
    } catch {
      return { ...DEFAULT_STATS }
    }
  }

  // ============================================
  // ACHIEVEMENTS
  // ============================================

  /**
   * Get all achievements
   */
  public getAchievements(): readonly Achievement[] {
    return [...this.data.achievements]
  }

  /**
   * Get unlocked achievements
   */
  public getUnlockedAchievements(): readonly Achievement[] {
    return this.data.achievements.filter(a => a.unlocked)
  }

  /**
   * Check if an achievement is unlocked
   */
  public isAchievementUnlocked(id: string): boolean {
    return this.data.achievements.some(a => a.id === id && a.unlocked)
  }

  /**
   * Unlock an achievement
   * Returns true if newly unlocked
   */
  public unlockAchievement(id: string): boolean {
    const achievement = this.data.achievements.find(a => a.id === id)
    if (!achievement || achievement.unlocked) return false

    achievement.unlocked = true
    achievement.unlockedAt = new Date().toISOString()
    this.saveAchievements()

    // Add to pending for popup display
    this.pendingAchievements.push(achievement)

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[SaveSystem] Achievement unlocked: ${achievement.name}`)
    }

    return true
  }

  /**
   * Get and clear pending achievements
   */
  public consumePendingAchievements(): Achievement[] {
    const pending = [...this.pendingAchievements]
    this.pendingAchievements = []
    return pending
  }

  /**
   * Check achievements based on a game record
   */
  private checkRecordAchievements(record: GameRecord): void {
    // First solve
    if (record.puzzlesSolved > 0) {
      this.unlockAchievement('first_solve')
    }

    // Wordsmith (50 puzzles)
    if (this.data.stats.puzzlesSolved >= 50) {
      this.unlockAchievement('wordsmith')
    }

    // Vowel collector (100 vowels)
    if (this.data.stats.vowelsPurchased >= 100) {
      this.unlockAchievement('vowel_collector')
    }

    // Bankruptcy survivor (won after bankrupt)
    if (record.won && record.bankrupts > 0) {
      this.unlockAchievement('bankruptcy_survivor')
    }

    // Comeback kid (won after 2+ bankrupts)
    if (record.won && record.bankrupts >= 2) {
      this.unlockAchievement('comeback_kid')
    }

    // Hot streak (3 wins in a row)
    if (this.data.stats.currentWinStreak >= 3) {
      this.unlockAchievement('hot_streak')
    }
  }

  /**
   * Save achievements to localStorage
   */
  private saveAchievements(): void {
    this.writeValue(KEYS.achievements, JSON.stringify(this.data.achievements))
  }

  /**
   * Load achievements from localStorage
   */
  private loadAchievements(): Achievement[] {
    if (!this.storageAvailable) {
      return ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }))
    }

    try {
      const raw = localStorage.getItem(KEYS.achievements)
      if (!raw) {
        return ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }))
      }
      const parsed = JSON.parse(raw) as Achievement[]
      return Array.isArray(parsed) ? parsed : ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }))
    } catch {
      return ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false }))
    }
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
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({ ...def, unlocked: false })),
      gameHistory: [],
      gamesPlayed: 0,
      highScore: 0,
      muted: false,
      stats: { ...DEFAULT_STATS },
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
      achievements: this.loadAchievements(),
      gameHistory: this.loadGameHistory(),
      gamesPlayed: this.readInt(KEYS.gamesPlayed, 0),
      highScore: this.readInt(KEYS.highScore, 0),
      muted: this.readBool(KEYS.muted, false),
      stats: this.loadStats(),
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
