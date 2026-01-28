/**
 * Phaser game configuration
 * Defines core game settings: dimensions, renderer, physics, and scenes
 */
import Phaser from 'phaser'

import { colors } from '../../design-system/tokens/colors'
import { GAME_HEIGHT, GAME_WIDTH } from '../data/constants'
import { BootScene } from '../scenes/BootScene'
import { GameOverScene } from '../scenes/GameOverScene'
import { GameScene } from '../scenes/GameScene'
import { MenuScene } from '../scenes/MenuScene'
import { PreloadScene } from '../scenes/PreloadScene'
import { UIScene } from '../scenes/UIScene'

/**
 * Scene keys for type-safe scene transitions
 */
export const SceneKeys = {
  BOOT: 'BootScene',
  GAME: 'GameScene',
  GAME_OVER: 'GameOverScene',
  MENU: 'MenuScene',
  PRELOAD: 'PreloadScene',
  UI: 'UIScene',
} as const

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys]

/**
 * Phaser game configuration
 * - WebGL renderer with Canvas fallback
 * - 1920x1080 base resolution
 * - FIT mode scales to fit browser while maintaining aspect ratio
 */
export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO, // WebGL with Canvas fallback
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'app',
  backgroundColor: colors.background,
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene, GameOverScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 960,
      height: 540,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  render: {
    pixelArt: false,
    antialias: true,
    antialiasGL: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: false,
  },
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
  },
}
