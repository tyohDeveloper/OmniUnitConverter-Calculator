import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { viteSingleFile } from "vite-plugin-singlefile";
import { pruneTranslations } from "./scripts/vite-plugin-prune-translations";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    tailwindcss(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
    pruneTranslations(),
    ...(process.env.NODE_ENV === "production" ? [viteSingleFile()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    hmr: false,
    allowedHosts: [".replit.dev", ".replit.app", ".repl.co"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    allowedHosts: [".replit.dev", ".replit.app", ".repl.co"],
    host: "0.0.0.0",
    port: 5000,
  },
});
