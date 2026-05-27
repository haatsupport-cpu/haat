import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import process from "node:process";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [react()],

    // ============================================
    // Build Optimization
    // ============================================
    build: {
      // Minify with Terser
      minify: "terser",

      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            vendor: [
              "react",
              "react-dom",
              "react-router-dom",
              "axios",
            ],

            // UI / Icons
            ui: ["lucide-react", "react-icons"],

            // Animations
            animations: ["framer-motion"],
          },
        },
      },

      // CSS code splitting
      cssCodeSplit: true,

      // Reduce log output
      reportCompressedSize: false,
    },

    // ============================================
    // Development Server
    // ============================================
    server: {
      port: 5173,
      host: "0.0.0.0",
      strictPort: false,

      // Proxy API requests to backend during development
      proxy: {
        "/api": {
          target: "http://localhost:5000",
          changeOrigin: true,
          secure: false,
        },
      },

      // Enhanced HMR configuration
      hmr: (() => {
        // Detect cloud/container environments
        const isCloudEnvironment =
          process.env.CODESPACES === "true" ||
          process.env.GITHUB_CODESPACES === "true" ||
          process.env.DEVCONTAINER === "true";

        if (isCloudEnvironment) {
          return {
            protocol: "wss",
            host:
              process.env.VITE_DEV_SERVER_HOSTNAME ||
              "localhost",
            port: parseInt(
              process.env.VITE_DEV_SERVER_PORT || "443"
            ),
          };
        }

        // Local development
        return {
          protocol: "ws",
          host: "localhost",
          port: undefined,
        };
      })(),
    },
  };
});
