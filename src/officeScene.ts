import { Point, Polygon, Container } from "pixi.js";

import { Actor } from "./actor";
import { Item } from "./item";
import { Room } from "./room";
import { ItemManager } from "./itemManager";
import { VerbMenu } from "./verbMenu";
import { GameContext } from "./context";
import { RoomState } from "./roomState";
import { ItemState } from "./itemState";
import { Inventory } from "./inventory";
import { loadOfficeAssets } from "./officeAssets";

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
    picture: Item;
  };
};

type OfficeSceneState = {
  isFaxPrinted: boolean;
  isPinSeen: boolean;
  isBagOpened: boolean;

  isRouterOn: boolean;
  isFaxPoweredOn: boolean;
  isFaxConnected: boolean;
  isFaxPrinting: boolean;

  isRoomDark: boolean;
  isCvTaken: boolean;
};

export const walkMask = new Polygon([
  40, 80, 2, 80, 2, 130, 238, 130, 238, 80, 200, 80, 200, 86, 180, 86, 180, 80,
  105, 80, 105, 100, 40, 100,
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

  const state: OfficeSceneState = {
    isFaxPrinted: false,
    isPinSeen: false,
    isBagOpened: false,

    isRouterOn: false,
    isFaxPoweredOn: false,
    isFaxConnected: false,
    isFaxPrinting: false,

    isRoomDark: false,
    isCvTaken: false,
  };

  const assets = await loadOfficeAssets();

  const {
    officeTexture,
    darkOfficeTexture,
    blacklightOfficeTexture,
    sheet,
    cvTexture,
    projectsTexture,
    lightSwitchOffTexture,
    lightSwitchOnTexture,
    routerOffTexture,
    routerOnTexture,
    faxMachineOffTexture,
    faxMachineOnTexture,
    faxMachinePrinting01Texture,
    faxMachinePrinting02Texture,
    faxMachinePrinting03Texture,
    faxMachineIdleTexture,
    bagClosedTexture,
    bagOpenTexture,
    bagEmptyTexture,
    blacklightTexture,
    pictureTexture,
    eyeIcon,
    handIcon,
    hammerIcon,
  } = assets;

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
      if(!state.isCvTaken) {
        say("Am I supposed to eat the CV or what?");
        return;
      }
      say("This beauty will go directly onto the evidence board.");
      room.addItemIdToCurrentState("picture");
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
      say("How shut i use this? Build a paper plane out of it and fly it? Nah, that would be a waste.");
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
      if (!state.isFaxConnected) {
        say("The fax machine is not connected. Who even uses those anymore?");
      } else if (state.isFaxPrinting) {
        say("The fax machine is printing.");
      } else {
        say("It's connected now. Seems like there is a pending fax.");
      }
    },
    onPickUp: () => {
      if (!state.isFaxPrinted) {
        say("Why should i carry a fax machine with me?");
      } else {
        say("I should take the printed fax with me.");
        inventory.pick(cv);
        faxMachine.stageView.texture = faxMachineIdleTexture;
        state.isCvTaken = true;
      }
    },
    onUse: () => {
      if (!state.isFaxPoweredOn) {
        state.isFaxPoweredOn = true;
        state.isFaxConnected = state.isRouterOn;

        faxMachine.setState("fax_on");

        if (!state.isFaxConnected) {
          say("Nothing happens. Its still not connected.");
        }
        return;
      }

      if (state.isFaxConnected && !state.isFaxPrinting && !state.isFaxPrinted) {
        say("Ohhhh it's printing.");
        state.isFaxPrinting = true;

        faxMachine.setState("fax_printing");

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting02Texture;
        }, 500);

        setTimeout(() => {
          faxMachine.stageView.texture = faxMachinePrinting03Texture;
        }, 1500);

        setTimeout(() => {
          say("Whoa!");
          state.isFaxPrinted = true;
          state.isFaxPrinting = false;
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
      if (!state.isRouterOn) {
        state.isRouterOn = true;

        router.setState("router_on");
        say("The router is now on. I hope there's internet!");

        faxMachine.setState("fax_on");
        state.isFaxConnected = true;
      } else {
        state.isRouterOn = false;

        router.setState("router_off");
        say("I turned the router off.");

        state.isFaxConnected = false;
        state.isFaxPoweredOn = false;
        state.isFaxPrinting = false;
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

      if (!state.isRoomDark) {
        state.isRoomDark = true;
        r.setCurrentState("dark_state");
        lightSwitch.setState("switch_on");
      } else {
        state.isRoomDark = false;
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
      if (!state.isRoomDark) {
        say("I will take the blacklight with me.");
        inventory.pick(blacklight);
      }
    },
    onUse: () => {
      const r = refs.room;
      if (!r) return;

      if (!state.isRoomDark) {
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
          state.isPinSeen = true;
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
      if (!state.isBagOpened) {
        say("The bag is locked. I need to open it first.");
      } else {
        say("I will take the documents with me.");
        inventory.pick(projects);
      }
    },
    onUse: () => {
      if (!state.isPinSeen) {
        say("Nah, i wont guess the pin code.");
      } else {
        bag.setState("bag_open");
        say("The bag is now open. Maybe I should take the documents with me.");
        state.isBagOpened = true;
      }
    },
  });
  itemManager.add(bag.id, bag);

  const pictureBrightState = new ItemState({
    id: "picture_bright",
    stageTexture: pictureTexture,
    inventarTexture: pictureTexture,
  });

  const picture = new Item({
    id: "picture",
    states: [pictureBrightState],
    startState: "picture_bright",
    x: 111,
    y: 47,
    scale: 1,
    interactionPoint: new Point(120, 60),
    onLook: () => {
      say("Wow, this Rahel person look awsome in this picture!");
    },
    onPickUp: () => {
      say("I don't think I should take this picture with me.");
    },
    onUse: () => {
      say("I don't see why I should use this picture.");
    },
  });
  itemManager.add(picture.id, picture);

  const startRoomState = new RoomState({
    id: "start_state",
    background: officeTexture,
    walkMask: walkMask,
    itemIds: [
      "lightSwitch",
      "router",
      "faxMachine",
      "blacklight",
      "bag",
    ],
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
    items: {
      cv,
      projects,
      lightSwitch,
      router,
      faxMachine,
      blacklight,
      bag,
      picture,
    },
  };
}
