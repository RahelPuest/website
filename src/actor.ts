import { AnimatedSprite, Spritesheet } from "pixi.js";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class Actor {
  public readonly view: AnimatedSprite;

  private targetX: number;
  private targetY: number;

  private readonly speed: number;
  private readonly stopEps: number;

  constructor(opts: {
    sheet: Spritesheet;
    animationName: string;
    x: number;
    y: number;
    speed?: number;
    stopEps?: number;
    animationSpeed?: number;
  }) {
    const anim = opts.sheet.animations[opts.animationName];
    if (!anim) throw new Error(`Animation not found: ${opts.animationName}`);

    this.view = new AnimatedSprite(anim);
    this.view.anchor.set(0.5);
    this.view.position.set(opts.x, opts.y);

    this.view.animationSpeed = opts.animationSpeed ?? 0.15;
    this.view.stop();

    this.targetX = opts.x;
    this.targetY = opts.y;

    this.speed = opts.speed ?? 400;
    this.stopEps = opts.stopEps ?? 0.5;
  }

  public setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;

    if (x < this.view.x) this.faceLeft();
    else if (x > this.view.x) this.faceRight();
  }

  public update(dtSeconds: number): void {
    const dx = this.targetX - this.view.x;
    const dy = this.targetY - this.view.y;
    const dist = Math.hypot(dx, dy);

    if (dist > this.stopEps) {
      if (!this.view.playing) this.view.play();

      const step = this.speed * dtSeconds;
      const t = Math.min(1, step / dist);

      this.view.x = lerp(this.view.x, this.targetX, t);
      this.view.y = lerp(this.view.y, this.targetY, t);
      return;
    }

    if (this.view.playing) this.view.stop();
    this.view.position.set(this.targetX, this.targetY);
  }

  private faceLeft(): void {
    this.view.scale.x = -Math.abs(this.view.scale.x);
  }

  private faceRight(): void {
    this.view.scale.x = Math.abs(this.view.scale.x);
  }
}
