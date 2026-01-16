import { AnimatedSprite, Spritesheet, Texture } from "pixi.js";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export class Actor {
  public readonly view: AnimatedSprite;

  private targetX: number;
  private targetY: number;

  private readonly speed: number;
  private readonly stopEps: number;

  private readonly walkTextures: Texture[];
  private readonly idleTextures: Texture[];

  private isMoving: boolean = false;

  constructor(opts: {
    sheet: Spritesheet;
    walkAnimationName: string;
    idleAnimationName: string;
    x: number;
    y: number;
    speed?: number;
    stopEps?: number;
    animationSpeed?: number;
  }) {
    const walkAnim = opts.sheet.animations[opts.walkAnimationName];
    if (!walkAnim) throw new Error(`Animation not found: ${opts.walkAnimationName}`);

    const idleAnim = opts.sheet.animations[opts.idleAnimationName];
    if (!idleAnim) throw new Error(`Animation not found: ${opts.idleAnimationName}`);

    this.walkTextures = walkAnim;
    this.idleTextures = idleAnim;

    // Start in idle (typischer)
    this.view = new AnimatedSprite(this.idleTextures);
    this.view.anchor.set(0.5);
    this.view.position.set(opts.x, opts.y);

    this.view.animationSpeed = opts.animationSpeed ?? 0.15;
    this.view.play(); // idle läuft

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

    const movingNow = dist > this.stopEps;

    if (movingNow) {
      if (!this.isMoving) {
        this.isMoving = true;
        this.switchToWalk();
      }

      const step = this.speed * dtSeconds;
      const t = Math.min(1, step / dist);

      this.view.x = lerp(this.view.x, this.targetX, t);
      this.view.y = lerp(this.view.y, this.targetY, t);
      return;
    }

    // stopped
    if (this.isMoving) {
      this.isMoving = false;
      this.switchToIdle();
    }

    this.view.position.set(this.targetX, this.targetY);
  }

  private switchToWalk(): void {
    // nur wechseln, wenn nicht eh schon walk gesetzt ist
    if (this.view.textures !== this.walkTextures) {
      this.view.textures = this.walkTextures;
      this.view.currentFrame = 0;
    }
    this.view.play();
  }

  private switchToIdle(): void {
    if (this.view.textures !== this.idleTextures) {
      this.view.textures = this.idleTextures;
      this.view.currentFrame = 0;
    }
    this.view.play();
  }

  private faceLeft(): void {
    this.view.scale.x = -Math.abs(this.view.scale.x);
  }

  private faceRight(): void {
    this.view.scale.x = Math.abs(this.view.scale.x);
  }
}
