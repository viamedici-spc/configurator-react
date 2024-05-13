import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {createHtmlPlugin} from 'vite-plugin-html';
import checker from 'vite-plugin-checker';
import macros from "vite-plugin-babel-macros";

export default defineConfig(({command, mode}) => ({
    root: "wwwroot",
    server: {
        port: 3000
    },
    build: {
        outDir: "../dist",
        emptyOutDir: true,
        commonjsOptions: {
            ignoreTryCatch: false
        },
        minify: true
    },
    base: "",
    plugins: [
        macros(),
        checker({typescript: true}),
        react({
            fastRefresh: mode === "hot"
        }),
        createHtmlPlugin(),
    ]
}));