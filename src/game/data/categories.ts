/**
 * Category definitions for Vowel Movement
 *
 * Each category represents a thematic grouping of phrases.
 * Categories are displayed above the phrase board during gameplay.
 */

/**
 * All available phrase categories
 * These are the adult/irreverent categories that make the game fun
 */
export const Category = {
  /** Intimate exclamations that would make grandma blush */
  THINGS_YOU_SHOUT_DURING_SEX: 'Things You Shout During Sex',

  /** Headlines only the Sunshine State could produce */
  FLORIDA_MAN_HEADLINES: 'Florida Man Headlines',

  /** Advice you should absolutely never follow */
  HORRIBLE_LIFE_ADVICE: 'Horrible Life Advice',

  /** Passive-aggressive gems from the in-laws */
  THINGS_YOUR_MOTHER_IN_LAW_SAYS: 'Things Your Mother-in-Law Says',

  /** Medical issues you hope nobody finds out about */
  EMBARRASSING_MEDICAL_CONDITIONS: 'Embarrassing Medical Conditions',

  /** What people say after too many drinks */
  DRUNKEN_CONFESSIONS: 'Drunken Confessions',

  /** Ink decisions you will regret forever */
  REGRETTABLE_TATTOO_IDEAS: 'Regrettable Tattoo Ideas',

  /** Horrors discovered in the blue box */
  THINGS_FOUND_IN_A_PORTA_POTTY: 'Things Found in a Porta-Potty',

  /** Why you missed the meeting again */
  BAD_EXCUSES_FOR_BEING_LATE: 'Bad Excuses for Being Late',

  /** Innocent phrases with unfortunate implications */
  PHRASES_THAT_SOUND_DIRTY: "Phrases That Sound Dirty But Aren't",
} as const

/**
 * Category type derived from the Category object values
 */
export type CategoryType = (typeof Category)[keyof typeof Category]

/**
 * Array of all category values for iteration
 */
export const ALL_CATEGORIES: CategoryType[] = Object.values(Category)

/**
 * Get the display name for a category
 * (Currently just returns the category value, but allows for future i18n)
 */
export function getCategoryDisplayName(category: CategoryType): string {
  return category
}

/**
 * Category metadata for extended functionality
 */
export interface CategoryInfo {
  /** The category identifier */
  category: CategoryType
  /** Short description of the category */
  description: string
  /** Color hint for UI theming (optional) */
  colorHint?: string
}

/**
 * Extended category information for UI display
 */
export const CATEGORY_INFO: Record<CategoryType, CategoryInfo> = {
  [Category.THINGS_YOU_SHOUT_DURING_SEX]: {
    category: Category.THINGS_YOU_SHOUT_DURING_SEX,
    description: 'Intimate exclamations',
    colorHint: '#FF69B4', // Hot pink
  },
  [Category.FLORIDA_MAN_HEADLINES]: {
    category: Category.FLORIDA_MAN_HEADLINES,
    description: 'Only in Florida',
    colorHint: '#FF8C00', // Orange
  },
  [Category.HORRIBLE_LIFE_ADVICE]: {
    category: Category.HORRIBLE_LIFE_ADVICE,
    description: 'Do not follow',
    colorHint: '#8B0000', // Dark red
  },
  [Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS]: {
    category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS,
    description: 'Passive-aggressive classics',
    colorHint: '#4B0082', // Indigo
  },
  [Category.EMBARRASSING_MEDICAL_CONDITIONS]: {
    category: Category.EMBARRASSING_MEDICAL_CONDITIONS,
    description: 'WebMD nightmares',
    colorHint: '#006400', // Dark green
  },
  [Category.DRUNKEN_CONFESSIONS]: {
    category: Category.DRUNKEN_CONFESSIONS,
    description: 'Last call regrets',
    colorHint: '#DAA520', // Goldenrod
  },
  [Category.REGRETTABLE_TATTOO_IDEAS]: {
    category: Category.REGRETTABLE_TATTOO_IDEAS,
    description: 'Forever mistakes',
    colorHint: '#2F4F4F', // Dark slate gray
  },
  [Category.THINGS_FOUND_IN_A_PORTA_POTTY]: {
    category: Category.THINGS_FOUND_IN_A_PORTA_POTTY,
    description: 'Festival horrors',
    colorHint: '#8B4513', // Saddle brown
  },
  [Category.BAD_EXCUSES_FOR_BEING_LATE]: {
    category: Category.BAD_EXCUSES_FOR_BEING_LATE,
    description: 'HR violations',
    colorHint: '#4169E1', // Royal blue
  },
  [Category.PHRASES_THAT_SOUND_DIRTY]: {
    category: Category.PHRASES_THAT_SOUND_DIRTY,
    description: 'Mind out of gutter',
    colorHint: '#9932CC', // Dark orchid
  },
}
