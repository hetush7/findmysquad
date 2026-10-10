import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  resolve: {
    // bare imports like "components/RoomChat" resolve from src/ (as with CRA's baseUrl)
    alias: [{ find: /^(api|assets|components|utils|views)\//, replacement: `${src}/$1/` }],
  },
  // our components use JSX in .js files
  esbuild: { loader: "jsx", include: /src\/.*\.js$/, exclude: [] },
  optimizeDeps: { esbuildOptions: { loader: { ".js": "jsx" } } },
  // keep the REACT_APP_ prefix so existing .env files keep working
  envPrefix: ["VITE_", "REACT_APP_"],
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 4 / Paper Kit use Sass features Dart Sass now flags as deprecated; they still compile fine
        quietDeps: true,
        silenceDeprecations: ["import", "global-builtin", "color-functions", "mixed-decls", "slash-div", "abs-percent"],
      },
    },
  },
  server: { host: "0.0.0.0", port: 3000, strictPort: true },
  preview: { host: "0.0.0.0", port: 3000 },
  build: { outDir: "build" },
});
