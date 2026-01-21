import { Renderer, Sprite, Texture } from "pixi.js";

export function textureToRgbaBytes(
  renderer: Renderer,
  texture: Texture
): { width: number; height: number; pixels: Uint8Array } {
  const sprite = new Sprite(texture);

  sprite.anchor.set(0, 0);
  sprite.position.set(0, 0);
  sprite.scale.set(1, 1);
  sprite.rotation = 0;

  const { pixels, width, height } = renderer.extract.pixels(sprite);
  sprite.destroy();

  // pixels ist Uint8ClampedArray in v8, aber Uint8Array view reicht dir.
  return { width, height, pixels: new Uint8Array(pixels.buffer) };
}
