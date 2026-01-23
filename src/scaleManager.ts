import { Container, Sprite } from "pixi.js";

export type ScaleConfig = {
  virtualWidth: number;
  virtualHeight: number;
  useIntegerScaling: boolean;
};

export class ScaleManager {
  private readonly virtualWidth: number;
  private readonly virtualHeight: number;
  private readonly useIntegerScaling: boolean;

  private world: Container | null = null;
  private ui: Container | null = null;

  private screenW = 0;
  private screenH = 0;

  public worldScale = 1;
  public worldOffsetX = 0;
  public worldOffsetY = 0;

  public constructor(config: ScaleConfig) {
    this.virtualWidth = config.virtualWidth;
    this.virtualHeight = config.virtualHeight;
    this.useIntegerScaling = config.useIntegerScaling;
  }

  public bind(world: Container, ui: Container): void {
    this.world = world;
    this.ui = ui;
  }

  public fitSpriteContain(sprite: Sprite): void {
    const tw = sprite.texture.width;
    const th = sprite.texture.height;
    if (tw <= 0 || th <= 0) return;

    const scale = Math.min(this.virtualWidth / tw, this.virtualHeight / th);
    sprite.scale.set(scale);
    sprite.position.set((this.virtualWidth - tw * scale) / 2, (this.virtualHeight - th * scale) / 2);
  }

  public worldToScreenX(wx: number): number {
    return this.worldOffsetX + wx * this.worldScale;
  }

  public worldToScreenY(wy: number): number {
    return this.worldOffsetY + wy * this.worldScale;
  }

  public worldToScreen(wx: number, wy: number): { x: number; y: number } {
    return { x: this.worldToScreenX(wx), y: this.worldToScreenY(wy) };
  }

  public applyResize(screenW: number, screenH: number): void {
    this.screenW = screenW;
    this.screenH = screenH;

    const rawScale = Math.min(
      this.screenW / this.virtualWidth,
      this.screenH / this.virtualHeight
    );

    this.worldScale = this.useIntegerScaling ? Math.max(1, Math.floor(rawScale)) : rawScale;

    const worldPixelW = this.virtualWidth * this.worldScale;
    const worldPixelH = this.virtualHeight * this.worldScale;

    this.worldOffsetX = (this.screenW - worldPixelW) / 2;
    this.worldOffsetY = (this.screenH - worldPixelH) / 2;

    if (!this.world || !this.ui) {
      throw new Error("ScaleManager not bound. Call scaleManager.bind(world, ui) first.");
    }

    this.world.scale.set(this.worldScale);
    this.world.position.set(this.worldOffsetX, this.worldOffsetY);

    // UI stays in screen coordinates: no scaling, no offset.
    this.ui.scale.set(1);
    this.ui.position.set(0, 0);
  }
}
