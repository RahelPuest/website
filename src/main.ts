import {
  Application,
  Assets,
  Rectangle,
  TextureStyle,
  Text,
} from "pixi.js";

import { Actor } from "./actor.ts";

(async () => {
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

  app.stage.addChild(actor.view);

  app.stage.eventMode = "static";
  app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

  console.log(app.screen.width, app.screen.height
  )

  app.stage.on("pointerdown", (e) => {
    actor.setTarget(e.global.x, e.global.y);
  });

  const myText = new Text({
    text: "Oh, how did I end up here?",
    style: { fill: "#00b913", fontSize: 72, fontFamily: "ByteBounce" },
  });
  myText.anchor.set(0.5);
  myText.position.set(500, 300);
  app.stage.addChild(myText);

  window.addEventListener("resize", () => {
    app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
  });

  app.ticker.add((time) => {
    actor.update(time.deltaMS / 1000);
  });
})();
