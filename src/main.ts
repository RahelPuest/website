import {
  Application,
  Container,
  Rectangle,
  TextureStyle,
  FederatedPointerEvent,
  Sprite,
} from "pixi.js";

import { Actor } from "./actor";
import { Item } from "./item";
import { ScaleManager } from "./scaleManager";
import { DialogManager } from "./dialogManager";
import { ItemManager } from "./itemManager";
import { GameContext } from "./context";

import { createOfficeScene } from "./officeScene";

const VIRTUAL_WIDTH = 240;
const VIRTUAL_HEIGHT = 135;
const USE_INTEGER_SCALING = true;

type SpriteWithId = Sprite & { __id?: string };

let app: Application;
let world: Container;
let ui: Container;

let actor: Actor;

let dialogManager: DialogManager;
let scaleManager: ScaleManager;
let itemManager: ItemManager;

let ctx: GameContext;

let cv: Item;
let lightSwitch: Item;
let router: Item;
let faxMachine: Item;
let blacklight: Item;
let bag: Item;
let picture: Item;

function onWindowResize(): void {
  scaleManager.applyResize(app.screen.width, app.screen.height);
  dialogManager.onResize();
}

function onWorldPointerDown(e: FederatedPointerEvent): void {
  actor.clearPendingAction();
  const p = world.toLocal(e.global);
  actor.setTarget(p.x, p.y);
}

function onItemPointerDown(e: FederatedPointerEvent): void {
  const sprite = e.currentTarget as SpriteWithId;
  const itemId = sprite.__id;
  if (!itemId) {
    e.stopPropagation();
    return;
  }

  const item = itemManager.getById(itemId);

  if (item) {
    actor.setTargetAndThen(
      item.interactionPoint.x,
      item.interactionPoint.y,
      () => {
        switch (ctx.verb) {
          case "look":
            item.onLook?.();
            break;
          case "pickup":
            item.onPickUp?.();
            break;
          case "use":
            item.onUse?.();
            break;
        }
      },
    );
  }

  e.stopPropagation();
}

function onTick(time: { deltaMS: number }): void {
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

  ctx = new GameContext(world, ui, dialogManager, scaleManager, itemManager);

  const scene = await createOfficeScene({
    ctx,
    world,
    ui,
    itemManager,
    virtualWidth: VIRTUAL_WIDTH,
    virtualHeight: VIRTUAL_HEIGHT,
  });

  actor = scene.actor;

  cv = scene.items.cv;
  lightSwitch = scene.items.lightSwitch;
  router = scene.items.router;
  faxMachine = scene.items.faxMachine;
  blacklight = scene.items.blacklight;
  bag = scene.items.bag;
  picture = scene.items.picture;

  world.on("pointerdown", onWorldPointerDown);

  cv.stageView.on("pointerdown", onItemPointerDown);
  lightSwitch.stageView.on("pointerdown", onItemPointerDown);
  router.stageView.on("pointerdown", onItemPointerDown);
  faxMachine.stageView.on("pointerdown", onItemPointerDown);
  blacklight.stageView.on("pointerdown", onItemPointerDown);
  bag.stageView.on("pointerdown", onItemPointerDown);
  picture.stageView.on("pointerdown", onItemPointerDown);

  scaleManager.applyResize(app.screen.width, app.screen.height);
  dialogManager.onResize();
  window.addEventListener("resize", onWindowResize);

  app.ticker.add(onTick);
}

main();
