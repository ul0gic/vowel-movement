/**
 * Debug utilities, cheat codes, and debug overlay
 *
 * Provides development-only tools:
 * - FPS counter toggle
 * - Current game state display
 * - Add points cheat
 * - Reveal all letters cheat
 * - Skip to specific scenes
 *
 * All features are gated behind import.meta.env.DEV
 * and activated via Shift+key keyboard shortcuts.
 *
 * Shortcuts:
 *   Shift+F  - Toggle FPS counter
 *   Shift+D  - Toggle debug overlay (scene, phase, score)
 *   Shift+P  - Add 1000 points
 *   Shift+R  - Reveal all letters
 *   Shift+S  - Auto-solve the puzzle
 *   Shift+N  - Skip to next phrase
 *   Shift+M  - Toggle mute
 *   Shift+1  - Jump to MenuScene
 *   Shift+2  - Jump to GameScene
 *   Shift+3  - Jump to GameOverScene
 */

import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { typography } from '../../design-system/tokens/typography'
import { SceneKeys } from '../config/GameConfig'
import { GAME_WIDTH } from '../data/constants'
import { getAudioSystem } from '../systems/AudioSystem'
import { getSaveSystem } from '../systems/SaveSystem'

// ============================================
// DEBUG LOGGER
// ============================================

export const DEBUG = {
  enabled: import.meta.env.DEV,
  log: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },
}

// ============================================
// DEBUG OVERLAY
// ============================================

/**
 * Overlay display state
 */
interface OverlayState {
  /** Whether FPS counter is visible */
  fpsVisible: boolean
  /** Whether full debug overlay is visible */
  overlayVisible: boolean
}

/**
 * FPS tracking buffer for smoothed display
 */
interface FPSTracker {
  /** Rolling FPS values for averaging */
  samples: number[]
  /** Max samples to keep */
  maxSamples: number
  /** Last time FPS was updated on display */
  lastDisplayUpdate: number
  /** Display update interval in ms */
  displayInterval: number
}

/**
 * DebugOverlay class
 *
 * Creates a persistent overlay on top of the game showing
 * FPS, scene name, game phase, and score. Only created in DEV mode.
 */
export class DebugOverlay {
  private scene: Phaser.Scene
  private state: OverlayState = {
    fpsVisible: false,
    overlayVisible: false,
  }

  /** FPS display text */
  private fpsText: Phaser.GameObjects.Text | null = null

  /** Debug info text */
  private debugText: Phaser.GameObjects.Text | null = null

  /** Background panel for overlay */
  private bgPanel: Phaser.GameObjects.Graphics | null = null

  /** FPS tracker */
  private fpsTracker: FPSTracker = {
    displayInterval: 250,
    lastDisplayUpdate: 0,
    maxSamples: 30,
    samples: [],
  }

  /** Keyboard keys for cheat codes */
  private keys: Map<string, Phaser.Input.Keyboard.Key> = new Map()

  /** Whether cheats are registered */
  private cheatsRegistered = false

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    if (!import.meta.env.DEV) return

    this.createOverlayElements()
    this.registerCheats()
  }

  /**
   * Create the overlay text elements (hidden by default)
   */
  private createOverlayElements(): void {
    const depth = 9999

    // Background panel
    this.bgPanel = this.scene.add.graphics()
    this.bgPanel.setDepth(depth)
    this.bgPanel.setScrollFactor(0)
    this.bgPanel.setAlpha(0)

    // FPS counter text
    this.fpsText = this.scene.add
      .text(GAME_WIDTH - 10, 10, 'FPS: --', {
        align: 'right',
        backgroundColor: '#000000aa',
        color: colors.success,
        fontFamily: typography.fontFamily.mono,
        fontSize: '14px',
        padding: { bottom: 4, left: 8, right: 8, top: 4 },
        resolution: 2,
      })
      .setOrigin(1, 0)
      .setDepth(depth)
      .setScrollFactor(0)
      .setVisible(false)

    // Debug info text (multi-line)
    this.debugText = this.scene.add
      .text(10, 10, '', {
        backgroundColor: '#000000cc',
        color: colors.success,
        fontFamily: typography.fontFamily.mono,
        fontSize: '12px',
        lineSpacing: 4,
        padding: { bottom: 6, left: 8, right: 8, top: 6 },
        resolution: 2,
      })
      .setDepth(depth)
      .setScrollFactor(0)
      .setVisible(false)
  }

  /**
   * Register keyboard shortcuts for cheat codes
   */
  private registerCheats(): void {
    if (!import.meta.env.DEV || this.cheatsRegistered) return

    const kb = this.scene.input.keyboard
    if (!kb) return

    // Map of shift+key shortcuts
    const keyMap: Record<string, number> = {
      D: Phaser.Input.Keyboard.KeyCodes.D,
      F: Phaser.Input.Keyboard.KeyCodes.F,
      M: Phaser.Input.Keyboard.KeyCodes.M,
      N: Phaser.Input.Keyboard.KeyCodes.N,
      ONE: Phaser.Input.Keyboard.KeyCodes.ONE,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      R: Phaser.Input.Keyboard.KeyCodes.R,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      THREE: Phaser.Input.Keyboard.KeyCodes.THREE,
      TWO: Phaser.Input.Keyboard.KeyCodes.TWO,
    }

    for (const [name, code] of Object.entries(keyMap)) {
      const key = kb.addKey(code, false)
      this.keys.set(name, key)
    }

    // FPS toggle: Shift+F
    this.keys.get('F')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.toggleFPS()
    })

    // Debug overlay toggle: Shift+D
    this.keys.get('D')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.toggleOverlay()
    })

    // Add points: Shift+P
    this.keys.get('P')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.cheatAddPoints(1000)
    })

    // Reveal all letters: Shift+R
    this.keys.get('R')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.cheatRevealAll()
    })

    // Auto-solve: Shift+S
    this.keys.get('S')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.cheatAutoSolve()
    })

    // Next phrase: Shift+N
    this.keys.get('N')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.cheatNextPhrase()
    })

    // Toggle mute: Shift+M
    this.keys.get('M')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.cheatToggleMute()
    })

    // Scene jumps: Shift+1/2/3
    this.keys.get('ONE')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.jumpToScene(SceneKeys.MENU)
    })

    this.keys.get('TWO')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.jumpToScene(SceneKeys.GAME)
    })

    this.keys.get('THREE')?.on('down', () => {
      if (!this.isShiftHeld()) return
      this.jumpToScene(SceneKeys.GAME_OVER)
    })

    this.cheatsRegistered = true

    DEBUG.log('Debug cheats registered. Shift+F=FPS, Shift+D=Overlay, Shift+P=Points, Shift+R=Reveal, Shift+S=Solve')
  }

  /**
   * Check if Shift is currently held
   */
  private isShiftHeld(): boolean {
    const kb = this.scene.input.keyboard
    if (!kb) return false

    // Check if shift key is currently down
    return kb.checkDown(kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT, false))
  }

  // ============================================
  // TOGGLE METHODS
  // ============================================

  /**
   * Toggle FPS counter visibility
   */
  private toggleFPS(): void {
    this.state.fpsVisible = !this.state.fpsVisible
    this.fpsText?.setVisible(this.state.fpsVisible)
    DEBUG.log(`FPS counter: ${this.state.fpsVisible ? 'ON' : 'OFF'}`)
  }

  /**
   * Toggle full debug overlay visibility
   */
  private toggleOverlay(): void {
    this.state.overlayVisible = !this.state.overlayVisible
    this.debugText?.setVisible(this.state.overlayVisible)
    this.bgPanel?.setAlpha(this.state.overlayVisible ? 1 : 0)
    DEBUG.log(`Debug overlay: ${this.state.overlayVisible ? 'ON' : 'OFF'}`)
  }

  // ============================================
  // CHEAT METHODS
  // ============================================

  /**
   * Cheat: Add points to the current score
   */
  private cheatAddPoints(amount: number): void {
    const currentScore = (this.scene.registry.get('score') as number | undefined) ?? 0
    const newScore = currentScore + amount
    this.scene.registry.set('score', newScore)

    // Also try to update via GameStateSystem if we are in GameScene
    const gameScene = this.getGameScene()
    if (gameScene) {
      const gs = gameScene.getGameState()
      // Directly manipulate score via the state accessor trick
      const state = gs.getState()
      // We need to use the registry to propagate the score
      // The registry change will trigger UIScene update
      void state // acknowledge read
    }

    DEBUG.log(`CHEAT: Added $${amount}. New score: $${newScore}`)
  }

  /**
   * Cheat: Reveal all letters on the phrase board
   */
  private cheatRevealAll(): void {
    const gameScene = this.getGameScene()
    if (!gameScene) {
      DEBUG.log('CHEAT: Not in GameScene, cannot reveal')
      return
    }

    const board = gameScene.getPhraseBoard()
    board.revealAll()
    DEBUG.log('CHEAT: Revealed all letters')
  }

  /**
   * Cheat: Auto-solve the puzzle
   */
  private cheatAutoSolve(): void {
    const gameScene = this.getGameScene()
    if (!gameScene) {
      DEBUG.log('CHEAT: Not in GameScene, cannot solve')
      return
    }

    const gs = gameScene.getGameState()
    const phrase = gs.getPhrase()
    gs.attemptSolve(phrase)
    DEBUG.log(`CHEAT: Auto-solved with "${phrase}"`)
  }

  /**
   * Cheat: Load next phrase
   */
  private cheatNextPhrase(): void {
    // Emit a synthetic event that GameScene can handle
    const gameScene = this.getGameScene()
    if (!gameScene) {
      DEBUG.log('CHEAT: Not in GameScene, cannot load next phrase')
      return
    }

    // Trigger the next phrase load by calling the scene's exposed methods
    // We use the scene events to trigger the debug "NEXT PHRASE" action
    gameScene.events.emit('debugNextPhrase')
    DEBUG.log('CHEAT: Loading next phrase')
  }

  /**
   * Cheat: Toggle audio mute
   */
  private cheatToggleMute(): void {
    const audio = getAudioSystem()
    const newMuted = !audio.getMuted()
    audio.setMuted(newMuted)
    getSaveSystem().setMuted(newMuted)
    DEBUG.log(`CHEAT: Audio ${newMuted ? 'MUTED' : 'UNMUTED'}`)
  }

  /**
   * Jump to a specific scene
   */
  private jumpToScene(sceneKey: string): void {
    DEBUG.log(`CHEAT: Jumping to ${sceneKey}`)

    const game = this.scene.game

    // Stop all active scenes first
    for (const scene of game.scene.getScenes(true)) {
      if (scene.scene.key !== sceneKey) {
        game.scene.stop(scene.scene.key)
      }
    }

    // Start the target scene
    if (sceneKey === SceneKeys.GAME) {
      game.scene.start(sceneKey)
      game.scene.start(SceneKeys.UI)
    } else {
      game.scene.start(sceneKey)
    }
  }

  /**
   * Try to get the GameScene instance
   */
  private getGameScene(): GameSceneAccess | null {
    try {
      const scene = this.scene.scene.get(SceneKeys.GAME)
      if (scene.scene.isActive()) {
        return scene as unknown as GameSceneAccess
      }
      return null
    } catch {
      return null
    }
  }

  // ============================================
  // UPDATE
  // ============================================

  /**
   * Update the overlay display (call from scene update)
   */
  public update(_time: number, delta: number): void {
    if (!import.meta.env.DEV) return

    // Update FPS
    if (this.state.fpsVisible) {
      this.updateFPS(delta)
    }

    // Update debug info
    if (this.state.overlayVisible) {
      this.updateDebugInfo()
    }
  }

  /**
   * Update FPS counter
   */
  private updateFPS(delta: number): void {
    if (!this.fpsText) return

    // Calculate current FPS
    const fps = delta > 0 ? 1000 / delta : 60

    // Add to rolling samples
    this.fpsTracker.samples.push(fps)
    if (this.fpsTracker.samples.length > this.fpsTracker.maxSamples) {
      this.fpsTracker.samples.shift()
    }

    // Only update display text periodically to avoid jitter
    const now = performance.now()
    if (now - this.fpsTracker.lastDisplayUpdate >= this.fpsTracker.displayInterval) {
      const avgFps =
        this.fpsTracker.samples.reduce((sum, val) => sum + val, 0) /
        this.fpsTracker.samples.length

      const fpsRounded = Math.round(avgFps)
      const fpsColor =
        fpsRounded >= 55 ? colors.success : fpsRounded >= 30 ? colors.warning : colors.danger

      this.fpsText.setText(`FPS: ${fpsRounded}`)
      this.fpsText.setColor(fpsColor)

      this.fpsTracker.lastDisplayUpdate = now
    }
  }

  /**
   * Update debug info overlay
   */
  private updateDebugInfo(): void {
    if (!this.debugText) return

    const lines: string[] = []

    // Active scene
    const activeScenes = this.scene.game.scene
      .getScenes(true)
      .map((s) => s.scene.key)
      .join(', ')
    lines.push(`Scene: ${activeScenes}`)

    // Game state info (if in GameScene)
    const gameScene = this.getGameScene()
    if (gameScene) {
      const gs = gameScene.getGameState()
      lines.push(`Phase: ${gs.getPhase()}`)
      lines.push(`Score: $${gs.getScore().toLocaleString()}`)
      lines.push(`Phrase: "${gs.getPhrase()}"`)
      lines.push(`Category: ${gs.getCategory()}`)
      lines.push(`Guessed: ${gs.getAllGuessedLetters().join(', ') || 'none'}`)
      lines.push(`Free Spins: ${gs.getFreeSpinTokens()}`)
      lines.push(`Won: ${gs.hasWon()}`)
    }

    // Score from registry
    const registryScore = (this.scene.registry.get('score') as number | undefined) ?? 0
    const highScore = (this.scene.registry.get('highScore') as number | undefined) ?? 0
    lines.push(`---`)
    lines.push(`Registry Score: $${registryScore.toLocaleString()}`)
    lines.push(`High Score: $${highScore.toLocaleString()}`)

    // Audio state
    const audio = getAudioSystem()
    lines.push(`Audio: ${audio.getMuted() ? 'MUTED' : 'ON'}`)

    // Renderer info
    lines.push(`Renderer: ${this.scene.game.renderer.type === 1 ? 'WebGL' : 'Canvas'}`)

    this.debugText.setText(lines.join('\n'))
  }

  // ============================================
  // CLEANUP
  // ============================================

  /**
   * Destroy the overlay and clean up
   */
  public destroy(): void {
    this.fpsText?.destroy()
    this.debugText?.destroy()
    this.bgPanel?.destroy()

    for (const key of this.keys.values()) {
      key.removeAllListeners()
    }
    this.keys.clear()

    this.fpsText = null
    this.debugText = null
    this.bgPanel = null
  }
}

// ============================================
// TYPE FOR ACCESSING GAME SCENE
// ============================================

/**
 * Interface for accessing GameScene methods from debug
 * (avoids circular import of GameScene)
 */
interface GameSceneAccess {
  events: Phaser.Events.EventEmitter
  getGameState(): {
    getAllGuessedLetters(): string[]
    attemptSolve(guess: string): unknown
    getCategory(): string
    getFreeSpinTokens(): number
    getPhase(): string
    getPhrase(): string
    getScore(): number
    getState(): unknown
    hasWon(): boolean
  }
  getKeyboard(): unknown
  getPhraseBoard(): {
    revealAll(): void
  }
}

// ============================================
// GLOBAL DEBUG SETUP
// ============================================

/**
 * Install the debug overlay onto a scene.
 * Call this in the scene's create() method.
 * Returns the overlay instance so it can be updated in update().
 *
 * Usage in a scene:
 *   private debugOverlay: DebugOverlay | null = null
 *
 *   create() {
 *     this.debugOverlay = installDebugOverlay(this)
 *   }
 *
 *   update(time, delta) {
 *     this.debugOverlay?.update(time, delta)
 *   }
 */
export function installDebugOverlay(scene: Phaser.Scene): DebugOverlay | null {
  if (!import.meta.env.DEV) return null
  return new DebugOverlay(scene)
}
