import { Point, Sprite, Texture, Container, Polygon } from "pixi.js";
import type { ScaleManager } from "./scaleManager";
import { ItemManager } from "./itemManager";

export class Room {

  private background: Texture;
  private walkMask: Polygon;

  private backgroundSprite: Sprite;

  private scaleManager: ScaleManager;
  private itemManager: ItemManager;

  private itemIds: string[] = [];

  public constructor(opts: {
    background: Texture;
    walkMask: Polygon;
    scaleManager: ScaleManager;
    itemManager: ItemManager;
    itemIds: string[];
  }) {
    this.background = opts.background;
    this.walkMask = opts.walkMask;

    this.scaleManager = opts.scaleManager;
    this.itemManager = opts.itemManager;

    this.backgroundSprite = new Sprite(this.background);

    this.itemIds = opts.itemIds;

    this.refreshView();
  }

  public attach(world: Container) {
    world.addChild(this.backgroundSprite);

    this.itemIds.forEach((id) => {
      const item = this.itemManager.getById(id);
      if (!item) return;
      world.addChild(item.stageView);
    });
  }


  public isPassable(position: Point): boolean {
    return this.walkMask.contains(position.x, position.y);
  }

  private refreshView(): void {
    if (this.scaleManager) {
      this.scaleManager.fitSpriteContain(this.backgroundSprite);
    }
  }

  public addItemId(id: string) {
    this.itemIds.push(id);
  }
}
