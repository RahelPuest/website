import { Container, Text } from "pixi.js";

export class DialogLine {
  private readonly textView: Text;
  private remainingMs: number;
  private isShown = false;

  constructor(opts: {
    text: string;
    x: number;
    y: number;
    durationMs: number;
  }) {
    this.remainingMs = opts.durationMs;

    this.textView = new Text({
      text: opts.text,
      style:{ fill: "#00b913", fontSize: 72, fontFamily: "ByteBounce" },
    });

    this.textView.anchor.set(0.5);
    this.textView.position.set(opts.x, opts.y);
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
      this.textView.removeFromParent();
      this.textView.destroy();
      this.isShown = false;
    }
  }

  public get alive(): boolean {
    return this.isShown;
  }
}
