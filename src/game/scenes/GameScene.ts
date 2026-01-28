/**
 * Game Scene - Main gameplay scene
 *
 * Core gameplay area containing:
 * - The spinning wheel
 * - The phrase board
 * - On-screen keyboard
 *
 * This scene orchestrates the game entities and systems.
 * Business logic lives in GameStateSystem.
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { typography } from '../../design-system/tokens/typography'
import { SceneKeys } from '../config/GameConfig'
import {
  GAME_HEIGHT,
  GAME_WIDTH,
  HIT_PAUSE_MAJOR,
  SCENE_FADE_DURATION,
  SHAKE_DURATION_BANKRUPT,
  SHAKE_INTENSITY_BANKRUPT,
  VOWEL_COST,
} from '../data/constants'
import type { GamePhase, GuessResult, Phrase, SolveResult, WedgeResult } from '../data/types'
import { Keyboard, KeyboardEvents } from '../entities/Keyboard/Keyboard'
import { animateKeyboardEntry } from '../entities/Keyboard/Keyboard.animations'
import { PhraseBoard } from '../entities/PhraseBoard/PhraseBoard'
import { animateBoardEntry } from '../entities/PhraseBoard/PhraseBoard.animations'
import { Wheel } from '../entities/Wheel/Wheel'
import { getAudioSystem } from '../systems/AudioSystem'
import { GameStateEvents, GameStateSystem } from '../systems/GameStateSystem'
import { InputEvents, InputSystem, type LetterInputEvent } from '../systems/InputSystem'
import { getParticleSystem } from '../systems/ParticleSystem'
import { getSaveSystem } from '../systems/SaveSystem'
import { Button } from '../ui/components/Button'
import { type DebugOverlay, installDebugOverlay } from '../utils/debug'
import { getPhraseManager } from '../utils/random'
import { UIEvents } from './UIScene'

/**
 * Events emitted by GameScene
 */
export const GameEvents = {
  GAME_OVER: 'gameOver',
  LETTER_GUESSED: 'letterGuessed',
  LETTER_REVEALED: 'letterRevealed',
  PHRASE_SOLVED: 'phraseSolved',
  WHEEL_LANDED: 'wheelLanded',
  WHEEL_SPIN: 'wheelSpin',
} as const

export class GameScene extends Phaser.Scene {
  private exitButton!: Phaser.GameObjects.Container
  private phraseBoard!: PhraseBoard
  private wheel!: Wheel
  private keyboard!: Keyboard
  private inputSystem!: InputSystem

  /** Game state system */
  private gameState!: GameStateSystem

  /** Current phrase from PhraseManager */
  private currentPhrase: Phrase | null = null

  /** Last wedge result for game logic */
  public lastWedgeResult: WedgeResult | null = null

  /** Debug overlay (dev only) */
  private debugOverlay: DebugOverlay | null = null

  /** Status text showing current game phase */
  private statusText!: Phaser.GameObjects.Text

  /** Wedge value display */
  private wedgeValueText!: Phaser.GameObjects.Text

  /** Spin button */
  private spinButton!: Button

  constructor() {
    super({ key: SceneKeys.GAME })
  }

  /**
   * Initialize scene state
   */
  init(): void {
    // Reset score for new game
    this.registry.set('score', 0)
    this.lastWedgeResult = null

    // Get a random phrase from PhraseManager
    const phraseManager = getPhraseManager()
    const selection = phraseManager.getRandomPhrase()
    this.currentPhrase = selection?.phrase ?? null

    if (import.meta.env.DEV && this.currentPhrase) {
      // eslint-disable-next-line no-console
      console.log(`[GameScene] Selected phrase: "${this.currentPhrase.phrase}" (${this.currentPhrase.category})`)
      // eslint-disable-next-line no-console
      console.log(`[GameScene] Phrases remaining: ${phraseManager.getRemainingCount()}/${phraseManager.getTotalCount()}`)
    }
  }

  /**
   * Create game elements
   */
  create(): void {
    // Fade in
    this.cameras.main.fadeIn(SCENE_FADE_DURATION, 0, 0, 0)

    this.createBackground()
    this.createWheel()
    this.createPhraseBoard()
    this.createKeyboard()
    this.createStatusDisplay()
    this.createDebugControls()

    // Initialize systems AFTER creating entities
    this.initializeGameState()
    this.initializeInputSystem()

    // Set up particle system
    getParticleSystem().setScene(this)

    this.setupEvents()

    // Install debug overlay (dev only)
    this.debugOverlay = installDebugOverlay(this)

    // Listen for debug next phrase event
    this.events.on('debugNextPhrase', () => {
      this.loadNextPhrase()
    })

    // Log for development
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log('[GameScene] Created with wheel, phrase board, keyboard, and game state system')
    }
  }

  /**
   * Initialize the game state system
   */
  private initializeGameState(): void {
    // Fallback phrase if PhraseManager fails
    this.currentPhrase ??= {
      category: 'Horrible Life Advice',
      phrase: 'SOMETHING WENT WRONG',
    }

    this.gameState = new GameStateSystem(this, this.currentPhrase.phrase, this.currentPhrase.category)

    // Listen to game state events
    this.setupGameStateListeners()
  }

  /**
   * Initialize the input system
   */
  private initializeInputSystem(): void {
    this.inputSystem = new InputSystem(this)

    // Listen for letter input from physical keyboard
    this.inputSystem.on(InputEvents.LETTER_PRESSED, (event: LetterInputEvent) => {
      this.handleLetterInput(event)
    })

    // Listen for solve key (Enter)
    this.inputSystem.on(InputEvents.SOLVE_PRESSED, () => {
      if (this.gameState.canSolve()) {
        // Emit event to UIScene to open solve modal
        const uiScene = this.scene.get(SceneKeys.UI)
        uiScene.events.emit('openSolveModal')
      }
    })
  }

  /**
   * Handle letter input from any source
   */
  private handleLetterInput(event: LetterInputEvent): void {
    const { letter, isVowel, source } = event

    // Check if letter is already guessed
    if (this.gameState.isLetterGuessed(letter)) {
      this.showUIMessage('Already guessed!', colors.warning, 1000)
      return
    }

    // Trigger visual feedback on keyboard
    if (source === 'keyboard') {
      this.keyboard.triggerKeyPress(letter)
    }

    // Process the guess
    if (isVowel) {
      const result = this.gameState.buyVowel(letter)
      if (!result.success) {
        this.showUIMessage(this.getErrorMessage(result.error), colors.warning, 1500)
      } else {
        // Disable the letter on keyboard
        this.keyboard.disableLetter(letter)
      }
    } else {
      const result = this.gameState.guessConsonant(letter)
      if (!result.success) {
        this.showUIMessage(this.getErrorMessage(result.error), colors.warning, 1500)
      } else {
        // Disable the letter on keyboard
        this.keyboard.disableLetter(letter)
      }
    }
  }

  /**
   * Set up listeners for game state events
   */
  private setupGameStateListeners(): void {
    // Phase change - update UI
    this.gameState.on(GameStateEvents.PHASE_CHANGE, (data: { previousPhase: GamePhase; newPhase: GamePhase }) => {
      this.updateStatusDisplay()
      this.updateWheelInteractivity()
      this.updateKeyboardState(data.newPhase)
      this.inputSystem.setPhase(data.newPhase)

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[GameScene] Phase changed: ${data.previousPhase} -> ${data.newPhase}`)
      }
    })

    // Letter guessed - reveal on board
    this.gameState.on(GameStateEvents.LETTER_GUESSED, (result: GuessResult) => {
      this.handleLetterGuessed(result)
    })

    // Bankrupt - show feedback with explosion particles and hit pause
    this.gameState.on(GameStateEvents.BANKRUPT, (data: { lostScore: number }) => {
      // Play bankrupt sound
      getAudioSystem().playBankrupt()

      // Hit pause - freeze game briefly for impact
      this.hitPause(HIT_PAUSE_MAJOR, () => {
        this.showUIMessage('BANKRUPT!', colors.danger, 2000)

        // Screen shake for emphasis with intensity from constants
        this.cameras.main.shake(SHAKE_DURATION_BANKRUPT, SHAKE_INTENSITY_BANKRUPT)

        // Explosion particles from wheel center
        getParticleSystem().explosion(380, 520)
      })

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[GameScene] BANKRUPT! Lost ${data.lostScore} points`)
      }
    })

    // Lose turn - show feedback
    this.gameState.on(GameStateEvents.LOSE_TURN, (data: { reason: string }) => {
      const messages: Record<string, string> = {
        bankrupt: '', // Already shown above
        loseTurn: 'LOSE A TURN!',
        wrongGuess: 'No matches!',
        wrongSolve: 'Wrong answer!',
      }

      const message = messages[data.reason]
      if (message) {
        this.showUIMessage(message, colors.warning, 1500)
      }

      // Play appropriate sound
      if (data.reason === 'loseTurn') {
        getAudioSystem().playLoseTurn()
      } else if (data.reason === 'wrongGuess' || data.reason === 'wrongSolve') {
        getAudioSystem().playWrongGuess()
      }
    })

    // Free spin earned
    this.gameState.on(GameStateEvents.FREE_SPIN_EARNED, (data: { totalTokens: number }) => {
      this.showUIMessage(`FREE SPIN! (${data.totalTokens} token${data.totalTokens > 1 ? 's' : ''})`, colors.wheelGold, 2000)
      getAudioSystem().playFreeSpin()
    })

    // Round won
    this.gameState.on(GameStateEvents.ROUND_WON, (data: { finalScore: number; phrase: string }) => {
      this.handleRoundWon(data)
    })

    // Solve attempted
    this.gameState.on(GameStateEvents.SOLVE_ATTEMPTED, (result: SolveResult) => {
      if (result.isCorrect) {
        this.showUIMessage('CORRECT!', colors.success, 2000)
        getAudioSystem().playCorrectGuess()
      }
      // Wrong solve message handled by LOSE_TURN
    })
  }

  /**
   * Update keyboard state based on game phase
   */
  private updateKeyboardState(phase: GamePhase): void {
    switch (phase) {
      case 'IDLE':
        // Can buy vowels but not guess consonants
        this.keyboard.setEnabled(true)
        this.keyboard.setAllowedTypes(false, true)
        break

      case 'GUESSING':
        // Can guess consonants and buy vowels
        this.keyboard.setEnabled(true)
        this.keyboard.setAllowedTypes(true, true)
        break

      case 'SPINNING':
      case 'ROUND_OVER':
      case 'SOLVING':
      case 'BUYING_VOWEL':
        // Disable keyboard
        this.keyboard.setEnabled(false)
        break
    }
  }

  /**
   * Handle letter guessed result
   */
  private handleLetterGuessed(result: GuessResult): void {
    if (result.isCorrect) {
      // Play correct guess sound
      getAudioSystem().playCorrectGuess()

      // Reveal the letter on the board
      this.phraseBoard.revealLetter(result.letter)

      // Show feedback message
      if (result.isVowel) {
        // Play vowel purchase sound
        getAudioSystem().playVowelPurchase()
        this.showUIMessage(
          `${result.count} ${result.letter}${result.count !== 1 ? "'s" : ''}!`,
          colors.accent,
          1500
        )
      } else {
        const pointsText = result.pointsEarned > 0 ? ` (+${result.pointsEarned})` : ''
        this.showUIMessage(
          `${result.count} ${result.letter}${result.count !== 1 ? "'s" : ''}!${pointsText}`,
          colors.success,
          1500
        )
      }

      // Emit for any external listeners
      this.events.emit(GameEvents.LETTER_REVEALED, {
        count: result.count,
        letter: result.letter,
      })
    } else {
      // No matches - play wrong guess sound
      getAudioSystem().playWrongGuess()
      this.showUIMessage(`No ${result.letter}'s`, colors.textSecondary, 1500)
    }

    // Update wedge value display
    this.updateStatusDisplay()
  }

  /**
   * Handle round won
   */
  private handleRoundWon(data: { finalScore: number; phrase: string }): void {
    // Play win fanfare
    getAudioSystem().playWinFanfare()

    // Reveal all remaining letters
    this.phraseBoard.revealAll()

    // Show victory message
    this.showUIMessage('YOU WIN!', colors.success, 0) // 0 = don't auto-hide

    // Celebration particle shower
    this.time.delayedCall(500, () => {
      getParticleSystem().celebrationShower(GAME_WIDTH, GAME_HEIGHT)
    })

    // Emit puzzle solved event
    this.events.emit(GameEvents.PHRASE_SOLVED, {
      phrase: data.phrase,
      score: data.finalScore,
    })

    // Disable wheel and keyboard
    this.wheel.setSpinEnabled(false)
    this.keyboard.setEnabled(false)

    // After delay, end game
    this.time.delayedCall(3000, () => {
      this.endGame(data.finalScore)
    })
  }

  /**
   * Create background for game area
   */
  private createBackground(): void {
    const graphics = this.add.graphics()

    // Dark game show backdrop
    graphics.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.background).color,
      1
    )
    graphics.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

    // Subtle grid pattern
    graphics.lineStyle(
      1,
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      0.3
    )
    for (let x = 0; x < GAME_WIDTH; x += 40) {
      graphics.lineBetween(x, 0, x, GAME_HEIGHT)
    }
    for (let y = 0; y < GAME_HEIGHT; y += 40) {
      graphics.lineBetween(0, y, GAME_WIDTH, y)
    }
  }

  /**
   * Create the spinning wheel
   */
  private createWheel(): void {
    // Position wheel on the left side of the screen - centered vertically
    const wheelX = 380
    const wheelY = 520

    this.wheel = new Wheel(this, wheelX, wheelY)
  }

  /**
   * Create the phrase board
   */
  private createPhraseBoard(): void {
    // Position board on the right side of the screen, moved down
    const boardX = 1250
    const boardY = 380

    this.phraseBoard = new PhraseBoard(this, boardX, boardY)

    // Set initial phrase from PhraseManager
    if (this.currentPhrase) {
      this.phraseBoard.setPhrase(this.currentPhrase.phrase, this.currentPhrase.category)
    }

    // Animate board entry
    animateBoardEntry(this, this.phraseBoard)
  }

  /**
   * Create the on-screen keyboard
   */
  private createKeyboard(): void {
    // Position keyboard lower, closer to bottom of screen
    const keyboardX = 1250
    const keyboardY = 820

    this.keyboard = new Keyboard(this, keyboardX, keyboardY)

    // Listen for letter selection from on-screen keyboard
    this.keyboard.on(KeyboardEvents.LETTER_SELECTED, (data: { letter: string; isVowel: boolean }) => {
      this.handleLetterInput({
        isVowel: data.isVowel,
        letter: data.letter,
        source: 'onscreen',
      })
    })

    // Animate keyboard entry
    animateKeyboardEntry(this, this.keyboard)
  }

  /**
   * Create status display showing current phase and wedge value
   */
  private createStatusDisplay(): void {
    // Status text below wheel
    this.statusText = this.add
      .text(380, 860, 'SPIN THE WHEEL!', {
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.xl}px`,
        color: colors.accent,
        align: 'center',
        resolution: 2,
      })
      .setOrigin(0.5)

    // Wedge value display
    this.wedgeValueText = this.add
      .text(380, 900, '', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.lg}px`,
        color: colors.textSecondary,
        align: 'center',
        resolution: 2,
      })
      .setOrigin(0.5)

    // Spin button
    this.spinButton = new Button(this, {
      x: 380,
      y: 980,
      text: 'SPIN',
      width: 160,
      height: 56,
      fillColor: colors.primary,
      strokeColor: colors.secondary,
      fontSize: typography.fontSize.xl,
      onClick: () => {
        this.handleSpinButton()
      },
    })
  }

  /**
   * Handle spin button click
   */
  private handleSpinButton(): void {
    // Just call wheel.spin() - it emits WHEEL_SPIN event which triggers gameState.startSpin()
    if (this.gameState.canSpin()) {
      this.wheel.spin()
    }
  }

  /**
   * Update status display based on game phase
   */
  private updateStatusDisplay(): void {
    const phase = this.gameState.getPhase()
    const wedgeResult = this.gameState.getCurrentWedgeResult()

    switch (phase) {
      case 'IDLE':
        this.statusText.setText('SPIN THE WHEEL!')
        this.statusText.setColor(colors.accent)
        this.wedgeValueText.setText('')
        break

      case 'SPINNING':
        this.statusText.setText('SPINNING...')
        this.statusText.setColor(colors.textSecondary)
        this.wedgeValueText.setText('')
        break

      case 'GUESSING':
        this.statusText.setText('GUESS A CONSONANT!')
        this.statusText.setColor(colors.success)
        if (wedgeResult && wedgeResult.value > 0) {
          this.wedgeValueText.setText(`Wedge: $${wedgeResult.value}`)
        }
        break

      case 'ROUND_OVER':
        if (this.gameState.hasWon()) {
          this.statusText.setText('PUZZLE SOLVED!')
          this.statusText.setColor(colors.success)
        } else {
          this.statusText.setText('ROUND OVER')
          this.statusText.setColor(colors.danger)
        }
        this.wedgeValueText.setText('')
        break

      default:
        this.statusText.setText('')
        this.wedgeValueText.setText('')
    }
  }

  /**
   * Update wheel interactivity based on game phase
   */
  private updateWheelInteractivity(): void {
    const canSpin = this.gameState.canSpin()
    this.wheel.setSpinEnabled(canSpin)
    this.spinButton.setDisabled(!canSpin)
  }

  /**
   * Show a message in the UIScene
   */
  private showUIMessage(text: string, color: string, duration: number): void {
    const uiScene = this.scene.get(SceneKeys.UI)
    uiScene.events.emit(UIEvents.SHOW_MESSAGE, { color, duration, text })
  }

  /**
   * Create debug controls for testing
   */
  private createDebugControls(): void {
    // Exit button (dev only)
    this.createDebugExitButton()

    // Only add test controls in dev mode
    if (import.meta.env.DEV) {
      this.createDebugTestButtons()
    }
  }

  /**
   * Create a temporary exit button for testing
   */
  private createDebugExitButton(): void {
    const buttonBg = this.add.graphics()
    const buttonWidth = 130
    const buttonHeight = 48

    buttonBg.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.danger).color,
      0.9
    )
    buttonBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      8
    )

    const buttonText = this.add
      .text(0, 0, 'END GAME', {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.md}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0.5)

    this.exitButton = this.add.container(GAME_WIDTH - 80, 40, [buttonBg, buttonText])
    this.exitButton.setSize(buttonWidth, buttonHeight)
    this.exitButton.setInteractive({ useHandCursor: true })

    this.exitButton.on('pointerdown', () => {
      const score = this.gameState.getScore()
      this.endGame(score)
    })

    // Only show in dev mode
    if (!import.meta.env.DEV) {
      this.exitButton.setVisible(false)
    }
  }

  /**
   * Create debug buttons for testing
   */
  private createDebugTestButtons(): void {
    const startY = 40

    // Add "Next Phrase" button
    this.createActionButton(GAME_WIDTH - 370, startY, 'NEXT PHRASE', colors.accent, () => {
      this.loadNextPhrase()
    })

    // Add "Auto Solve" button
    this.createActionButton(GAME_WIDTH - 225, startY, 'AUTO SOLVE', colors.success, () => {
      const phrase = this.gameState.getPhrase()
      this.gameState.attemptSolve(phrase)
    })
  }

  /**
   * Create an action button for debug
   */
  private createActionButton(x: number, y: number, label: string, color: string, onClick: () => void): void {
    const buttonWidth = 130
    const buttonHeight = 48

    const bg = this.add.graphics()
    bg.fillStyle(
      Phaser.Display.Color.HexStringToColor(color).color,
      0.9
    )
    bg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 8)

    const text = this.add
      .text(0, 0, label, {
        fontFamily: typography.fontFamily.body,
        fontSize: `${typography.fontSize.md}px`,
        color: colors.textPrimary,
        resolution: 2,
      })
      .setOrigin(0.5)

    const container = this.add.container(x, y, [bg, text])
    container.setSize(buttonWidth, buttonHeight)
    container.setInteractive({ useHandCursor: true })

    container.on('pointerdown', onClick)
  }

  /**
   * Get human-readable error message
   */
  private getErrorMessage(error: string): string {
    const messages: Record<string, string> = {
      ALREADY_SPINNING: 'Wheel is spinning!',
      CANNOT_BUY_VOWEL: 'Cannot buy vowel now',
      CANNOT_GUESS_YET: 'Spin first!',
      CANNOT_SOLVE_YET: 'Cannot solve now',
      INSUFFICIENT_FUNDS: `Need $${VOWEL_COST}`,
      LETTER_ALREADY_GUESSED: 'Already guessed!',
      NO_FREE_SPIN: 'No free spin!',
      NOT_A_CONSONANT: 'Not a consonant!',
      NOT_A_VOWEL: 'Not a vowel!',
      ROUND_ALREADY_OVER: 'Round is over!',
    }
    return messages[error] ?? error
  }

  /**
   * Load the next phrase from PhraseManager
   */
  private loadNextPhrase(): void {
    const phraseManager = getPhraseManager()
    const selection = phraseManager.getRandomPhrase()

    if (selection) {
      this.currentPhrase = selection.phrase

      // Update phrase board
      this.phraseBoard.setPhrase(this.currentPhrase.phrase, this.currentPhrase.category)
      animateBoardEntry(this, this.phraseBoard)

      // Reset game state for new phrase
      this.gameState.setPhrase(this.currentPhrase.phrase, this.currentPhrase.category)

      // Reset keyboard
      this.keyboard.resetAllLetters()
      this.updateKeyboardState(this.gameState.getPhase())

      // Re-enable wheel
      this.updateWheelInteractivity()

      // Update status
      this.updateStatusDisplay()

      // Hide any lingering messages
      const uiScene = this.scene.get(SceneKeys.UI)
      uiScene.events.emit(UIEvents.HIDE_MESSAGE)

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[GameScene] Loaded phrase: "${this.currentPhrase.phrase}" (${this.currentPhrase.category})`)
        // eslint-disable-next-line no-console
        console.log(`[GameScene] Phrases remaining: ${phraseManager.getRemainingCount()}/${phraseManager.getTotalCount()}`)
      }
    }
  }

  /**
   * Set up event listeners
   */
  private setupEvents(): void {
    // Listen for wheel spin event
    this.events.on(GameEvents.WHEEL_SPIN, (_data: { initialVelocity: number }) => {
      // Notify game state that spin started
      this.gameState.startSpin()
    })

    // Listen for wheel landed event
    this.events.on(
      GameEvents.WHEEL_LANDED,
      (data: { result: WedgeResult; segmentIndex: number }) => {
        this.lastWedgeResult = data.result
        this.onWheelLanded(data.result)
      }
    )

    // Clean up on shutdown
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.events.off(GameEvents.WHEEL_SPIN)
      this.events.off(GameEvents.WHEEL_LANDED)

      // Clean up systems
      this.gameState.destroy()
      this.inputSystem.destroy()
      this.debugOverlay?.destroy()
      this.debugOverlay = null
    })
  }

  /**
   * Handle wheel landing result
   */
  private onWheelLanded(result: WedgeResult): void {
    // Pass to game state system
    this.gameState.wheelStopped(result)

    // Show wedge result message
    switch (result.type) {
      case 'points':
        this.showUIMessage(`$${result.value}`, colors.wheelGold, 1500)
        break
      case 'bankrupt':
        // Handled by GameStateSystem event
        break
      case 'loseTurn':
        // Handled by GameStateSystem event
        break
      case 'freeSpin':
        // Handled by GameStateSystem event
        break
    }
  }

  /**
   * End the game and transition to game over scene
   */
  private endGame(finalScore: number): void {
    // Store final score
    this.registry.set('score', finalScore)

    // Use SaveSystem for persistence
    const save = getSaveSystem()
    save.saveHighScore(finalScore)
    save.addToTotalScore(finalScore)
    save.recordGamePlayed()

    // Update registry for GameOverScene
    this.registry.set('highScore', save.getHighScore())

    // Fade out
    this.cameras.main.fadeOut(SCENE_FADE_DURATION, 0, 0, 0)

    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Stop UIScene and start GameOver
      this.scene.stop(SceneKeys.UI)
      this.scene.start(SceneKeys.GAME_OVER)
    })
  }

  /**
   * Get the phrase board (for external access)
   */
  public getPhraseBoard(): PhraseBoard {
    return this.phraseBoard
  }

  /**
   * Get the wheel (for external access)
   */
  public getWheel(): Wheel {
    return this.wheel
  }

  /**
   * Get the game state system (for external access)
   */
  public getGameState(): GameStateSystem {
    return this.gameState
  }

  /**
   * Get the keyboard (for external access)
   */
  public getKeyboard(): Keyboard {
    return this.keyboard
  }

  /**
   * Attempt to solve the puzzle
   */
  public attemptSolve(guess: string): void {
    this.gameState.attemptSolve(guess)
  }

  /**
   * Update loop - called every frame
   */
  update(time: number, delta: number): void {
    // Update wheel physics
    this.wheel.update(time, delta)

    // Update debug overlay
    this.debugOverlay?.update(time, delta)
  }

  /**
   * Hit pause - freeze the game briefly for impact on significant events
   * This creates a moment of visual emphasis
   */
  private hitPause(duration: number, callback?: () => void): void {
    // Pause all tweens and physics
    this.tweens.pauseAll()

    // Resume after duration
    this.time.delayedCall(duration, () => {
      this.tweens.resumeAll()
      callback?.()
    })
  }
}
