/**
 * Iconify Integration for Phaser
 *
 * Loads SVG icons from Iconify and converts them to Phaser textures:
 * - On-demand icon loading from Iconify API
 * - SVG to texture conversion
 * - Caching for performance
 * - Support for coloring and sizing
 */
import Iconify from '@iconify/iconify'

// ============================================
// TYPES
// ============================================

/** Icon configuration */
export interface IconConfig {
  /** Icon name in format "prefix:name" (e.g., "lucide:trophy") */
  name: string
  /** Icon size in pixels (default 32) */
  size?: number
  /** Icon color as hex string (default white) */
  color?: string
  /** Optional texture key override */
  textureKey?: string
}

/** Predefined icon names for the game */
export const IconNames = {
  /** Trophy icon - for achievements, wins */
  trophy: 'lucide:trophy',
  /** Gamepad icon - for games played */
  gamepad: 'lucide:gamepad-2',
  /** Coins icon - for scores, money */
  coins: 'lucide:coins',
  /** Trending up icon - for stats */
  trendingUp: 'lucide:trending-up',
  /** Check icon - for completed items */
  check: 'lucide:check',
  /** Lock icon - for locked achievements */
  lock: 'lucide:lock',
  /** Star icon - for favorites, ratings */
  star: 'lucide:star',
  /** Zap icon - for power, energy */
  zap: 'lucide:zap',
  /** Flame icon - for streaks, hot */
  flame: 'lucide:flame',
  /** Skull icon - for bankrupt, danger */
  skull: 'lucide:skull',
  /** Target icon - for accuracy */
  target: 'lucide:target',
  /** Crown icon - for high scores */
  crown: 'lucide:crown',
  /** Gift icon - for bonuses */
  gift: 'lucide:gift',
  /** Sparkles icon - for special effects */
  sparkles: 'lucide:sparkles',
  /** Settings icon */
  settings: 'lucide:settings',
  /** Volume icon */
  volume: 'lucide:volume-2',
  /** Volume muted icon */
  volumeMuted: 'lucide:volume-x',
  /** Play icon */
  play: 'lucide:play',
  /** Refresh icon */
  refresh: 'lucide:refresh-cw',
  /** Home icon */
  home: 'lucide:home',
} as const

/** Type for icon name keys */
export type IconName = keyof typeof IconNames

// ============================================
// ICON LOADER CLASS
// ============================================

/**
 * IconLoader - Singleton class for loading and caching icons
 */
export class IconLoader {
  private static instance: IconLoader | null = null
  private scene: Phaser.Scene | null = null
  private loadedIcons: Set<string> = new Set()
  private pendingLoads: Map<string, Promise<boolean>> = new Map()

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): IconLoader {
    IconLoader.instance ??= new IconLoader()
    return IconLoader.instance
  }

  /**
   * Set the current scene for texture creation
   */
  public setScene(scene: Phaser.Scene): void {
    this.scene = scene
  }

  /**
   * Generate texture key for an icon
   */
  private getTextureKey(name: string, size: number, color: string): string {
    // Normalize color by removing # if present
    const normalizedColor = color.replace('#', '')
    return `icon_${name.replace(':', '_')}_${size}_${normalizedColor}`
  }

  /**
   * Load a single icon and create a Phaser texture
   */
  public async loadIcon(config: IconConfig): Promise<boolean> {
    const size = config.size ?? 32
    const color = config.color ?? '#FFFFFF'
    const textureKey = config.textureKey ?? this.getTextureKey(config.name, size, color)

    // Check if already loaded
    if (this.loadedIcons.has(textureKey)) {
      return true
    }

    // Check if load is in progress
    const pending = this.pendingLoads.get(textureKey)
    if (pending) {
      return pending
    }

    // Start new load
    const loadPromise = this.doLoadIcon(config.name, textureKey, size, color)
    this.pendingLoads.set(textureKey, loadPromise)

    const result = await loadPromise
    this.pendingLoads.delete(textureKey)

    return result
  }

  /**
   * Internal icon loading implementation
   */
  private async doLoadIcon(
    name: string,
    textureKey: string,
    size: number,
    color: string
  ): Promise<boolean> {
    if (!this.scene) {
      console.warn('[IconLoader] No scene set, cannot load icon')
      return false
    }

    try {
      // Load icon data from Iconify (returns icon data or undefined if not found)
      await Iconify.loadIcon(name)

      // Render icon as SVG element
      const svg = Iconify.renderSVG(name, {
        width: size,
        height: size,
      })

      if (!svg) {
        console.warn(`[IconLoader] Failed to render icon: ${name}`)
        return false
      }

      // Apply color via CSS fill and stroke on the SVG element
      // This works because Lucide icons use currentColor
      svg.style.color = color
      svg.setAttribute('fill', color)
      svg.setAttribute('stroke', color)

      // Also set on all child paths/elements that might use currentColor
      const paths = svg.querySelectorAll('path, circle, rect, line, polyline, polygon')
      paths.forEach((path) => {
        const element = path as SVGElement
        // Check if stroke is set to currentColor or not set
        const currentStroke = element.getAttribute('stroke')
        if (currentStroke === 'currentColor' || currentStroke === null) {
          element.setAttribute('stroke', color)
        }
        // Check if fill is set to currentColor
        const currentFill = element.getAttribute('fill')
        if (currentFill === 'currentColor') {
          element.setAttribute('fill', color)
        }
      })

      // Convert SVG element to string
      const svgString = new XMLSerializer().serializeToString(svg)

      // Create data URL from SVG (use encodeURIComponent for better character support)
      const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString)

      // Add texture to Phaser
      await this.addTextureFromDataUrl(textureKey, dataUrl)

      this.loadedIcons.add(textureKey)

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[IconLoader] Loaded icon: ${name} as ${textureKey}`)
      }

      return true
    } catch (error) {
      console.error(`[IconLoader] Error loading icon ${name}:`, error)
      return false
    }
  }

  /**
   * Add a texture from a data URL using direct Image loading
   * This avoids Phaser's loader which can have timing issues
   */
  private addTextureFromDataUrl(key: string, dataUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.scene) {
        reject(new Error('No scene available'))
        return
      }

      // Check if texture already exists
      if (this.scene.textures.exists(key)) {
        resolve()
        return
      }

      // Create an HTML Image element and load the data URL
      const img = new Image()

      img.onload = () => {
        try {
          // Add image directly to Phaser's texture manager
          if (this.scene && !this.scene.textures.exists(key)) {
            this.scene.textures.addImage(key, img)
          }
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error(`Failed to load image: ${key}`))
      }

      // Start loading
      img.src = dataUrl
    })
  }

  /**
   * Load multiple icons at once
   */
  public async loadIcons(configs: IconConfig[]): Promise<boolean[]> {
    return Promise.all(configs.map((config) => this.loadIcon(config)))
  }

  /**
   * Preload all game icons with default settings
   */
  public async preloadGameIcons(color: string = '#FFFFFF', size: number = 32): Promise<void> {
    const iconConfigs: IconConfig[] = Object.values(IconNames).map((name) => ({
      name,
      color,
      size,
    }))

    await this.loadIcons(iconConfigs)
  }

  /**
   * Check if an icon texture is loaded
   */
  public isIconLoaded(name: string, size: number = 32, color: string = '#FFFFFF'): boolean {
    const textureKey = this.getTextureKey(name, size, color)
    return this.loadedIcons.has(textureKey)
  }

  /**
   * Get the texture key for an icon (for use with Phaser's add.image)
   */
  public getIconTextureKey(name: string, size: number = 32, color: string = '#FFFFFF'): string {
    return this.getTextureKey(name, size, color)
  }

  /**
   * Clear all loaded icon textures
   */
  public clearAll(): void {
    if (this.scene) {
      this.loadedIcons.forEach((key) => {
        if (this.scene?.textures.exists(key)) {
          this.scene.textures.remove(key)
        }
      })
    }
    this.loadedIcons.clear()
    this.pendingLoads.clear()
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the global IconLoader instance
 */
export function getIconLoader(): IconLoader {
  return IconLoader.getInstance()
}

/**
 * Create an icon image in a Phaser scene
 * Returns the image if texture is loaded, null otherwise
 */
export function createIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  iconName: IconName | (string & Record<never, never>),
  options: { size?: number; color?: string; scale?: number } = {}
): Phaser.GameObjects.Image | null {
  const loader = getIconLoader()
  const name = iconName in IconNames
    ? IconNames[iconName as IconName]
    : iconName

  const size = options.size ?? 32
  const color = options.color ?? '#FFFFFF'
  const textureKey = loader.getIconTextureKey(name, size, color)

  // Check if texture exists
  if (!scene.textures.exists(textureKey)) {
    console.warn(`[createIcon] Texture not loaded: ${textureKey}. Call loadIcon first.`)
    return null
  }

  const image = scene.add.image(x, y, textureKey)

  if (options.scale !== undefined) {
    image.setScale(options.scale)
  }

  return image
}

/**
 * Create an icon with a glow effect
 */
export function createGlowIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  iconName: IconName | (string & Record<never, never>),
  options: { size?: number; color?: string; glowColor?: string; glowStrength?: number } = {}
): Phaser.GameObjects.Container | null {
  const icon = createIcon(scene, 0, 0, iconName, {
    size: options.size,
    color: options.color,
  })

  if (!icon) return null

  const container = scene.add.container(x, y)

  // Create glow using a blurred copy (simple approximation)
  const glowColor = options.glowColor ?? options.color ?? '#FFFFFF'
  const glowStrength = options.glowStrength ?? 0.5

  // Add a tinted background icon for glow effect
  const glowIcon = scene.add.image(0, 0, icon.texture.key)
  glowIcon.setTint(Phaser.Display.Color.HexStringToColor(glowColor).color)
  glowIcon.setAlpha(glowStrength)
  glowIcon.setScale(1.2)

  container.add([glowIcon, icon])

  return container
}

// ============================================
// ICON SPRITE CLASS
// ============================================

/**
 * IconSprite - A Phaser-friendly icon component
 */
export class IconSprite extends Phaser.GameObjects.Container {
  private iconImage: Phaser.GameObjects.Image | null = null
  private iconName: string
  private iconSize: number
  private iconColor: string

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    iconName: IconName | (string & Record<never, never>),
    options: { size?: number; color?: string } = {}
  ) {
    super(scene, x, y)

    this.iconName = iconName in IconNames
      ? IconNames[iconName as IconName]
      : iconName
    this.iconSize = options.size ?? 32
    this.iconColor = options.color ?? '#FFFFFF'

    scene.add.existing(this)

    // Try to create the icon if already loaded
    this.tryCreateIcon()
  }

  /**
   * Attempt to create the icon image
   */
  private tryCreateIcon(): boolean {
    const loader = getIconLoader()
    const textureKey = loader.getIconTextureKey(this.iconName, this.iconSize, this.iconColor)

    if (this.scene.textures.exists(textureKey)) {
      this.iconImage = this.scene.add.image(0, 0, textureKey)
      this.add(this.iconImage)
      return true
    }

    return false
  }

  /**
   * Load the icon and create the image
   */
  public async load(): Promise<boolean> {
    const loader = getIconLoader()
    loader.setScene(this.scene)

    const loaded = await loader.loadIcon({
      name: this.iconName,
      size: this.iconSize,
      color: this.iconColor,
    })

    if (loaded) {
      this.tryCreateIcon()
    }

    return loaded
  }

  /**
   * Change the icon color (requires reload)
   */
  public async setIconColor(color: string): Promise<void> {
    if (this.iconColor === color) return

    // Remove old image
    if (this.iconImage) {
      this.iconImage.destroy()
      this.iconImage = null
    }

    this.iconColor = color
    await this.load()
  }

  /**
   * Set tint on the icon image
   */
  public setIconTint(color: number): void {
    if (this.iconImage) {
      this.iconImage.setTint(color)
    }
  }

  /**
   * Clear tint on the icon image
   */
  public clearIconTint(): void {
    if (this.iconImage) {
      this.iconImage.clearTint()
    }
  }
}
