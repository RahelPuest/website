import { Application, Assets, Rectangle, AnimatedSprite, TextureStyle } from "pixi.js";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

(async () => {
  TextureStyle.defaultOptions.scaleMode = 'nearest'

  const app = new Application();
  await app.init({ background: "#bb1085", resizeTo: window });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const sheet = await Assets.load("/assets/spritesheet.json");
  const actor = new AnimatedSprite(sheet.animations["walk"]);
  actor.anchor.set(0.5);
  actor.position.set(app.screen.width / 2, app.screen.height / 2);
  actor.animationSpeed = 0.15; // tweak
  actor.stop(); // idle initially
  app.stage.addChild(actor);

  app.stage.eventMode = "static";
  app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);

  let targetX = actor.x;
  let targetY = actor.y;

  app.stage.on("pointerdown", (e) => {
    targetX = e.global.x;
    targetY = e.global.y;
  });

  window.addEventListener("resize", () => {
    app.stage.hitArea = new Rectangle(0, 0, app.screen.width, app.screen.height);
  });

  const speed = 400; // px per second
  const stopEps = 0.5;

  app.ticker.add((time) => {
  const dt = time.deltaMS / 1000;
    const step = speed * dt;

    const dx = targetX - actor.x;
    const dy = targetY - actor.y;
    const dist = Math.hypot(dx, dy);

    const moving = dist > stopEps;


    if (moving) {
      if (!actor.playing) actor.play();

      const t = Math.min(1, step / dist);
      actor.x = lerp(actor.x, targetX, t);
      actor.y = lerp(actor.y, targetY, t);
    } else {
      if (actor.playing) actor.stop();
      actor.position.set(targetX, targetY);
    }
  });
})();
