import { Point, Renderer, Sprite, Texture, Container } from "pixi.js";
import { textureToRgbaBytes } from "./utils";
import type { ScaleManager } from "./scaleManager";

export type RoomState = {
  background: Texture;
  walkMask: Texture;
};

export class Room {
  private roomStates = new Map<string, RoomState>();
  private currentStateName: string | null = null;

  private renderer: Renderer;

  private maskPixels: Uint8Array | null = null;
  private width = 0;
  private height = 0;

  private view: Sprite | null = null;
  private scaleManager: ScaleManager | null = null;
  private virtualWidth = 0;
  private virtualHeight = 0;

  public constructor(renderer: Renderer) {
    this.renderer = renderer;
  }

  public addState(name: string, background: Texture, walkMask: Texture): void {
    this.roomStates.set(name, { background, walkMask });
    if (this.currentStateName === null) this.switchState(name);
  }

  public attach(world: Container, scaleManager: ScaleManager, virtualWidth: number, virtualHeight: number): void {
    this.scaleManager = scaleManager;
    this.virtualWidth = virtualWidth;
    this.virtualHeight = virtualHeight;

    if (!this.view) {
      this.view = new Sprite(Texture.EMPTY);
      this.view.anchor.set(0, 0);
      world.addChildAt(this.view, 0);
    } else if (!this.view.parent) {
      world.addChildAt(this.view, 0);
    }

    this.refreshView();
  }

  public switchState(name: string): void {
    this.currentStateName = name;

    const state = this.roomStates.get(name);
    if (!state) return;

    this.width = state.background.width | 0;
    this.height = state.background.height | 0;

    const extracted = textureToRgbaBytes(this.renderer, state.walkMask);
    this.maskPixels = extracted.pixels;

    this.refreshView();
  }

public isPassable(position: Point): boolean {
  const p = this.maskPixels;
  if (!p) return false;

  const x = position.x | 0;
  const y = position.y | 0;

  if ((x | y) < 0 || x >= this.width || y >= this.height) return false;

  const i = ((y * this.width + x) << 2);

  const r = p[i];
  const g = p[i + 1];
  const b = p[i + 2];

  // White = passable, black (and everything else) = blocked
  return r === 255 && g === 255 && b === 255;
}


  private refreshView(): void {
    if (!this.view) return;
    if (!this.currentStateName) return;

    const state = this.roomStates.get(this.currentStateName);
    if (!state) return;

    this.view.texture = state.background;

    if (this.scaleManager) {
      this.scaleManager.fitSpriteContain(this.view, this.virtualWidth, this.virtualHeight);
    }
  }
}
