import { Assets } from "pixi.js";
import type { Texture, Spritesheet } from "pixi.js";

export const officeBackgroundTexture = await Assets.load<Texture>(
  "assets/office_background.png",
);
export const officeBackgroundDarkTexture = await Assets.load<Texture>(
  "assets/office_background_dark.png",
);
export const officeBackgroundBlacklightTexture = await Assets.load<Texture>(
  "assets/office_background_blacklight.png",
);

export const sheet = await Assets.load<Spritesheet>("assets/spritesheet.json");

export const paperTexture = await Assets.load<Texture>("assets/paper.png");

export const lightSwitchOffTexture = await Assets.load<Texture>(
  "assets/lightSwitch.png",
);
export const lightSwitchOnTexture = await Assets.load<Texture>(
  "assets/lightSwitch_on.png",
);

export const routerOffTexture = await Assets.load<Texture>(
  "assets/router_off.png",
);
export const routerOnTexture = await Assets.load<Texture>(
  "assets/router_on.png",
);

export const faxMachineOffTexture =
  await Assets.load<Texture>("assets/fax_off.png");
export const faxMachineOnTexture =
  await Assets.load<Texture>("assets/fax_on.png");
export const faxMachinePrinting01Texture = await Assets.load<Texture>(
  "assets/fax_on_paper_01.png",
);
export const faxMachinePrinting02Texture = await Assets.load<Texture>(
  "assets/fax_on_paper_02.png",
);
export const faxMachinePrinting03Texture = await Assets.load<Texture>(
  "assets/fax_on_paper_03.png",
);
export const faxMachineIdleTexture = await Assets.load<Texture>(
  "assets/fax_on_idle.png",
);

export const bagClosedTexture = await Assets.load<Texture>(
  "assets/bag_closed.png",
);
export const bagOpenTexture = await Assets.load<Texture>("assets/bag_open.png");
export const bagEmptyTexture = await Assets.load<Texture>(
  "assets/bag_empty.png",
);

export const blacklightTexture = await Assets.load<Texture>(
  "assets/blacklight.png",
);

export const eyeIconTexture = await Assets.load<Texture>("assets/eye.png");
export const handIconTexture = await Assets.load<Texture>("assets/hand.png");
export const hammerIconTexture =
  await Assets.load<Texture>("assets/hammer.png");

export const byteBounceFont = await Assets.load("assets/fonts/ByteBounce.ttf");
