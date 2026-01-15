import {
  Application,
  Assets,
  Rectangle,
  TextureStyle,
  Text,
} from "pixi.js";

import { Actor } from "./actor.ts";
import { Item } from "./item.ts";
import { DialogLine } from "./dialogLine.ts";

(async () => {
  const dialogLines: DialogLine[] = [];

  TextureStyle.defaultOptions.scaleMode = "nearest";

  const app = new Application();
  await app.init({ background: "#330825", resizeTo: window });

  await Assets.load("/assets/fonts/ByteBounce.ttf");
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const sheet = await Assets.load("/assets/spritesheet.json");

  const actor = new Actor({
    sheet,
    animationName: "walk",
    x: app.screen.width / 2,
    y: app.screen.height / 2,
    speed: 400,
    stopEps: 0.5,
    animationSpeed: 0.15,
  });

  const paperTex = await Assets.load("/assets/paper.png");

  const item = new Item({
    stageTexture: paperTex,
    inventarTexture: paperTex, 
    x: 600,
    y: 500,
  });

  app.stage.addChild(actor.view);
  app.stage.addChild(item.stageView);

  app.stage.eventMode = "static";
  app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

  console.log(app.screen.width, app.screen.height
  )

  app.stage.on("pointerdown", (e) => {
    actor.setTarget(e.global.x, e.global.y);
  });

  const dialogLine = new DialogLine({
    text: "Oh, how did I end up here?",
    x: 500,
    y: 500,
    durationMs: 2000,
  });
  dialogLine.show(app.stage);
  dialogLines.push(dialogLine);

  window.addEventListener("resize", () => {
    app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
  });

  item.stageView.on("pointerdown", (e) => {
    const dialogLine = new DialogLine({
      text: "This Rahel person seems pretty awesome!",
      x: 500,
      y: 500,
      durationMs: 2000,
    });
    dialogLine.show(app.stage);
    dialogLines.push(dialogLine);
  })



  app.ticker.add((time) => {
    actor.update(time.deltaMS / 1000);
    dialogLines.forEach(line => {
      line.update(time.deltaMS);  
    });
  });
})();
