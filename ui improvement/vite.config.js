import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const MEDIA_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".m4v", ".mov"]);

function copyBackgroundMediaPlugin() {
  const projectRoot = __dirname;
  const repoRoot = path.resolve(projectRoot, "..");
  const mediaDirectories = [
    { source: path.resolve(repoRoot, "video"), destination: "video" },
    { source: path.resolve(repoRoot, "contact"), destination: "contact-media" },
  ];

  return {
    name: "copy-background-media",
    async writeBundle(outputOptions) {
      const outDir = path.resolve(projectRoot, outputOptions.dir || "dist");

      for (const directory of mediaDirectories) {
        if (!existsSync(directory.source)) {
          continue;
        }

        const entries = await fs.readdir(directory.source, { withFileTypes: true });
        const files = entries
          .filter(
            (entry) =>
              entry.isFile() && MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
          )
          .map((entry) => entry.name)
          .sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" }));

        const targetDir = path.join(outDir, directory.destination);
        await fs.mkdir(targetDir, { recursive: true });

        for (const fileName of files) {
          await fs.copyFile(
            path.join(directory.source, fileName),
            path.join(targetDir, fileName)
          );
        }

        await fs.writeFile(
          path.join(targetDir, "index.json"),
          JSON.stringify({ videos: files }, null, 2),
          "utf8"
        );
      }
    },
  };
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  logLevel: "error",
  plugins: [react(), copyBackgroundMediaPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": "http://127.0.0.1:5000",
      "/static": "http://127.0.0.1:5000",
      "/video": "http://127.0.0.1:5000",
      "/contact-media": "http://127.0.0.1:5000",
    },
  },
});
