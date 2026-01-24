import {
  Application,
  Assets,
  Container,
  Rectangle,
  TextureStyle,
  Polygon,
  Point,
  FederatedPointerEvent,
  Sprite,
} from "pixi.js";

import { Actor } from "./actor.ts";
import { Item } from "./item.ts";
import { ScaleManager } from "./scaleManager.ts";
import { DialogManager } from "./dialogManager.ts";
import { Room } from "./room.ts";
import { ItemManager } from "./itemManager.ts";

const VIRTUAL_WIDTH = 240;
const VIRTUAL_HEIGHT = 135;
const USE_INTEGER_SCALING = false;

let app: Application;
let world: Container;
let ui: Container;

let actor: Actor;
let cv: Item;
let lightSwitch: Item;

let dialogManager: DialogManager;
let scaleManager: ScaleManager;
let itemManager: ItemManager;

let room: Room;

type Verbs = "look" | "use" | "pickup";

function onWindowResize(): void {
  scaleManager.applyResize(app.screen.width, app.screen.height);
}

function onWorldPointerDown(e: any): void {
  const p = world.toLocal(e.global);
  actor.setTarget(p.x, p.y);
}

function onItemPointerDown(e: FederatedPointerEvent): void {
  const sprite = e.currentTarget as Sprite;
  const itemId = (sprite as any).__id as string;
  const item = itemManager.getById(itemId);
  if(item) {
    actor.setTarget(item.interactionPoint.x, item.interactionPoint.y);
    dialogManager.addLine(actor, "This Rahel person seems pretty awesome!");
  }
  e.stopPropagation();
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
  itemManager = new ItemManager();

  world.eventMode = "static";
  world.hitArea = new Rectangle(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

  // Assets
  const backgroundTexture = await Assets.load("/assets/background.png");
  const sheet = await Assets.load("/assets/spritesheet.json");
  const cvTexture = await Assets.load("/assets/paper.png");
  const lightSwitchTexture = await Assets.load("/assets/lightSwitch.png")
  await Assets.load("/assets/fonts/ByteBounce.ttf");

  cv = new Item({
    id: "cv",
    stageTexture: cvTexture,
    inventarTexture: cvTexture,
    x: 160,
    y: 95,
    interactionPoint: new Point(150, 95),
  });
  itemManager.add(cv.id, cv);

  lightSwitch = new Item({
    id: "lightSwitch",
    stageTexture: lightSwitchTexture,
    inventarTexture: lightSwitchTexture,
    x: 200,
    y: 70,
    interactionPoint: new Point(200, 90),
  });
  itemManager.add(lightSwitch.id, lightSwitch);

  room = new Room({
    background: backgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    scaleManager: scaleManager,
    itemManager: itemManager,
    itemIds: ["cv", "lightSwitch"],
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

  world.addChild(actor.view);

  cv.stageView.eventMode = "static";

  world.on("pointerdown", onWorldPointerDown);
  cv.stageView.on("pointerdown", onItemPointerDown);

  scaleManager.applyResize(app.screen.width, app.screen.height);
  window.addEventListener("resize", onWindowResize);

  dialogManager.addLine(actor, "Oh, how did I end up here?");

  app.ticker.add(onTick);
}

main();
