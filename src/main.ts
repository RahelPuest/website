import {
  Application,
  Assets,
  Container,
  Rectangle,
  Sprite,
  TextureStyle,
} from "pixi.js";

import { Actor } from "./actor.ts";
import { Item } from "./item.ts";
import { DialogLine } from "./dialogLine.ts";

const VIRTUAL_WIDTH = 240;
const VIRTUAL_HEIGHT = 135;

const USE_INTEGER_SCALING = false;

let app: Application;
let world: Container;
let ui: Container;

let actor: Actor;
let item: Item;

const dialogLines: DialogLine[] = [];

let worldScale = 1;
let worldOffsetX = 0;
let worldOffsetY = 0;

function fitSpriteContain(sprite: Sprite, targetW: number, targetH: number): void {
  const tw = sprite.texture.width;
  const th = sprite.texture.height;

  if (tw <= 0 || th <= 0) return;

  const scale = Math.min(targetW / tw, targetH / th);
  sprite.scale.set(scale);
  sprite.position.set((targetW - tw * scale) / 2, (targetH - th * scale) / 2);
}

function worldToScreenX(wx: number): number {
  return worldOffsetX + wx * worldScale;
}

function worldToScreenY(wy: number): number {
  return worldOffsetY + wy * worldScale;
}

function applyResize(): void {
  const screenW = app.screen.width;
  const screenH = app.screen.height;

  const rawScale = Math.min(screenW / VIRTUAL_WIDTH, screenH / VIRTUAL_HEIGHT);
  worldScale = USE_INTEGER_SCALING ? Math.max(1, Math.floor(rawScale)) : rawScale;

  const worldPixelW = VIRTUAL_WIDTH * worldScale;
  const worldPixelH = VIRTUAL_HEIGHT * worldScale;

  worldOffsetX = (screenW - worldPixelW) / 2;
  worldOffsetY = (screenH - worldPixelH) / 2;

  world.scale.set(worldScale);
  world.position.set(worldOffsetX, worldOffsetY);

  // IMPORTANT: UI stays in screen coordinates, so do NOT scale or offset it.
  ui.scale.set(1);
  ui.position.set(0, 0);
}

function onWindowResize(): void {
  applyResize();
}

function addDialogLine(text: string, worldX: number, worldY: number, durationMs: number): void {
  const screenX = worldToScreenX(worldX);
  const screenY = worldToScreenY(worldY);

  const line = new DialogLine({ text, x: screenX, y: screenY, durationMs });
  line.show(ui);
  dialogLines.push(line);
}

function onWorldPointerDown(e: any): void {
  const p = world.toLocal(e.global);
  actor.setTarget(p.x, p.y);
}

function onItemPointerDown(): void {
  addDialogLine(
    "This Rahel person seems pretty awesome!",
    actor.view.position.x + 8,
    actor.view.position.y - 12,
    5000
  );
}

function onTick(time: any): void {
  actor.update(time.deltaMS / 1000);

  for (let i = 0; i < dialogLines.length; i += 1) {
    dialogLines[i].update(time.deltaMS);
  }
}

async function main(): Promise<void> {
  TextureStyle.defaultOptions.scaleMode = "nearest";

  app = new Application();
  await app.init({
    background: "#000000",
    resizeTo: window,
    antialias: false,
    autoDensity: true,
  });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  world = new Container();
  ui = new Container();

  app.stage.addChild(world);
  app.stage.addChild(ui);

  world.eventMode = "static";
  world.hitArea = new Rectangle(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  const backgroundTexture = await Assets.load("/assets/background.png");
  const sheet = await Assets.load("/assets/spritesheet.json");
  const paperTex = await Assets.load("/assets/paper.png");
  await Assets.load("/assets/fonts/ByteBounce.ttf");

  const background = new Sprite(backgroundTexture);
  background.anchor.set(0, 0);
  world.addChild(background);
  fitSpriteContain(background, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  actor = new Actor({
    sheet,
    walkAnimationName: "walk",
    idleAnimationName: "idle",
    x: VIRTUAL_WIDTH / 2,
    y: VIRTUAL_HEIGHT / 2,
    speed: 60,
    stopEps: 0.5,
    animationSpeed: 0.15,
  });

  item = new Item({
    stageTexture: paperTex,
    inventarTexture: paperTex,
    x: 180,
    y: 95,
  });

  world.addChild(actor.view);
  world.addChild(item.stageView);

  item.stageView.eventMode = "static";

  world.on("pointerdown", onWorldPointerDown);
  item.stageView.on("pointerdown", onItemPointerDown);

  applyResize();
  window.addEventListener("resize", onWindowResize);

  // Initial dialog: pass WORLD coordinates
  addDialogLine("Oh, how did I end up here?", 20, 20, 2000);

  app.ticker.add(onTick);
}

main();
