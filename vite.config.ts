import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  base: command === "build" ? "/website/" : "/",
  server: {
    port: 8080,
    open: "/",
  },
  plugins: [
    {
      name: "dev-rewrite-website-prefix",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url && req.url.startsWith("/website/")) {
            req.url = req.url.replace(/^\/website/, "");
          }
          next();
        });
      },
    },
  ],
}));
