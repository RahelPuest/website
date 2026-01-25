import type { Container } from "pixi.js";
import type { DialogManager } from "./dialogManager";
import type { ItemManager } from "./itemManager";
import type { ScaleManager } from "./scaleManager";

export type Verb = "look" | "use" | "pickup";

export class GameContext {
  public verb: Verb;

  public constructor(
    public readonly world: Container,
    public readonly ui: Container,
    public readonly dialogManager: DialogManager,
    public readonly scaleManager: ScaleManager,
    public readonly itemManager: ItemManager,
    initialVerb: Verb = "pickup",
  ) {
    this.verb = initialVerb;
  }
}
