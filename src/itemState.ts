import type { Texture } from "pixi.js";

export class ItemState {
  public readonly id: string;
  public readonly stageTexture: Texture;
  public readonly inventarTexture: Texture;

  public constructor(opts: {
    id: string;
    stageTexture: Texture;
    inventarTexture: Texture;
  }) {
    this.id = opts.id;
    this.stageTexture = opts.stageTexture;
    this.inventarTexture = opts.inventarTexture;
  }
}
