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
    projects: Item;
    lightSwitch: Item;
    router: Item;
    faxMachine: Item;
    blacklight: Item;
    bag: Item;
  };
};

let isFaxPrinted = false;
let isPinSeen = false;
let isBagOpened = false;

let isRouterOn = false;
let isFaxPoweredOn = false;
let isFaxConnected = false;
let isFaxPrinting = false;

let isRoomDark = false;

export const walkMask = new Polygon([
  40, 80, 
  2, 80, 
  2, 130, 
  238, 130, 
  238, 80, 
  200, 80, 
  200, 86, 
  180, 86, 
  180, 80,
  105, 80, 
  105, 100, 
  40, 100,
]);

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
  const projectsTexture = await Assets.load("assets/projects.png");

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

  const say = (line: string, who?: Actor | null): void => {
    const a = who ?? refs.actor;
    if (!a) return;
    ctx.dialogManager.addLine(a, line);
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
      say("This Rahel person seems pretty awesome!");
    },
    onPickUp: () => {
      say("I will take this.");
      inventory.pick(cv);
    },
    onUse: () => {
      say("Am I supposed to eat the CV or what?");
    },
  });
  itemManager.add(cv.id, cv);

  const projectsState = new ItemState({
    id: "projects",
    stageTexture: projectsTexture,
    inventarTexture: projectsTexture,
  });

  const projects = new Item({
    id: "projects",
    states: [projectsState],
    startState: "projects",
    x: 180,
    y: 95,
    scale: 0.5,
    interactionPoint: new Point(170, 95),
    onLook: () => {
      say("This Rahel person did so much cools stuff! I wish i was her.");
    },
    onPickUp: () => {
      say("I will take this.");
      inventory.pick(projects);
    },
    onUse: () => {
      say("Am I supposed to eat the projects or what?");
    },
  });
  itemManager.add(projects.id, projects);

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
      if (!isFaxConnected) {
        say("The fax machine is not connected. Who even uses those anymore?");
      } else if (isFaxPrinting) {
        say("The fax machine is printing.");
      } else {
        say("It's connected now. Seems like there is a pending fax.");
      }
    },
    onPickUp: () => {
      if (!isFaxPrinted) {
        say("Why should i carry a fax machine with me?");
      } else {
        say("I should take the printed fax with me.");
        inventory.pick(cv);
        faxMachine.stageView.texture = faxMachineIdleTexture;
      }
    },
    onUse: () => {
      if (!isFaxPoweredOn) {
        isFaxPoweredOn = true;
        isFaxConnected = isRouterOn;

        faxMachine.setState("fax_on");

        if (!isFaxConnected) {
          say("Nothing happens. Its still not connected.");
        }
        return;
      }

      if (isFaxConnected && !isFaxPrinting && !isFaxPrinted) {
        say("Ohhhh it's printing.");
        isFaxPrinting = true;

        faxMachine.setState("fax_printing");

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting02Texture;
        }, 500);

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting03Texture;
        }, 1500);

        setTimeout(() => {
          say("Whoa!");
          isFaxPrinted = true;
          isFaxPrinting = false;
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
      say("A Wi-Fi router. It seems to be off.");
    },
    onPickUp: () => {
      say("I don't need to take the router with me.");
    },
    onUse: () => {
      if (!isRouterOn) {
        isRouterOn = true;

        router.setState("router_on");
        say("The router is now on. I hope there's internet!");

        faxMachine.setState("fax_on");
        isFaxConnected = isFaxPoweredOn;
      } else {
        isRouterOn = false;

        router.setState("router_off");
        say("I turned the router off.");

        isFaxConnected = false;
        isFaxPoweredOn = false;
        isFaxPrinting = false;
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
      say("A strangely oversized light switch. Weird.");
    },
    onPickUp: () => {
      say("The switch is screwed in place. I can't take it with me.");
    },
    onUse: () => {
      const r = refs.room;
      if (!r) return;

      if (!isRoomDark) {
        isRoomDark = true;
        r.setCurrentState("dark_state");
        lightSwitch.setState("switch_on");
      } else {
        isRoomDark = false;
        r.setCurrentState("start_state");
        lightSwitch.setState("switch_off");
      }

      say("Click!");
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
    x: 170,
    y: 110,
    scale: 0.5,
    interactionPoint: new Point(160, 110),
    onLook: () => {
      say("A blacklight. I wonder what I could use this for?");
    },
    onPickUp: () => {
      if (!isRoomDark) {
        say("I will take the blacklight with me.");
        inventory.pick(blacklight);
      }
    },
    onUse: () => {
      const r = refs.room;
      if (!r) return;

      if (!isRoomDark) {
        say("Its too bright to see anything with the blacklight.");
      } else {
        say(
          "What?! Wo uses blacklight colored ink to hide a password? Psycho!",
        );

        r.setCurrentState("blacklight_state");

        setTimeout(() => {
          const r2 = refs.room;
          if (!r2) return;

          r2.setCurrentState("dark_state");
          isPinSeen = true;
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
    y: 83.5,
    scale: 1.0,
    interactionPoint: new Point(60, 100),
    onLook: () => {
      say("My old document case. Guess who forgot the pin code?");
    },
    onPickUp: () => {
      if (!isBagOpened) {
        say("The bag is locked. I need to open it first.");
      } else {
        say("I will take the documents with me.");
        inventory.pick(projects);
      }
    },
    onUse: () => {
      if (!isPinSeen) {
        say("Nah, i wont guess the pin code.");
      } else {
        bag.setState("bag_open");
        say("The bag is now open. Maybe I should take the documents with me.");
        isBagOpened = true;
      }
    },
  });
  itemManager.add(bag.id, bag);

  const startRoomState = new RoomState({
    id: "start_state",
    background: officeTexture,
    walkMask: walkMask,
    itemIds: ["lightSwitch", "router", "faxMachine", "blacklight", "bag"],
  });

  const darkRoomState = new RoomState({
    id: "dark_state",
    background: darkOfficeTexture,
    walkMask: walkMask,
    itemIds: ["lightSwitch"],
  });

  const blackRoomState = new RoomState({
    id: "blacklight_state",
    background: blacklightOfficeTexture,
    walkMask: walkMask,
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

  say("Oh, how did I end up here?");

  return {
    actor,
    room,
    inventory,
    verbMenu,
    items: { cv, projects, lightSwitch, router, faxMachine, blacklight, bag },
  };
}
