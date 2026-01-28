/**
 * Random and weighted random selection utilities
 *
 * Includes:
 * - Basic random helpers
 * - Weighted random selection
 * - PhraseManager for session-aware phrase selection
 */

import { ALL_CATEGORIES, type CategoryType } from '../data/categories'
import { PHRASES } from '../data/phrases'
import type { Phrase, PhraseSelection } from '../data/types'

// ============================================
// BASIC RANDOM HELPERS
// ============================================

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Select a random element from an array
 */
export function randomElement<T>(array: readonly T[]): T | undefined {
  if (array.length === 0) {
    return undefined
  }
  const index = Math.floor(Math.random() * array.length)
  return array[index]
}

/**
 * Shuffle an array in place using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    const swapElement = array[j]
    if (temp !== undefined && swapElement !== undefined) {
      array[i] = swapElement
      array[j] = temp
    }
  }
  return array
}

/**
 * Create a shuffled copy of an array (does not mutate original)
 */
export function shuffled<T>(array: readonly T[]): T[] {
  return shuffleArray([...array])
}

// ============================================
// WEIGHTED RANDOM SELECTION
// ============================================

/**
 * Item with an associated weight for weighted random selection
 */
export interface WeightedItem<T> {
  item: T
  weight: number
}

/**
 * Select a random item based on weights
 * Higher weights = higher probability of selection
 *
 * @param items Array of items with weights
 * @returns The selected item, or undefined if array is empty
 */
export function weightedRandom<T>(items: readonly WeightedItem<T>[]): T | undefined {
  if (items.length === 0) {
    return undefined
  }

  // Calculate total weight
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)

  if (totalWeight <= 0) {
    // Fall back to uniform random if all weights are 0 or negative
    return randomElement(items.map((i) => i.item))
  }

  // Generate random value in [0, totalWeight)
  let random = Math.random() * totalWeight

  // Find the item at this random point
  for (const { item, weight } of items) {
    random -= weight
    if (random <= 0) {
      return item
    }
  }

  // Fallback (should not reach here due to floating point)
  return items[items.length - 1]?.item
}

/**
 * Select multiple unique items based on weights
 * Items are removed from the pool after selection (no repeats)
 */
export function weightedRandomMultiple<T>(
  items: readonly WeightedItem<T>[],
  count: number
): T[] {
  const result: T[] = []
  const remaining = [...items]

  const selectCount = Math.min(count, remaining.length)

  for (let i = 0; i < selectCount; i++) {
    const selected = weightedRandom(remaining)
    if (selected !== undefined) {
      result.push(selected)
      // Remove selected item from remaining
      const selectedIndex = remaining.findIndex((item) => item.item === selected)
      if (selectedIndex !== -1) {
        remaining.splice(selectedIndex, 1)
      }
    }
  }

  return result
}

// ============================================
// PHRASE MANAGER
// ============================================

/**
 * PhraseManager handles phrase selection with session awareness
 *
 * Features:
 * - No repeats within a session
 * - Optional category filtering
 * - Optional weighted selection by category
 * - Automatic reset when all phrases exhausted
 */
export class PhraseManager {
  /** Set of phrase indices that have been used this session */
  private usedPhraseIndices: Set<number> = new Set()

  /** Optional category weights for weighted selection */
  private categoryWeights: Map<CategoryType, number> = new Map()

  /** Whether to use weighted category selection */
  private useWeightedCategories: boolean = false

  constructor() {
    // Initialize with equal weights for all categories
    this.resetCategoryWeights()
  }

  /**
   * Get a random phrase that hasn't been used this session
   *
   * @param category Optional category to filter by
   * @returns PhraseSelection with the phrase and its index
   */
  public getRandomPhrase(category?: CategoryType): PhraseSelection | null {
    // Get available phrases (not yet used)
    const availablePhrases = this.getAvailablePhrases(category)

    if (availablePhrases.length === 0) {
      // All phrases exhausted, reset and try again
      if (this.usedPhraseIndices.size > 0) {
        this.resetSession()
        return this.getRandomPhrase(category)
      }
      // No phrases available at all
      return null
    }

    // Select based on weights or uniform random
    let selection: PhraseSelection | undefined

    if (this.useWeightedCategories && !category) {
      // Weighted selection by category
      const weightedPhrases = availablePhrases.map((p) => ({
        item: p,
        weight: this.categoryWeights.get(p.phrase.category) ?? 1,
      }))
      selection = weightedRandom(weightedPhrases)
    } else {
      // Uniform random selection
      selection = randomElement(availablePhrases)
    }

    if (selection) {
      // Mark as used
      this.usedPhraseIndices.add(selection.index)
      return selection
    }

    return null
  }

  /**
   * Get available phrases that haven't been used
   */
  private getAvailablePhrases(category?: CategoryType): PhraseSelection[] {
    const result: PhraseSelection[] = []

    for (let i = 0; i < PHRASES.length; i++) {
      if (this.usedPhraseIndices.has(i)) {
        continue
      }

      const phrase = PHRASES[i]
      if (!phrase) continue

      if (category && phrase.category !== category) {
        continue
      }

      result.push({ index: i, phrase })
    }

    return result
  }

  /**
   * Reset the session (allow all phrases again)
   */
  public resetSession(): void {
    this.usedPhraseIndices.clear()
  }

  /**
   * Get count of used phrases this session
   */
  public getUsedCount(): number {
    return this.usedPhraseIndices.size
  }

  /**
   * Get count of remaining available phrases
   */
  public getRemainingCount(category?: CategoryType): number {
    return this.getAvailablePhrases(category).length
  }

  /**
   * Get total phrase count
   */
  public getTotalCount(): number {
    return PHRASES.length
  }

  /**
   * Check if all phrases have been used
   */
  public isExhausted(): boolean {
    return this.usedPhraseIndices.size >= PHRASES.length
  }

  /**
   * Set category weights for weighted selection
   * Higher weight = more likely to be selected
   */
  public setCategoryWeights(weights: Map<CategoryType, number>): void {
    this.categoryWeights = new Map(weights)
    this.useWeightedCategories = true
  }

  /**
   * Reset category weights to uniform
   */
  public resetCategoryWeights(): void {
    this.categoryWeights.clear()
    for (const category of ALL_CATEGORIES) {
      this.categoryWeights.set(category, 1)
    }
    this.useWeightedCategories = false
  }

  /**
   * Enable or disable weighted category selection
   */
  public setUseWeightedCategories(enabled: boolean): void {
    this.useWeightedCategories = enabled
  }

  /**
   * Mark a specific phrase as used (useful for external tracking)
   */
  public markPhraseUsed(index: number): void {
    if (index >= 0 && index < PHRASES.length) {
      this.usedPhraseIndices.add(index)
    }
  }

  /**
   * Get a specific phrase by index
   */
  public getPhraseByIndex(index: number): Phrase | null {
    return PHRASES[index] ?? null
  }

  /**
   * Get all phrases (for debugging/display)
   */
  public getAllPhrases(): readonly Phrase[] {
    return PHRASES
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

/**
 * Global phrase manager instance
 * Use this for game-wide phrase selection
 */
let globalPhraseManager: PhraseManager | null = null

/**
 * Get the global PhraseManager instance
 * Creates one if it doesn't exist
 */
export function getPhraseManager(): PhraseManager {
  globalPhraseManager ??= new PhraseManager()
  return globalPhraseManager
}

/**
 * Reset the global PhraseManager
 * Call this when starting a new game session
 */
export function resetPhraseManager(): void {
  if (globalPhraseManager) {
    globalPhraseManager.resetSession()
  } else {
    globalPhraseManager = new PhraseManager()
  }
}
