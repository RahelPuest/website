import { Point, Sprite, Texture, Container, Polygon } from "pixi.js";
import type { ScaleManager } from "./scaleManager";
import { ItemManager } from "./itemManager";
import { GameContext } from "./context";

export class Room {
  private ctx: GameContext;

  private background: Texture;
  private walkMask: Polygon;

  private backgroundSprite: Sprite;

  private itemIds: string[] = [];

  public constructor(opts: {
    ctx: GameContext;
    background: Texture;
    walkMask: Polygon;
    itemIds: string[];
  }) {
    this.ctx = opts.ctx;

    this.background = opts.background;
    this.walkMask = opts.walkMask;

    this.backgroundSprite = new Sprite(this.background);

    this.itemIds = opts.itemIds;

    this.refreshView();
  }

  public attach(world: Container) {
    world.addChild(this.backgroundSprite);

    this.itemIds.forEach((id) => {
      const item = this.ctx.itemManager.getById(id);
      if (!item) return;
      world.addChild(item.stageView);
    });
  }


  public isPassable(position: Point): boolean {
    return this.walkMask.contains(position.x, position.y);
  }

  private refreshView(): void {
    this.ctx.scaleManager.fitSpriteContain(this.backgroundSprite);
  }

  public addItemId(id: string) {
    this.itemIds.push(id);
  }
}
