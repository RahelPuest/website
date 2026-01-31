import { Assets, Point, Polygon, Container } from "pixi.js";

import { Actor } from "./actor";
import { Item } from "./item";
import { Room } from "./room";
import { ItemManager } from "./itemManager";
import { VerbMenu } from "./verbMenu";
import { GameContext } from "./context";
import { RoomState } from "./roomState";
import { ItemState } from "./itemState";
import { Inventory } from "./inventory";

export type OfficeScene = {
  actor: Actor;
  room: Room;
  inventory: Inventory;
  verbMenu: VerbMenu;
  items: {
    cv: Item;
    lightSwitch: Item;
    router: Item;
    faxMachine: Item;
  };
};

let faxPrinted = false;

export async function createOfficeScene(opts: {
  ctx: GameContext;
  world: Container;
  ui: Container;
  itemManager: ItemManager;
  virtualWidth: number;
  virtualHeight: number;
}): Promise<OfficeScene> {
  const { ctx, world, itemManager, virtualWidth, virtualHeight } = opts;

  // Assets
  const backgroundTexture = await Assets.load("/assets/office_background.png");
  const nextBackgroundTexture = await Assets.load("/assets/background_next.png");

  const sheet = await Assets.load("/assets/spritesheet.json");

  const cvTexture = await Assets.load("/assets/paper.png");
  const lightSwitchOffTexture = await Assets.load("/assets/lightSwitch.png");
  const lightSwitchOnTexture = await Assets.load("/assets/lightSwitch_on.png");

  const routerOffTexture = await Assets.load("/assets/router_off.png");
  const routerOnTexture = await Assets.load("/assets/router_on.png");

  const faxMachineOffTexture = await Assets.load("/assets/fax_off.png");
  const faxMachineOnTexture = await Assets.load("/assets/fax_on.png");
  const faxMachinePrinting01Texture = await Assets.load("/assets/fax_on_paper_01.png");
  const faxMachinePrinting02Texture = await Assets.load("/assets/fax_on_paper_02.png");
  const faxMachinePrinting03Texture = await Assets.load("/assets/fax_on_paper_03.png");
  const faxMachineIdleTexture = await Assets.load("/assets/fax_on_idle.png");

  await Assets.load("/assets/fonts/ByteBounce.ttf");

  const eyeIcon = await Assets.load("/assets/eye.png");
  const handIcon = await Assets.load("/assets/hand.png");
  const hammerIcon = await Assets.load("/assets/hammer.png");

  let actor!: Actor;
  let room!: Room;

  const cvState = new ItemState({
    id: "cv",
    stageTexture: cvTexture,
    inventarTexture: cvTexture,
  });

  const cv = new Item({
    id: "cv",
    states: [cvState],
    startState: "cv",
    x: 160,
    y: 95,
    scale: 0.5,
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
    },
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

  const lightSwitch = new Item({
    id: "lightSwitch",
    states: [lightSwitchOffState, lightSwitchOnState],
    startState: "switch_off",
    x: 40,
    y: 70,
    scale: 0.5,
    interactionPoint: new Point(30, 80),
    onLook: () => {
      ctx.dialogManager.addLine(actor, "A strangely oversized light switch. Weird.");
    },
    onPickUp: () => {
      ctx.dialogManager.addLine(actor, "The switch is screwed in place. I can't take it with me.");
    },
    onUse: () => {
      if (lightSwitch.getStateId() === "switch_off") {
        room.setCurrentState("next_state");
        lightSwitch.setState("switch_on");
      } else {
        room.setCurrentState("start_state");
        lightSwitch.setState("switch_off");
      }
      ctx.dialogManager.addLine(actor, "Click!");
    },
  });
  itemManager.add(lightSwitch.id, lightSwitch);

  const routerOffState = new ItemState({
    id: "router_off",
    stageTexture: routerOffTexture,
    inventarTexture: routerOffTexture,
  });

  const routerOnState = new ItemState({
    id: "router_on",
    stageTexture: routerOnTexture,
    inventarTexture: routerOnTexture,
  });

  const router = new Item({
    id: "router",
    states: [routerOffState, routerOnState],
    startState: "router_off",
    x: 220,
    y: 80,
    scale: 1,
    interactionPoint: new Point(210, 80),
    onLook: () => {
      ctx.dialogManager.addLine(actor, "A Wi-Fi router. It seems to be off.");
    },
    onPickUp: () => {
      ctx.dialogManager.addLine(actor, "I don't need to take the router with me.");
    },
    onUse: () => {
      if (router.getStateId() === "router_off") {
        router.setState("router_on");
        ctx.dialogManager.addLine(actor, "The router is now on. I hope there's internet!");
        faxMachine.setState("fax_on");
      } else {
        router.setState("router_off");
        ctx.dialogManager.addLine(actor, "I turned the router off.");
        faxMachine.setState("fax_off");
      }
    },
  });
  itemManager.add(router.id, router);

  const faxMachineOffState = new ItemState({
    id: "fax_off",
    stageTexture: faxMachineOffTexture,
    inventarTexture: faxMachineOffTexture,
  });

  const faxMachineOnState = new ItemState({
    id: "fax_on",
    stageTexture: faxMachineOnTexture,
    inventarTexture: faxMachineOnTexture,
  });

  const faxMachinePrintingState = new ItemState({
    id: "fax_printing",
    stageTexture: faxMachinePrinting01Texture,
    inventarTexture: faxMachinePrinting01Texture,
  });

  const faxMachine = new Item({
    id: "faxMachine",
    states: [faxMachineOffState, faxMachineOnState, faxMachinePrintingState],
    startState: "fax_off",
    x: 200,
    y: 80,
    scale: 1,
    interactionPoint: new Point(185, 85),
    onLook: () => {
        if (faxMachine.getStateId() === "fax_off") {
            ctx.dialogManager.addLine(actor, "A fax machine thats not connected. Who even uses those anymore?");
        } 
        if (faxMachine.getStateId() === "fax_on") {
            ctx.dialogManager.addLine(actor, "It's connected now. Seems like there is a fax incoming.");
        }
        if (faxMachine.getStateId() === "fax_printing") {
            ctx.dialogManager.addLine(actor, "The fax machine is printing the incoming fax.");
        }
    },
    onPickUp: () => {
        if (!faxPrinted) {
            ctx.dialogManager.addLine(actor, "I don't need to take the fax machine with me.");
        } else {
            ctx.dialogManager.addLine(actor, "I should take the printed fax with me.");
            inventory.pick(cv);
            faxMachine.stageView.texture = faxMachineIdleTexture;
        }
    },
    onUse: () => {
      if (faxMachine.getStateId() === "fax_off") {
        faxMachine.setState("fax_on");
        ctx.dialogManager.addLine(actor, "Nothing happens. Its still not connected.");
      } 
      if (faxMachine.getStateId() === "fax_on") {
        ctx.dialogManager.addLine(actor, "Ohhhh it's printing.");
        faxMachine.setState("fax_printing");
        setTimeout(() => {
            faxMachine.stageView.texture = faxMachinePrinting02Texture;
        }, 500);
        setTimeout(() => {
            faxMachine.stageView.texture = faxMachinePrinting03Texture;
        }, 1500);
        setTimeout(() => {
            ctx.dialogManager.addLine(actor, "Whoa!");
            faxPrinted = true;
        }, 2000);
      }
    },
  });
  itemManager.add(faxMachine.id, faxMachine);

  // Room States danach
  const startRoomState = new RoomState({
    id: "start_state",
    background: backgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["lightSwitch", "router", "faxMachine"],
  });

  const nextRoomState = new RoomState({
    id: "next_state",
    background: nextBackgroundTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["cv", "lightSwitch"],
  });

  // Room jetzt erstellen und attachen, Items sind schon im Manager
  room = new Room({
    ctx,
    states: [startRoomState, nextRoomState],
    startState: "start_state",
  });
  room.attach(world);

  // Actor
  actor = new Actor({
    sheet,
    walkAnimationName: "walk",
    idleAnimationName: "idle",
    x: virtualWidth / 2,
    y: virtualHeight / 2 + 32,
    speed: 60,
    stopEps: 0.5,
    animationSpeed: 0.15,
    room,
  });
  world.addChild(actor.view);

  const inventory = new Inventory({ ctx });
  inventory.attach(world);

  const verbMenu = new VerbMenu({
    ctx,
    eyeTexture: eyeIcon,
    handTexture: handIcon,
    hammerTexture: hammerIcon,
  });
  verbMenu.attach(world);

  ctx.dialogManager.addLine(actor, "Oh, how did I end up here?");

  return {
    actor,
    room,
    inventory,
    verbMenu,
    items: { cv, lightSwitch, router, faxMachine },
  };
}
