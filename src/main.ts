import {
  Application,
  Assets,
  Container,
  Rectangle,
  TextureStyle,
  Polygon,
} from "pixi.js";

import { Actor } from "./actor.ts";
import { Item } from "./item.ts";
import { ScaleManager } from "./scaleManager.ts";
import { DialogManager } from "./dialogManager.ts";
import { Room } from "./room.ts";

const VIRTUAL_WIDTH = 240;
const VIRTUAL_HEIGHT = 135;
const USE_INTEGER_SCALING = false;

let app: Application;
let world: Container;
let ui: Container;

let actor: Actor;
let item: Item;

let dialogManager: DialogManager;
let scaleManager: ScaleManager;

let room: Room;

function onWindowResize(): void {
  scaleManager.applyResize(app.screen.width, app.screen.height);
}

function onWorldPointerDown(e: any): void {
  const p = world.toLocal(e.global);
  actor.setTarget(p.x, p.y);
}

function onItemPointerDown(): void {
  dialogManager.addLine(actor, "This Rahel person seems pretty awesome!");
}

function onTick(time: any): void {
  actor.onTick(time.deltaMS / 1000);
  dialogManager.onTick(time.deltaMS);
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

  scaleManager = new ScaleManager({
    virtualWidth: VIRTUAL_WIDTH,
    virtualHeight: VIRTUAL_HEIGHT,
    useIntegerScaling: USE_INTEGER_SCALING,
  });
  scaleManager.bind(world, ui);

  dialogManager = new DialogManager(ui, scaleManager);

  world.eventMode = "static";
  world.hitArea = new Rectangle(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Assets
  const backgroundTexture = await Assets.load("/assets/background.png");
  //const walkMaskTexture = await Assets.load("/assets/walkMask.png");
  const sheet = await Assets.load("/assets/spritesheet.json");
  const paperTex = await Assets.load("/assets/paper.png");
  await Assets.load("/assets/fonts/ByteBounce.ttf");

  // Room handles background sprite internally
  room = new Room({
    background: backgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    scaleManager: scaleManager,
  });
  room.attach(world);

  actor = new Actor({
    sheet,
    walkAnimationName: "walk",
    idleAnimationName: "idle",
    x: VIRTUAL_WIDTH / 2,
    y: VIRTUAL_HEIGHT / 2 + 32,
    speed: 60,
    stopEps: 0.5,
    animationSpeed: 0.15,
    scaleManager: scaleManager,
    dialogManager: dialogManager,
    room: room,
  });

  item = new Item({
    stageTexture: paperTex,
    inventarTexture: paperTex,
    x: 160,
    y: 95,
  });

  world.addChild(actor.view);
  world.addChild(item.stageView);

  item.stageView.eventMode = "static";

  world.on("pointerdown", onWorldPointerDown);
  item.stageView.on("pointerdown", onItemPointerDown);

  scaleManager.applyResize(app.screen.width, app.screen.height);
  window.addEventListener("resize", onWindowResize);

  dialogManager.addLine(actor, "Oh, how did I end up here?");

  app.ticker.add(onTick);
}

main();
