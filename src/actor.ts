import { AnimatedSprite, Spritesheet, Texture, Point } from "pixi.js";
import type { Room } from "./room";

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

  private room: Room;

  constructor(opts: {
    sheet: Spritesheet;
    walkAnimationName: string;
    idleAnimationName: string;
    x: number;
    y: number;
    speed?: number;
    stopEps?: number;
    animationSpeed?: number;
    room: Room;
  }) {
    const walkAnim = opts.sheet.animations[opts.walkAnimationName];
    if (!walkAnim) throw new Error(`Animation not found: ${opts.walkAnimationName}`);

    const idleAnim = opts.sheet.animations[opts.idleAnimationName];
    if (!idleAnim) throw new Error(`Animation not found: ${opts.idleAnimationName}`);

    this.walkTextures = walkAnim;
    this.idleTextures = idleAnim;

    this.view = new AnimatedSprite(this.idleTextures);
    this.view.anchor._x = 0.5;
    this.view.anchor._y = 0.8;
    this.view.position.set(opts.x, opts.y);

    this.view.animationSpeed = opts.animationSpeed ?? 0.15;
    this.view.play();

    this.targetX = opts.x;
    this.targetY = opts.y;

    this.speed = opts.speed ?? 400;
    this.stopEps = opts.stopEps ?? 0.5;

    this.room = opts.room; // NEW
  }

  public setTarget(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;

    if (x < this.view.x) this.faceLeft();
    else if (x > this.view.x) this.faceRight();
  }

  public onTick(dtSeconds: number): void {
  const dx = this.targetX - this.view.x;
  const dy = this.targetY - this.view.y;
  const dist = Math.hypot(dx, dy);

  const movingNow = dist > this.stopEps;

  if (movingNow) {
    if (!this.isMoving) {
      this.isMoving = true;
      this.switchToWalk();
    }

    const prevX = this.view.x;
    const prevY = this.view.y;

    const step = this.speed * dtSeconds;
    const t = Math.min(1, step / dist);

    this.view.x = lerp(prevX, this.targetX, t);
    this.view.y = lerp(prevY, this.targetY, t);

    if (!this.room.isPassable(new Point(this.view.x, this.view.y))) {
      this.view.x = prevX;
      this.view.y = prevY;

      this.targetX = prevX;
      this.targetY = prevY;

      this.isMoving = false;
      this.switchToIdle();
    }

    return;
  }

  if (this.isMoving) {
    this.isMoving = false;
    this.switchToIdle();
  }

  this.view.position.set(this.targetX, this.targetY);
}

  private switchToWalk(): void {
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
