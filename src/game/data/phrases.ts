/**
 * Phrase database for Vowel Movement
 *
 * All phrases are:
 * - UPPERCASE (board displays uppercase)
 * - Max ~52 characters (4 rows x 14 chars with some flexibility)
 * - Adult/vulgar but R-rated, not X-rated
 * - Funny, irreverent, surprising
 *
 * Balanced distribution across all 10 categories
 */

import { Category, type CategoryType } from './categories'
import type { Phrase } from './types'

/**
 * The complete phrase database
 * Minimum 50 phrases, balanced across categories
 */
export const PHRASES: Phrase[] = [
  // ============================================
  // THINGS YOU SHOUT DURING SEX (5 phrases)
  // ============================================
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'EAT ASS LIVE FAST' },
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'NOT MY FIRST RODEO' },
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'WRONG HOLE BUDDY' },
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'IS IT IN YET' },
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'HARDER BETTER FASTER' },

  // ============================================
  // FLORIDA MAN HEADLINES (5 phrases)
  // ============================================
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'FLORIDA MAN WRESTLES GATOR AT WENDYS' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'NAKED MAN STEALS BOAT CLAIMS MERMAID' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'METH GATOR ESCAPES POOL PARTY' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'MAN THROWS GATOR INTO DRIVE THRU' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'BATH SALTS AND BAD DECISIONS' },

  // ============================================
  // HORRIBLE LIFE ADVICE (5 phrases)
  // ============================================
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'YOLO IS A FINANCIAL PLAN' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'SLEEP IS FOR THE WEAK' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'DEBT IS JUST A NUMBER' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'GASLIGHT GATEKEEP GIRLBOSS' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'TRUST YOUR GUT NOT YOUR DOCTOR' },

  // ============================================
  // THINGS YOUR MOTHER-IN-LAW SAYS (5 phrases)
  // ============================================
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'MY SON DESERVES BETTER' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'THATS AN INTERESTING CHOICE' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'YOU LOOK TIRED DEAR' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'I MADE IT BETTER MY WAY' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'WHEN ARE THE GRANDKIDS COMING' },

  // ============================================
  // EMBARRASSING MEDICAL CONDITIONS (5 phrases)
  // ============================================
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'I THOUGHT IT WAS JUST A FART' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'CHRONIC SWAMP ASS' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'INVOLUNTARY MOANING SYNDROME' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'EXPLOSIVE DIARRHEA DELUXE' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'UNCONTROLLABLE GAS EMISSION' },

  // ============================================
  // DRUNKEN CONFESSIONS (5 phrases)
  // ============================================
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'I STILL LOVE MY EX' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'I PEAKED IN HIGH SCHOOL' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'I NEVER READ THE BOOK' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'MY THERAPIST QUIT ON ME' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'I GOOGLED MY SYMPTOMS AGAIN' },

  // ============================================
  // REGRETTABLE TATTOO IDEAS (5 phrases)
  // ============================================
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'NO RAGRETS' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'LIVE LAUGH LEAVE ME ALONE' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'MOM WAS WRONG ABOUT YOU' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'INSERT TRAMP STAMP HERE' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'YOUR NAME ON MY BUTT' },

  // ============================================
  // THINGS FOUND IN A PORTA-POTTY (5 phrases)
  // ============================================
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'SOMEONES DIGNITY' },
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'A USED PREGNANCY TEST' },
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'ABANDONED UNDERWEAR' },
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'REGRET AND SHAME' },
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'MYSTERIOUS BROWN PUDDLE' },

  // ============================================
  // BAD EXCUSES FOR BEING LATE (5 phrases)
  // ============================================
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'MY DOG ATE MY ALARM' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'TRAFFIC WAS LITERALLY ON FIRE' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'I GOT LOST IN MY HOUSE' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'MY CAR IS STILL DRUNK' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'TIME IS A SOCIAL CONSTRUCT' },

  // ============================================
  // PHRASES THAT SOUND DIRTY BUT AREN'T (5 phrases)
  // ============================================
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'I NEED TO BUST A NUT' },
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'CAN I TOUCH YOUR PUSSY' },
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'LET ME FINGER YOUR FOOD' },
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'NICE PAIR OF HOOTERS' },
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'IM COMING IM COMING' },

  // ============================================
  // BONUS PHRASES (10 more for variety)
  // ============================================
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'CALL ME BY MY EXES NAME' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'MAN FIGHTS OFF BEAR WITH FLIP FLOP' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'QUIT YOUR JOB FOLLOW YOUR DREAMS' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'YOUR MOM SAYS HI' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'WEBMD SAYS IM DYING' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'I SHARTED AT WORK TODAY' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'TRIBAL ARMBAND FROM SPRING BREAK' },
  { category: Category.THINGS_FOUND_IN_A_PORTA_POTTY, phrase: 'BROKEN DREAMS AND A SHOE' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'MERCURY IS IN RETROGRADE' },
  { category: Category.PHRASES_THAT_SOUND_DIRTY, phrase: 'THATS A HUGE PECKER' },

  // ============================================
  // EXTRA CLASSICS (10 more from PRD)
  // ============================================
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'SIR THIS IS A WENDYS' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'SEND NUDES' },
  { category: Category.EMBARRASSING_MEDICAL_CONDITIONS, phrase: 'NOT MY PROUDEST FAP' },
  { category: Category.THINGS_YOU_SHOUT_DURING_SEX, phrase: 'THATS WHAT SHE SAID' },
  { category: Category.THINGS_YOUR_MOTHER_IN_LAW_SAYS, phrase: 'EMOTIONAL DAMAGE' },
  { category: Category.FLORIDA_MAN_HEADLINES, phrase: 'TECHNICALLY NOT ILLEGAL' },
  { category: Category.HORRIBLE_LIFE_ADVICE, phrase: 'MOIST' },
  { category: Category.DRUNKEN_CONFESSIONS, phrase: 'U UP' },
  { category: Category.BAD_EXCUSES_FOR_BEING_LATE, phrase: 'REPLY ALL DISASTER' },
  { category: Category.REGRETTABLE_TATTOO_IDEAS, phrase: 'CRIPPLING STUDENT DEBT' },
]

/**
 * Get the total number of phrases
 */
export function getPhraseCount(): number {
  return PHRASES.length
}

/**
 * Get phrases filtered by category
 */
export function getPhrasesByCategory(category: CategoryType): Phrase[] {
  return PHRASES.filter((p) => p.category === category)
}

/**
 * Get count of phrases per category for balance checking
 */
export function getCategoryDistribution(): Map<CategoryType, number> {
  const distribution = new Map<CategoryType, number>()

  for (const phrase of PHRASES) {
    const count = distribution.get(phrase.category) ?? 0
    distribution.set(phrase.category, count + 1)
  }

  return distribution
}

/**
 * Validate a phrase fits within board constraints
 * Max 52 chars total (4 rows x 14 chars with some flexibility)
 */
export function validatePhraseLength(phrase: string): boolean {
  const MAX_PHRASE_LENGTH = 52
  return phrase.length <= MAX_PHRASE_LENGTH
}

/**
 * Get all phrases that might be too long for the board
 */
export function getOversizedPhrases(): Phrase[] {
  return PHRASES.filter((p) => !validatePhraseLength(p.phrase))
}
