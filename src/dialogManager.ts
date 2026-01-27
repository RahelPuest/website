import { Container } from "pixi.js";
import { Actor } from "./actor";
import { DialogLine } from "./dialogLine";
import { ScaleManager } from "./scaleManager";

const DEFAULT_LINE_DURATION_MS = 2000;
const DEFAULT_VERTICAL_LINE_OFFEST = 256;

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
            const p = this.scaleManager.worldToScreen(actor.view.x, actor.view.y);

            line.setPosition(p.x, p.y - DEFAULT_VERTICAL_LINE_OFFEST);
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
    const p = this.scaleManager.worldToScreen(who.view.x, who.view.y);

    const line = new DialogLine({
      text,
      x: p.x,
      y: p.y - DEFAULT_VERTICAL_LINE_OFFEST,
      durationMs: DEFAULT_LINE_DURATION_MS,
    });

    line.show(this.ui);

    const lines = this.dialogLines.get(who) ?? [];
    lines.push(line);
    this.dialogLines.set(who, lines);
  }
}
