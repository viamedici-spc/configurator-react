import {defineConfig, type Rolldown, type UserConfig} from "tsdown";

/**
 * The declaration bundle keeps bare imports (`import "jotai-xstate";`) of modules whose types were all inlined or
 * dropped. They name no type, but they make a consumer's full type check load those packages' declarations, and
 * jotai-xstate's do not compile against current xstate. Nothing in this library relies on their side effects.
 */
const dropBareImportsFromDeclarations: Rolldown.Plugin = {
    name: "drop-bare-imports-from-declarations",
    renderChunk(code, chunk) {
        return chunk.fileName.endsWith(".d.ts") ? code.replace(/^import "[^"]+";\n/gm, "") : null;
    },
};

const config: UserConfig = defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    platform: "browser",
    target: "es2022",
    dts: {generator: "tsgo"},
    exports: true,
    plugins: [dropBareImportsFromDeclarations],
});

export default config;