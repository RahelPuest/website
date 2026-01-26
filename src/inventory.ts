import { Container, Graphics, FederatedPointerEvent } from "pixi.js";
import { GameContext } from "./context";
import { Item } from "./item";

export class Inventory {
  private readonly ctx: GameContext;

  private readonly container: Container;
  private readonly bg: Graphics;

  private readonly items: Item[] = [];
  private readonly iconSpacing = 14;

  public constructor(opts: { ctx: GameContext }) {
    this.ctx = opts.ctx;

    this.container = new Container();
    this.container.position.set(40, 0);

    this.bg = new Graphics();
    this.bg.rect(0, 0, 240, 10);
    this.bg.fill({ color: 0x222222, alpha: 0.8 });
    this.container.addChild(this.bg);
  }

  public attach(world: Container): void {
    world.addChild(this.container);
  }

  public pick(item: Item): void {
    if (this.items.some((i) => i.id === item.id)) return;

    this.items.push(item);

    item.stageView.eventMode = "none";
    item.stageView.renderable = false;
    item.stageView.visible = false;
    item.stageView.parent?.removeChild(item.stageView);

    const icon = item.inventarView;
    icon.parent?.removeChild(icon);

    icon.anchor.set(0, 0);
    icon.eventMode = "static";
    icon.cursor = "pointer";

    icon.position.set(4 + (this.items.length - 1) * this.iconSpacing, 2);
    icon.scale.set(0.5);

    (icon as any).__id = item.id;

    icon.on("pointerdown", (e: FederatedPointerEvent) => {
      switch (this.ctx.verb) {
        case "look":
          item.onLook?.();
          break;
        case "use":
          item.onUse?.();
          break;
        case "pickup":
          item.onPickUp?.();
          break;
      }
      
      e.stopPropagation();
    });

    this.container.addChild(icon);
  }
}
