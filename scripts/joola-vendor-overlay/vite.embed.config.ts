import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const dir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isQo = mode === "qo";
  const base = isQo ? "/joola-proto/qo/" : "/joola-proto/round5/";
  const outDir = path.resolve(
    dir,
    isQo ? "../../public/joola-proto/qo" : "../../public/joola-proto/round5",
  );

  return {
    plugins: [react()],
    base,
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: {
        input: path.resolve(dir, "index-embed.html"),
      },
    },
    define: {
      "import.meta.env.VITE_APP": JSON.stringify(isQo ? "qo" : "round5"),
    },
  };
});
