/**
 * Delay helpers and frame counting
 * Will be expanded as needed
 */

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
