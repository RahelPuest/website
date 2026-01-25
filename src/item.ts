import { Sprite, Point } from "pixi.js";
import { ItemState } from "./itemState";

export class Item {
  public readonly stageView: Sprite;
  public readonly inventarView: Sprite;
  public readonly interactionPoint: Point;

  public readonly id: string;

  public onPickUp?: () => void;
  public onLook?: () => void;
  public onUse?: () => void;
  public onUseWith?: (other: Item | null) => void;

  private readonly states = new Map<string, ItemState>();
  private currentStateId: string;

  public constructor(opts: {
    id: string;

    x: number;
    y: number;
    interactionPoint: Point;

    states: ItemState[];
    startState: string;

    onPickUp?: () => void;
    onLook?: () => void;
    onUse?: () => void;
    onUseWith?: (other: Item | null) => void;
  }) {
    this.id = opts.id;
    this.interactionPoint = opts.interactionPoint;

    this.onPickUp = opts.onPickUp;
    this.onLook = opts.onLook;
    this.onUse = opts.onUse;
    this.onUseWith = opts.onUseWith;

    if (opts.states.length === 0) {
      throw new Error(`Item ${opts.id} must have at least one state.`);
    }

    for (const s of opts.states) {
      this.states.set(s.id, s);
    }

    const start = this.getStateOrThrow(opts.startState);
    this.currentStateId = start.id;

    this.stageView = new Sprite(start.stageTexture);
    (this.stageView as any).__id = this.id;

    this.inventarView = new Sprite(start.inventarTexture);

    this.stageView.anchor.set(0.5);
    this.stageView.position.set(opts.x, opts.y);
    this.stageView.scale.set(0.5);

    this.stageView.eventMode = "static";
    this.stageView.cursor = "pointer";
  }

  public addState(state: ItemState): void {
    this.states.set(state.id, state);
  }

  public getStateId(): string {
    return this.currentStateId;
  }

  public setState(id: string): void {
    if (id === this.currentStateId) return;

    const next = this.getStateOrThrow(id);
    this.currentStateId = next.id;

    this.stageView.texture = next.stageTexture;
    this.inventarView.texture = next.inventarTexture;
  }

  private getStateOrThrow(id: string): ItemState {
    const s = this.states.get(id);
    if (!s) throw new Error(`ItemState not found: ${this.id}:${id}`);
    return s;
  }
}
