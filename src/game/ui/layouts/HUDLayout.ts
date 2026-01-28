/**
 * HUDLayout - HUD layout manager for UIScene
 *
 * Manages:
 * - Score display
 * - Solve button
 * - Feedback messages
 * - Game phase indicators
 */
import Phaser from 'phaser'

import { colors } from '../../../design-system/tokens/colors'
import { spacing } from '../../../design-system/tokens/spacing'
import { typography } from '../../../design-system/tokens/typography'
import { DEPTH_MODAL, DEPTH_UI, GAME_HEIGHT, GAME_WIDTH } from '../../data/constants'
import { Button } from '../components/Button'
import { ScoreDisplay } from '../components/ScoreDisplay'

/**
 * Events emitted by HUDLayout
 */
export const HUDEvents = {
  SOLVE_CLICKED: 'hud:solveClicked',
  SOLVE_SUBMITTED: 'hud:solveSubmitted',
  SOLVE_CANCELLED: 'hud:solveCancelled',
} as const

/**
 * Solve modal state
 */
interface SolveModalState {
  container: Phaser.GameObjects.Container
  background: Phaser.GameObjects.Graphics
  inputText: Phaser.GameObjects.Text
  submitButton: Button
  cancelButton: Button
  currentInput: string
  cursorBlink: Phaser.Time.TimerEvent | null
  showCursor: boolean
}

/**
 * HUDLayout class
 */
export class HUDLayout {
  /** Reference to scene */
  private scene: Phaser.Scene

  /** Score display component */
  private scoreDisplay: ScoreDisplay

  /** Solve button */
  private solveButton: Button

  /** Message text */
  private messageText: Phaser.GameObjects.Text

  /** Solve modal state */
  private solveModal: SolveModalState | null = null

  /** Whether solve modal is open */
  private isSolveModalOpen: boolean = false

  /** DOM input element for text input */
  private domInput: HTMLInputElement | null = null

  constructor(scene: Phaser.Scene) {
    this.scene = scene

    // Create components
    this.scoreDisplay = this.createScoreDisplay()
    this.solveButton = this.createSolveButton()
    this.messageText = this.createMessageDisplay()
  }

  /**
   * Create the score display
   */
  private createScoreDisplay(): ScoreDisplay {
    const score = (this.scene.registry.get('score') as number | undefined) ?? 0

    const display = new ScoreDisplay(this.scene, {
      initialScore: score,
      label: 'SCORE',
      showLabel: true,
      x: spacing.lg,
      y: spacing.lg,
    })

    display.animateEntry(200)
    return display
  }

  /**
   * Create the solve button
   */
  private createSolveButton(): Button {
    const button = new Button(this.scene, {
      fillColor: colors.success,
      fontSize: typography.fontSize.lg,
      height: 56,
      onClick: () => {
        this.handleSolveClick()
      },
      strokeColor: colors.textPrimary,
      text: 'SOLVE',
      width: 140,
      x: GAME_WIDTH - 90,
      y: GAME_HEIGHT - 50,
    })

    button.animateEntry(300)
    return button
  }

  /**
   * Create the message display
   */
  private createMessageDisplay(): Phaser.GameObjects.Text {
    const text = this.scene.add
      .text(GAME_WIDTH / 2, 100, '', {
        align: 'center',
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize['2xl']}px`,
        resolution: 2,
      })
      .setOrigin(0.5)
      .setDepth(DEPTH_UI)
      .setAlpha(0)
      .setStroke(colors.background, 4)

    return text
  }

  /**
   * Handle solve button click
   */
  private handleSolveClick(): void {
    this.scene.events.emit(HUDEvents.SOLVE_CLICKED)
    this.openSolveModal()
  }

  /**
   * Open the solve modal
   */
  public openSolveModal(): void {
    if (this.isSolveModalOpen) return
    this.isSolveModalOpen = true

    // Create modal container
    const container = this.scene.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2)
    container.setDepth(DEPTH_MODAL)

    // Create darkened background
    const dimmer = this.scene.add.graphics()
    dimmer.fillStyle(0x000000, 0.7)
    dimmer.fillRect(-GAME_WIDTH / 2, -GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT)
    container.add(dimmer)

    // Create modal panel
    const panelWidth = 600
    const panelHeight = 200
    const panel = this.scene.add.graphics()
    panel.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.surface).color,
      0.95
    )
    panel.fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12)
    panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(colors.accent).color, 1)
    panel.strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, 12)
    container.add(panel)

    // Title with high resolution
    const title = this.scene.add
      .text(0, -60, 'SOLVE THE PUZZLE', {
        color: colors.accent,
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.xl}px`,
        resolution: 2,
      })
      .setOrigin(0.5)
    container.add(title)

    // Input field background
    const inputBg = this.scene.add.graphics()
    inputBg.fillStyle(
      Phaser.Display.Color.HexStringToColor(colors.background).color,
      1
    )
    inputBg.fillRoundedRect(-250, -20, 500, 40, 6)
    inputBg.lineStyle(1, Phaser.Display.Color.HexStringToColor(colors.textSecondary).color, 0.5)
    inputBg.strokeRoundedRect(-250, -20, 500, 40, 6)
    container.add(inputBg)

    // Input text display with high resolution
    const inputText = this.scene.add
      .text(0, 0, '', {
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.display,
        fontSize: `${typography.fontSize.lg}px`,
        resolution: 2,
      })
      .setOrigin(0.5)
    container.add(inputText)

    // Submit button
    const submitButton = new Button(this.scene, {
      fillColor: colors.success,
      fontSize: typography.fontSize.md,
      height: 48,
      onClick: () => {
        this.submitSolve()
      },
      strokeColor: colors.textPrimary,
      text: 'SUBMIT',
      width: 130,
      x: -80,
      y: 65,
    })
    this.scene.add.existing(submitButton)
    container.add(submitButton)

    // Cancel button
    const cancelButton = new Button(this.scene, {
      fillColor: colors.danger,
      fontSize: typography.fontSize.md,
      height: 48,
      onClick: () => {
        this.closeSolveModal()
      },
      strokeColor: colors.textPrimary,
      text: 'CANCEL',
      width: 130,
      x: 80,
      y: 65,
    })
    this.scene.add.existing(cancelButton)
    container.add(cancelButton)

    // Set up cursor blink
    let showCursor = true
    const cursorBlink = this.scene.time.addEvent({
      callback: () => {
        showCursor = !showCursor
        this.updateInputDisplay()
      },
      delay: 500,
      loop: true,
    })

    // Store modal state
    this.solveModal = {
      background: panel,
      cancelButton,
      container,
      currentInput: '',
      cursorBlink,
      inputText,
      showCursor,
      submitButton,
    }

    // Create hidden DOM input for keyboard capture
    this.createDOMInput()

    // Animate modal entry
    container.setAlpha(0)
    container.setScale(0.9)
    this.scene.tweens.add({
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
      scaleX: 1,
      scaleY: 1,
      targets: container,
    })
  }

  /**
   * Create hidden DOM input for keyboard capture
   */
  private createDOMInput(): void {
    // Remove any existing input
    if (this.domInput) {
      this.domInput.remove()
    }

    // Create hidden input element
    this.domInput = document.createElement('input')
    this.domInput.type = 'text'
    this.domInput.style.position = 'absolute'
    this.domInput.style.left = '-9999px'
    this.domInput.style.top = '0'
    this.domInput.maxLength = 50

    // Handle input
    this.domInput.addEventListener('input', () => {
      if (this.solveModal && this.domInput) {
        this.solveModal.currentInput = this.domInput.value.toUpperCase()
        this.updateInputDisplay()
      }
    })

    // Handle Enter key
    this.domInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.submitSolve()
      } else if (e.key === 'Escape') {
        this.closeSolveModal()
      }
    })

    document.body.appendChild(this.domInput)
    this.domInput.focus()
  }

  /**
   * Update the input display text
   */
  private updateInputDisplay(): void {
    if (!this.solveModal) return

    const cursor = this.solveModal.showCursor ? '|' : ''
    this.solveModal.inputText.setText(this.solveModal.currentInput + cursor)
  }

  /**
   * Submit the solve attempt
   */
  private submitSolve(): void {
    if (!this.solveModal) return

    const guess = this.solveModal.currentInput.trim()
    if (guess.length === 0) return

    this.scene.events.emit(HUDEvents.SOLVE_SUBMITTED, { guess })
    this.closeSolveModal()
  }

  /**
   * Close the solve modal
   */
  public closeSolveModal(): void {
    if (!this.solveModal) return

    // Stop cursor blink
    if (this.solveModal.cursorBlink) {
      this.solveModal.cursorBlink.destroy()
    }

    // Remove DOM input
    if (this.domInput) {
      this.domInput.remove()
      this.domInput = null
    }

    // Animate out and destroy
    this.scene.tweens.add({
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        if (this.solveModal) {
          this.solveModal.submitButton.destroy()
          this.solveModal.cancelButton.destroy()
          this.solveModal.container.destroy()
          this.solveModal = null
        }
      },
      scaleX: 0.9,
      scaleY: 0.9,
      targets: this.solveModal.container,
    })

    this.isSolveModalOpen = false
    this.scene.events.emit(HUDEvents.SOLVE_CANCELLED)
  }

  /**
   * Update score display
   */
  public updateScore(score: number): void {
    this.scoreDisplay.setScore(score)
  }

  /**
   * Show a feedback message
   */
  public showMessage(text: string, color: string = colors.textPrimary, duration: number = 2000): void {
    this.messageText.setText(text)
    this.messageText.setColor(color)

    // Animate in
    this.scene.tweens.add({
      alpha: 1,
      duration: 200,
      ease: 'Back.easeOut',
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      targets: this.messageText,
    })

    // Auto-hide after duration
    if (duration > 0) {
      this.scene.time.delayedCall(duration, () => {
        this.hideMessage()
      })
    }
  }

  /**
   * Hide the feedback message
   */
  public hideMessage(): void {
    this.scene.tweens.add({
      alpha: 0,
      duration: 150,
      ease: 'Cubic.easeIn',
      scaleX: 0.8,
      scaleY: 0.8,
      targets: this.messageText,
    })
  }

  /**
   * Set solve button enabled state
   */
  public setSolveEnabled(enabled: boolean): void {
    this.solveButton.setDisabled(!enabled)
  }

  /**
   * Check if solve modal is open
   */
  public isSolveOpen(): boolean {
    return this.isSolveModalOpen
  }

  /**
   * Animate entry for all HUD elements
   */
  public animateEntry(): void {
    this.scoreDisplay.animateEntry(0)
    this.solveButton.animateEntry(100)
  }

  /**
   * Get the score display
   */
  public getScoreDisplay(): ScoreDisplay {
    return this.scoreDisplay
  }

  /**
   * Get the solve button
   */
  public getSolveButton(): Button {
    return this.solveButton
  }

  /**
   * Clean up
   */
  public destroy(): void {
    if (this.domInput) {
      this.domInput.remove()
      this.domInput = null
    }

    if (this.solveModal) {
      if (this.solveModal.cursorBlink) {
        this.solveModal.cursorBlink.destroy()
      }
      this.solveModal.submitButton.destroy()
      this.solveModal.cancelButton.destroy()
      this.solveModal.container.destroy()
      this.solveModal = null
    }

    this.scoreDisplay.destroy()
    this.solveButton.destroy()
    this.messageText.destroy()
  }
}
