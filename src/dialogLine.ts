import { Container, Text, Point, TextStyle } from "pixi.js";

export class DialogLine {
  private readonly textView: Text;
  private remainingMs: number;
  private isShown = false;

  // Font sizes should be defined in virtual pixels and then scaled by the scene scale.
  private readonly baseFontSize: number;
  private currentScale = 1;

  constructor(opts: {
    text: string;
    x: number;
    y: number;
    durationMs: number;
    baseFontSize: number;
    scale: number;
  }) {
    this.remainingMs = opts.durationMs;

    this.baseFontSize = opts.baseFontSize;
    this.currentScale = this.clampScale(opts.scale);

    this.textView = new Text({
      text: opts.text,
      style: {
        fill: "#00b913",
        fontFamily: "ByteBounce",
        fontSize: Math.max(1, this.baseFontSize * this.currentScale),
      },
    });

    this.textView.anchor.set(0.5);
    this.textView.position.set(opts.x, opts.y);
  }

  public setScale(scale: number): void {
    const nextScale = this.clampScale(scale);
    if (nextScale === this.currentScale) return;
    this.currentScale = nextScale;

    const style = this.textView.style as TextStyle;
    style.fontSize = Math.max(1, this.baseFontSize * this.currentScale);
    this.textView.style = style;
  }

  private clampScale(scale: number): number {
    if (!Number.isFinite(scale)) return 1;
    return Math.max(0.01, scale);
  }

  public show(parent: Container): void {
    if (this.isShown) return;
    parent.addChild(this.textView);
    this.isShown = true;
  }

  public update(dtMs: number): void {
    if (!this.isShown) return;

    this.remainingMs -= dtMs;

    if (this.remainingMs <= 0) {
      this.remainingMs = 0;
      this.textView.removeFromParent();
      this.textView.destroy();
      this.isShown = false;
    }
  }

  public setPosition(x: number, y: number): void {
    this.textView.position.set(x, y);
  }

  public setMaxWidth(maxWidth: number): void {
    const style = this.textView.style as TextStyle;
    style.wordWrap = true;
    style.wordWrapWidth = Math.max(10, maxWidth);
    this.textView.style = style;
  }

  public get alive(): boolean {
    return this.remainingMs > 0;
  }

  public get position(): Point {
    return this.textView.position;
  }

  public get width(): number {
    return this.textView.width;
  }

  public get height(): number {
    return this.textView.height;
  }
}
