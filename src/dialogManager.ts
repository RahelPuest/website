import { Container } from "pixi.js";
import { Actor } from "./actor";
import { DialogLine } from "./dialogLine";
import { ScaleManager } from "./scaleManager";

const DEFAULT_LINE_DURATION_MS = 2000;
const DEFAULT_VERTICAL_LINE_OFFSET = 256;

const SCREEN_MARGIN = 8;
const WRAP_SCREEN_FRACTION = 0.6;

export class DialogManager {
  private dialogLines = new Map<Actor, DialogLine[]>();
  private ui: Container;
  private scaleManager: ScaleManager;

  constructor(ui: Container, scaleManager: ScaleManager) {
    this.ui = ui;
    this.scaleManager = scaleManager;
  }

  public onTick(dtMs: number): void {
    for (const [actor, lines] of this.dialogLines) {
      for (const line of lines) {
        line.update(dtMs);
        if (line.alive) {
          this.placeLineNearActor(actor, line);
        }
      }

      const aliveLines = lines.filter((l) => l.alive);

      if (aliveLines.length === 0) {
        this.dialogLines.delete(actor);
      } else if (aliveLines.length !== lines.length) {
        this.dialogLines.set(actor, aliveLines);
      }
    }
  }

  public addLine(who: Actor, text: string): void {
    const line = new DialogLine({
      text,
      x: 0,
      y: 0,
      durationMs: DEFAULT_LINE_DURATION_MS,
    });

    line.show(this.ui);

    const maxW = Math.floor(
      this.scaleManager.screenWidth * WRAP_SCREEN_FRACTION,
    );
    if (maxW > 0) {
      line.setMaxWidth(maxW);
    }

    this.placeLineNearActor(who, line);

    const lines = this.dialogLines.get(who) ?? [];
    lines.push(line);
    this.dialogLines.set(who, lines);
  }

  private placeLineNearActor(actor: Actor, line: DialogLine): void {
    const p = this.scaleManager.worldToScreen(actor.view.x, actor.view.y);

    const sw = this.scaleManager.screenWidth;
    const sh = this.scaleManager.screenHeight;

    const halfW = line.width / 2;
    const halfH = line.height / 2;

    let x = p.x;
    let y = p.y - DEFAULT_VERTICAL_LINE_OFFSET;

    x = this.clamp(x, SCREEN_MARGIN + halfW, sw - SCREEN_MARGIN - halfW);
    y = this.clamp(y, SCREEN_MARGIN + halfH, sh - SCREEN_MARGIN - halfH);

    line.setPosition(x, y);
  }

  private clamp(v: number, min: number, max: number): number {
    if (max < min) return min;
    return Math.max(min, Math.min(max, v));
  }
}
