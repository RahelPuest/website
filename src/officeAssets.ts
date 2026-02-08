import { Assets, Spritesheet, Texture } from "pixi.js";

export type OfficeAssets = {
  officeTexture: Texture;
  darkOfficeTexture: Texture;
  blacklightOfficeTexture: Texture;
  sheet: Spritesheet;
  cvTexture: Texture;
  projectsTexture: Texture;
  lightSwitchOffTexture: Texture;
  lightSwitchOnTexture: Texture;
  routerOffTexture: Texture;
  routerOnTexture: Texture;
  faxMachineOffTexture: Texture;
  faxMachineOnTexture: Texture;
  faxMachinePrinting01Texture: Texture;
  faxMachinePrinting02Texture: Texture;
  faxMachinePrinting03Texture: Texture;
  faxMachineIdleTexture: Texture;
  bagClosedTexture: Texture;
  bagOpenTexture: Texture;
  bagEmptyTexture: Texture;
  blacklightTexture: Texture;
  pictureTexture: Texture;
  eyeIcon: Texture;
  handIcon: Texture;
  hammerIcon: Texture;
  byteBounceFont: unknown;
};

const OFFICE_BUNDLE_NAME = "office";

let isBundleRegistered = false;

function ensureOfficeBundleRegistered(): void {
  if (isBundleRegistered) return;
  isBundleRegistered = true;

  Assets.addBundle(OFFICE_BUNDLE_NAME, {
    officeTexture: "assets/office_background.png",
    darkOfficeTexture: "assets/office_background_dark.png",
    blacklightOfficeTexture: "assets/office_background_blacklight.png",
    sheet: "assets/spritesheet.json",

    cvTexture: "assets/paper.png",
    projectsTexture: "assets/projects.png",

    lightSwitchOffTexture: "assets/lightSwitch_on.png",
    lightSwitchOnTexture: "assets/lightSwitch_off.png",

    routerOffTexture: "assets/router_off.png",
    routerOnTexture: "assets/router_on.png",

    faxMachineOffTexture: "assets/fax_off.png",
    faxMachineOnTexture: "assets/fax_on.png",
    faxMachinePrinting01Texture: "assets/fax_on_paper_01.png",
    faxMachinePrinting02Texture: "assets/fax_on_paper_02.png",
    faxMachinePrinting03Texture: "assets/fax_on_paper_03.png",
    faxMachineIdleTexture: "assets/fax_on_idle.png",

    bagClosedTexture: "assets/bag_closed.png",
    bagOpenTexture: "assets/bag_open.png",
    bagEmptyTexture: "assets/bag_empty.png",

    blacklightTexture: "assets/blacklight.png",
    pictureTexture: "assets/picture.png",

    byteBounceFont: "assets/fonts/ByteBounce.ttf",

    eyeIcon: "assets/eye.png",
    handIcon: "assets/hand.png",
    hammerIcon: "assets/hammer.png",
  });
}

export async function loadOfficeAssets(): Promise<OfficeAssets> {
  ensureOfficeBundleRegistered();

  const loaded = await Assets.loadBundle(OFFICE_BUNDLE_NAME);
  return loaded as OfficeAssets;
}
