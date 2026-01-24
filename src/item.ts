import { Sprite, Texture, Point } from "pixi.js";

const DEFAULT_INTERACTION_RADIUS = 16;

export class Item {
  public readonly stageView: Sprite;
  public readonly inventarView: Sprite;
  public readonly interactionPoint: Point;

  public readonly id: string;

  public onPickUp?: () => void;
  public onLook?: () => void;
  public onUse?: () => void;
  public onUseWith?: (other: Item) => void;

  constructor(opts: {
    id: string;

    stageTexture: Texture;
    inventarTexture: Texture;

    x: number;
    y: number;
    interactionPoint: Point;

    onPickUp?: () => void;
    onLook?: () => void;
    onUse?: () => void;
    onUseWith?: (other: Item | null) => void;
  }) {
    this.id = opts.id;

    this.stageView = new Sprite(opts.stageTexture);
    (this.stageView as any).__id = this.id; 
    this.inventarView = new Sprite(opts.inventarTexture);
    this.interactionPoint = opts.interactionPoint;

    this.onPickUp = opts.onPickUp;
    this.onLook = opts.onLook;
    this.onUse = opts.onUse;
    this.onUseWith = opts.onUseWith;

    this.stageView.anchor.set(0.5);
    this.stageView.position.set(opts.x, opts.y);

    this.stageView.scale.set(0.5);

    this.stageView.eventMode = "static"
    this.stageView.cursor = "pointer";
  }
}
