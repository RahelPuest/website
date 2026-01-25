import { Container, Point, Sprite } from "pixi.js";
import type { GameContext } from "./context";
import type { RoomState } from "./roomState";

export class Room {
  private readonly ctx: GameContext;

  private readonly states = new Map<string, RoomState>();
  private currentStateId: string;

  private readonly root: Container;
  private readonly background: Sprite;

  private readonly itemsLayer: Container;

  public constructor(opts: {
    ctx: GameContext;
    states: RoomState[];
    startState: string;
  }) {
    this.ctx = opts.ctx;

    for (const s of opts.states) this.states.set(s.id, s);
    if (!this.states.has(opts.startState)) {
      throw new Error(`Unknown startState: ${opts.startState}`);
    }

    this.currentStateId = opts.startState;

    this.root = new Container();
    this.root.sortableChildren = true;

    const initial = this.getState(this.currentStateId);

    this.background = new Sprite(initial.background);
    this.background.zIndex = -100;
    this.root.addChild(this.background);

    this.itemsLayer = new Container();
    this.itemsLayer.zIndex = 0;
    this.root.addChild(this.itemsLayer);

    this.loadStateItems(initial);

    this.refreshView();
  }

  public attach(world: Container): void {
    if (!this.root.parent) world.addChild(this.root);
  }

  public isPassable(position: Point): boolean {
    const state = this.states.get(this.currentStateId);
    if (!state) return false;
    return state.walkMask.contains(position.x, position.y);
  }

  public addState(state: RoomState): void {
    this.states.set(state.id, state);
  }

  public setCurrentState(id: string): void {
    if (id === this.currentStateId) return;

    const next = this.getState(id);
    this.currentStateId = id;

    this.background.texture = next.background;
    this.loadStateItems(next);

    this.refreshView();
  }

  private loadStateItems(state: RoomState): void {
    this.itemsLayer.removeChildren();

    for (const id of state.itemIds) {
      const item = this.ctx.itemManager.getById(id);
      if (!item) continue;

      item.stageView.removeFromParent();

      this.itemsLayer.addChild(item.stageView);
    }
  }

  private refreshView(): void {
    this.ctx.scaleManager.fitSpriteContain(this.background);
  }

  private getState(id: string): RoomState {
    const s = this.states.get(id);
    if (!s) throw new Error(`RoomState not found: ${id}`);
    return s;
  }
}
