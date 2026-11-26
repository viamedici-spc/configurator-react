import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

// Cross-origin isolation, as the configurator runs it in production.
const isolationHeaders = {
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Cross-Origin-Opener-Policy": "same-origin",
};

export default defineConfig({
    root: "wwwroot",
    base: "",
    server: {port: 3000},
    preview: {port: 4173, headers: isolationHeaders},
    build: {outDir: "../dist", emptyOutDir: true},
    // fp-ts ships ES modules that need Vite's resolution, also when they come from a linked workspace package.
    optimizeDeps: {include: ["fp-ts"]},
    plugins: [react()],
});
