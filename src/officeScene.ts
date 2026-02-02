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
    blacklight: Item;
    bag: Item;
  };
};

let faxPrinted = false;
let pinSeen = false;
let bagOpened = false;

export async function createOfficeScene(opts: {
  ctx: GameContext;
  world: Container;
  ui: Container;
  itemManager: ItemManager;
  virtualWidth: number;
  virtualHeight: number;
}): Promise<OfficeScene> {
  const { ctx, world, itemManager, virtualWidth, virtualHeight } = opts;

  const officeTexture = await Assets.load("assets/office_background.png");
  const darkOfficeTexture = await Assets.load(
    "assets/office_background_dark.png",
  );
  const blacklightOfficeTexture = await Assets.load(
    "assets/office_background_blacklight.png",
  );

  const sheet = await Assets.load("assets/spritesheet.json");

  const cvTexture = await Assets.load("assets/paper.png");
  const lightSwitchOffTexture = await Assets.load("assets/lightSwitch.png");
  const lightSwitchOnTexture = await Assets.load("assets/lightSwitch_on.png");

  const routerOffTexture = await Assets.load("assets/router_off.png");
  const routerOnTexture = await Assets.load("assets/router_on.png");

  const faxMachineOffTexture = await Assets.load("assets/fax_off.png");
  const faxMachineOnTexture = await Assets.load("assets/fax_on.png");
  const faxMachinePrinting01Texture = await Assets.load(
    "assets/fax_on_paper_01.png",
  );
  const faxMachinePrinting02Texture = await Assets.load(
    "assets/fax_on_paper_02.png",
  );
  const faxMachinePrinting03Texture = await Assets.load(
    "assets/fax_on_paper_03.png",
  );
  const faxMachineIdleTexture = await Assets.load("assets/fax_on_idle.png");

  const bagClosedTexture = await Assets.load("assets/bag_closed.png");
  const bagOpenTexture = await Assets.load("assets/bag_open.png");
  const bagEmptyTexture = await Assets.load("assets/bag_empty.png");

  const blacklightTexture = await Assets.load("assets/blacklight.png");

  await Assets.load("assets/fonts/ByteBounce.ttf");

  const eyeIcon = await Assets.load("assets/eye.png");
  const handIcon = await Assets.load("assets/hand.png");
  const hammerIcon = await Assets.load("assets/hammer.png");

  const refs = {
    actor: null as Actor | null,
    room: null as Room | null,
  };

  const inventory = new Inventory({ ctx });
  const verbMenu = new VerbMenu({
    ctx,
    eyeTexture: eyeIcon,
    handTexture: handIcon,
    hammerTexture: hammerIcon,
  });

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
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(a, "This Rahel person seems pretty awesome!");
    },
    onPickUp: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(a, "I will take this.");
      inventory.pick(cv);
    },
    onUse: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(a, "Am I supposed to eat the CV or what?");
    },
  });
  itemManager.add(cv.id, cv);

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
    x: 190,
    y: 80,
    scale: 1,
    interactionPoint: new Point(175, 85),
    onLook: () => {
      const a = refs.actor;
      if (!a) return;

      if (faxMachine.getStateId() === "fax_off") {
        ctx.dialogManager.addLine(
          a,
          "The fax machine is not connected. Who even uses those anymore?",
        );
      } else if (faxMachine.getStateId() === "fax_on") {
        ctx.dialogManager.addLine(
          a,
          "It's connected now. Seems like there is a pending fax.",
        );
      } else if (faxMachine.getStateId() === "fax_printing") {
        ctx.dialogManager.addLine(a, "The fax machine is printing.");
      }
    },
    onPickUp: () => {
      const a = refs.actor;
      if (!a) return;

      if (!faxPrinted) {
        ctx.dialogManager.addLine(
          a,
          "Why should i carry a fax machine with me?",
        );
      } else {
        ctx.dialogManager.addLine(a, "I should take the printed fax with me.");
        inventory.pick(cv);
        faxMachine.stageView.texture = faxMachineIdleTexture;
      }
    },
    onUse: () => {
      const a = refs.actor;
      if (!a) return;

      if (faxMachine.getStateId() === "fax_off") {
        faxMachine.setState("fax_on");
        ctx.dialogManager.addLine(
          a,
          "Nothing happens. Its still not connected.",
        );
        return;
      }

      if (faxMachine.getStateId() === "fax_on") {
        ctx.dialogManager.addLine(a, "Ohhhh it's printing.");
        faxMachine.setState("fax_printing");

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting02Texture;
        }, 500);

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting03Texture;
        }, 1500);

        setTimeout(() => {
          const a2 = refs.actor;
          if (!a2) return;
          ctx.dialogManager.addLine(a2, "Whoa!");
          faxPrinted = true;
        }, 2000);
      }
    },
  });
  itemManager.add(faxMachine.id, faxMachine);

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
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(a, "A Wi-Fi router. It seems to be off.");
    },
    onPickUp: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(a, "I don't need to take the router with me.");
    },
    onUse: () => {
      const a = refs.actor;
      if (!a) return;

      if (router.getStateId() === "router_off") {
        router.setState("router_on");
        ctx.dialogManager.addLine(
          a,
          "The router is now on. I hope there's internet!",
        );
        faxMachine.setState("fax_on");
      } else {
        router.setState("router_off");
        ctx.dialogManager.addLine(a, "I turned the router off.");
        faxMachine.setState("fax_off");
      }
    },
  });
  itemManager.add(router.id, router);

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
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(
        a,
        "A strangely oversized light switch. Weird.",
      );
    },
    onPickUp: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(
        a,
        "The switch is screwed in place. I can't take it with me.",
      );
    },
    onUse: () => {
      const a = refs.actor;
      const r = refs.room;
      if (!a || !r) return;

      if (lightSwitch.getStateId() === "switch_off") {
        r.setCurrentState("dark_state");
        lightSwitch.setState("switch_on");
      } else {
        r.setCurrentState("start_state");
        lightSwitch.setState("switch_off");
      }
      ctx.dialogManager.addLine(a, "Click!");
    },
  });
  itemManager.add(lightSwitch.id, lightSwitch);

  const blacklightState = new ItemState({
    id: "blacklight",
    stageTexture: blacklightTexture,
    inventarTexture: blacklightTexture,
  });

  const blacklight = new Item({
    id: "blacklight",
    states: [blacklightState],
    startState: "blacklight",
    x: 150,
    y: 110,
    scale: 1.0,
    interactionPoint: new Point(150, 110),
    onLook: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(
        a,
        "A blacklight. I wonder what I could use this for?",
      );
    },
    onPickUp: () => {
      const a = refs.actor;
      const r = refs.room;
      if (!a || !r) return;

      if (r.getCurrentStateId() === "start_state") {
        ctx.dialogManager.addLine(a, "I will take the blacklight with me.");
        inventory.pick(blacklight);
      }
    },
    onUse: () => {
      const a = refs.actor;
      const r = refs.room;
      if (!a || !r) return;

      if (r.getCurrentStateId() === "start_state") {
        ctx.dialogManager.addLine(
          a,
          "Its too bright to see anything with the blacklight.",
        );
      } else if (r.getCurrentStateId() === "dark_state") {
        ctx.dialogManager.addLine(
          a,
          "What?! Wo uses blacklight colored ink to hide a password? Psycho!",
        );
        r.setCurrentState("blacklight_state");
        setTimeout(() => {
          const r2 = refs.room;
          if (!r2) return;
          r2.setCurrentState("dark_state");
          pinSeen = true;
        }, 3000);
      }
    },
  });
  itemManager.add(blacklight.id, blacklight);

  const bagClosedState = new ItemState({
    id: "bag_closed",
    stageTexture: bagClosedTexture,
    inventarTexture: bagClosedTexture,
  });

  const bagOpenState = new ItemState({
    id: "bag_open",
    stageTexture: bagOpenTexture,
    inventarTexture: bagOpenTexture,
  });

  const bagEmptyState = new ItemState({
    id: "bag_empty",
    stageTexture: bagEmptyTexture,
    inventarTexture: bagEmptyTexture,
  });

  const bag = new Item({
    id: "bag",
    states: [bagClosedState, bagOpenState, bagEmptyState],
    startState: "bag_closed",
    x: 58,
    y: 84,
    scale: 1.0,
    interactionPoint: new Point(60, 100),
    onLook: () => {
      const a = refs.actor;
      if (!a) return;
      ctx.dialogManager.addLine(
        a,
        "My old document case. Guess who forgot the pin code?",
      );
    },
    onPickUp: () => {
      const a = refs.actor;
      if (!a) return;

      if (!bagOpened) {
        ctx.dialogManager.addLine(
          a,
          "The bag is locked. I need to open it first.",
        );
      } else {
        ctx.dialogManager.addLine(a, "I will take the documents with me.");
      }
    },
    onUse: () => {
      const a = refs.actor;
      if (!a) return;

      if (!pinSeen) {
        ctx.dialogManager.addLine(a, "Nah, i wont guess the pin code.");
      } else {
        bag.setState("bag_open");
        ctx.dialogManager.addLine(
          a,
          "The bag is now open. Maybe I should take the documents with me.",
        );
        bagOpened = true;
      }
    },
  });
  itemManager.add(bag.id, bag);

  const startRoomState = new RoomState({
    id: "start_state",
    background: officeTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["lightSwitch", "router", "faxMachine", "blacklight", "bag"],
  });

  const darkRoomState = new RoomState({
    id: "dark_state",
    background: darkOfficeTexture,
    walkMask: new Polygon([0, 80, 240, 80, 240, 135, 0, 135]),
    itemIds: ["lightSwitch"],
  });

  const blackRoomState = new RoomState({
    id: "blacklight_state",
    background: blacklightOfficeTexture,
    walkMask: new Polygon([0, 0, 0, 0, 0, 0, 0, 0]),
    itemIds: ["lightSwitch"],
  });

  const room = new Room({
    ctx,
    states: [startRoomState, darkRoomState, blackRoomState],
    startState: "start_state",
  });
  refs.room = room;

  const actor = new Actor({
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
  refs.actor = actor;

  room.attach(world);
  world.addChild(actor.view);

  inventory.attach(world);
  verbMenu.attach(world);

  ctx.dialogManager.addLine(actor, "Oh, how did I end up here?");

  return {
    actor,
    room,
    inventory,
    verbMenu,
    items: { cv, lightSwitch, router, faxMachine, blacklight, bag },
  };
}
