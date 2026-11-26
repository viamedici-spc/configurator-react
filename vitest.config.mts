import {defineConfig} from "vitest/config";

export default defineConfig({
    test: {
        environment: "jsdom",
        // fp-ts 2.x ships its ES modules without file extensions in their imports, which Node cannot load; Vite
        // transforms these packages instead (the README describes the same setting for applications).
        server: {deps: {inline: [/fp-ts/, /@viamedici-spc\//]}},
    },
});
