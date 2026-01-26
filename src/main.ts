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
  insertVersion,
} from "pixi.js";

import { Actor } from "./actor.ts";
import { Item } from "./item.ts";
import { ScaleManager } from "./scaleManager.ts";
import { DialogManager } from "./dialogManager.ts";
import { Room } from "./room.ts";
import { ItemManager } from "./itemManager.ts";
import { VerbMenu } from "./verbMenu.ts";
import { GameContext } from "./context.ts";
import { RoomState } from "./roomState.ts";
import { ItemState } from "./itemState.ts";
import { Inventory } from "./inventory.ts";

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

let ctx: GameContext;

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
    switch(ctx.verb) {
      case "look": item.onLook?.(); break;
      case "pickup": item.onPickUp?.(); break;
      case "use": item.onUse?.(); break;
    }
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

  ctx = new GameContext(
    world,
    ui,
    dialogManager,
    scaleManager,
    itemManager
  );

  // Assets
  const backgroundTexture = await Assets.load("/assets/background.png");
  const nextBackgroundTexture = await Assets.load("/assets/background_next.png");

  const sheet = await Assets.load("/assets/spritesheet.json");
  const cvTexture = await Assets.load("/assets/paper.png");
  const lightSwitchOffTexture = await Assets.load("/assets/lightSwitch.png");
  const lightSwitchOnTexture = await Assets.load("/assets/lightSwitch_on.png")
  await Assets.load("/assets/fonts/ByteBounce.ttf");
  
  const eyeIcon = await Assets.load("/assets/eye.png");
  const handIcon = await Assets.load("/assets/hand.png");
  const hammerIcon = await Assets.load("/assets/hammer.png");

  const cvState = new ItemState({
    id: "cv",
    stageTexture: cvTexture,
    inventarTexture: cvTexture,    
  })

  cv = new Item({
    id: "cv",
    states: [cvState],
    startState: "cv",
    x: 160,
    y: 95,
    interactionPoint: new Point(150, 95),
    onLook: () => {
      ctx.dialogManager.addLine(actor, "This Rahel person seems pretty awesome!");
    },
    onPickUp: () => {
      ctx.dialogManager.addLine(actor, "I will take this.");
      inventory.pick(cv);
    },
    onUse: () => {
      ctx.dialogManager.addLine(actor, "Am I supposed to eat the CV or what?");
    }
  });
  itemManager.add(cv.id, cv);

  const lightSwitchOffState = new ItemState({
    id: "switch_off",
    stageTexture: lightSwitchOffTexture,
    inventarTexture: lightSwitchOffTexture,
  });

  const lightSwitchOnState = new ItemState({
    id: "switch_on",
    stageTexture: lightSwitchOnTexture,
    inventarTexture: lightSwitchOnTexture,
  });

  lightSwitch = new Item({
    id: "lightSwitch",
    states: [lightSwitchOffState, lightSwitchOnState],
    startState: "switch_off",
    x: 200,
    y: 70,
    interactionPoint: new Point(195, 80),
    onLook: () => {
      ctx.dialogManager.addLine(actor, "A strangely oversized light switch. Weird.");
    },
    onPickUp: () => {
      ctx.dialogManager.addLine(actor, "The switch is screwed in place. I can't take it with me.");
    },
    onUse: () => {
      if(lightSwitch.getStateId() == "switch_off") {
        room.setCurrentState("next_state");
        lightSwitch.setState("switch_on");
      } else {
        room.setCurrentState("start_state");
        lightSwitch.setState("switch_off"); 
      }
      ctx.dialogManager.addLine(actor, "Click!");
    }
  });
  itemManager.add(lightSwitch.id, lightSwitch);

  const startRoomState = new RoomState({
    id: "start_state",
    background: backgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["lightSwitch"],
  });

  const nextRoomState = new RoomState({
    id: "next_state",
    background: nextBackgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["cv", "lightSwitch"],
  });

  room = new Room({
    ctx: ctx,
    states: [startRoomState, nextRoomState],
    startState: "start_state",
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
    room: room,
  });

  world.addChild(actor.view);

  cv.stageView.eventMode = "static";

  world.on("pointerdown", onWorldPointerDown);
  cv.stageView.on("pointerdown", onItemPointerDown);
  lightSwitch.stageView.on("pointerdown", onItemPointerDown);

  scaleManager.applyResize(app.screen.width, app.screen.height);
  window.addEventListener("resize", onWindowResize);

  dialogManager.addLine(actor, "Oh, how did I end up here?");

  app.ticker.add(onTick);

  const verbMenu = new VerbMenu({
    ctx: ctx,
    eyeTexture: eyeIcon,
    handTexture: handIcon,
    hammerTexture: hammerIcon,
  });
  verbMenu.attach(world);

  const inventory = new Inventory({
    ctx: ctx,
  });
  inventory.attach(world);
}

main();
