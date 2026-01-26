import { Container, Graphics, Texture, Sprite } from "pixi.js";
import type { GameContext, Verb } from "./context";

export class VerbMenu {
  private readonly ctx: GameContext;

  private readonly container: Container;
  private readonly bg: Graphics;

  private readonly icons: Record<Verb, Sprite>;

  public constructor(opts: {
    ctx: GameContext;
    eyeTexture: Texture;
    handTexture: Texture;
    hammerTexture: Texture;
  }) {
    this.ctx = opts.ctx;

    this.container = new Container();
    this.container.position.set(0, 0);

    this.bg = new Graphics();
    this.bg.rect(0, 0, 35, 10);
    this.bg.fill({ color: 0x222222, alpha: 0.8 });
    this.container.addChild(this.bg);

    this.icons = {
      look: this.setupIcon(opts.eyeTexture, "look", 5),
      pickup: this.setupIcon(opts.handTexture, "pickup", 15),
      use: this.setupIcon(opts.hammerTexture, "use", 25),
    };

    this.updateAlpha();
  }

  private setupIcon(texture: Texture, verb: Verb, x: number): Sprite {
    const s = new Sprite(texture);

    s.scale.set(0.25);
    s.position.set(x, 2);

    s.eventMode = "static";
    s.cursor = "pointer";

    s.on("pointerdown", (e) => {
      e.stopPropagation();
      this.ctx.verb = verb;
      this.updateAlpha();
    });

    this.container.addChild(s);
    return s;
  }

  private updateAlpha(): void {
    this.icons.look.alpha = this.ctx.verb === "look" ? 1.0 : 0.25;
    this.icons.pickup.alpha = this.ctx.verb === "pickup" ? 1.0 : 0.25;
    this.icons.use.alpha = this.ctx.verb === "use" ? 1.0 : 0.25;
  }

  public attach(world: Container): void {
    world.addChild(this.container);
  }


}
