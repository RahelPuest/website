import { Point, Sprite, Texture, Container, Polygon, Graphics } from "pixi.js";
import type { ScaleManager } from "./scaleManager";

export class Room {

  private maskPixels: Uint8Array | null = null;
  private background: Texture;
  private walkMask: Polygon;

  private backgroundSprite: Sprite;

  private scaleManager: ScaleManager;

  private items: [] = [];

  public constructor(opts: {
    background: Texture;
    walkMask: Polygon;
    scaleManager: ScaleManager;
  }) {
    this.background = opts.background;
    this.walkMask = opts.walkMask;
    this.scaleManager = opts.scaleManager;

    this.backgroundSprite = new Sprite(this.background);
    this.refreshView();
  }

  public attach(world: Container) {
    world.addChild(this.backgroundSprite);
  }

  public isPassable(position: Point): boolean {
    return this.walkMask.contains(position.x, position.y);
  }

  private refreshView(): void {

    if (this.scaleManager) {
      this.scaleManager.fitSpriteContain(this.backgroundSprite);
    }
  }
}
