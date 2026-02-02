import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/website/" : "/",
  server: {
    port: 8080,
    open: true,
  },
}));
