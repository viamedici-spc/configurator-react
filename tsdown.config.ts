import {defineConfig, type UserConfig} from "tsdown";

const config: UserConfig = defineConfig({
    entry: ["src/index.ts"],
    format: "esm",
    platform: "browser",
    target: "es2022",
    dts: {generator: "tsgo"},
    exports: true,
});

export default config;