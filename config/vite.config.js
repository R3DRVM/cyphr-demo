"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// config/vite.config.ts
var vite_1 = require("vite");
var plugin_react_1 = require("@vitejs/plugin-react");
var vite_plugin_node_polyfills_1 = require("vite-plugin-node-polyfills");
exports.default = (0, vite_1.defineConfig)({
    plugins: [
        (0, plugin_react_1.default)(),
        (0, vite_plugin_node_polyfills_1.nodePolyfills)({
            protocolImports: true,
        }),
    ],
    resolve: {
        alias: {
            buffer: 'buffer',
            process: 'process/browser',
        },
    },
    optimizeDeps: {
        include: [
            'buffer',
            'process',
            '@solana/web3.js',
            '@solana/spl-token',
            '@solana/spl-token-swap',
        ],
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
    },
    define: {
        'process.env': {},
    },
});
