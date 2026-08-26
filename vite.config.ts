import { defineConfig, type UserConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import type { ViteReactSSGOptions } from 'vite-react-ssg';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin(), tailwindcss()],
    server: {
        port: 59788,
    },
    ssgOptions: {
        script: 'async',
        formatting: 'none',
    },
} satisfies UserConfig & { ssgOptions: Partial<ViteReactSSGOptions> })
