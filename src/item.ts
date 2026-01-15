import { Sprite, Texture } from "pixi.js";

export class Item {
  public readonly stageView: Sprite;
  public readonly inventarView: Sprite;

  constructor(opts: {
    stageTexture: Texture;
    inventarTexture: Texture;
    x: number;
    y: number;
  }) {
    this.stageView = new Sprite(opts.stageTexture);
    this.inventarView = new Sprite(opts.inventarTexture);

    this.stageView.anchor.set(0.5);
    this.stageView.position.set(opts.x, opts.y);

    this.stageView.scale.set(5);

    this.stageView.eventMode = "static"
    this.stageView.cursor = "pointer";
  }
}
