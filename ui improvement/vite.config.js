import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const MEDIA_EXTENSIONS = new Set([".mp4", ".webm", ".ogg", ".m4v", ".mov"]);
const MB = 1024 * 1024;

function copyBackgroundMediaPlugin() {
  const projectRoot = __dirname;
  const repoRoot = path.resolve(projectRoot, "..");
  const mediaDirectories = [
    {
      source: path.resolve(repoRoot, "video"),
      destination: "video",
      maxAssetBytes: 14 * MB,
      maxFiles: 6,
    },
    {
      source: path.resolve(repoRoot, "contact"),
      destination: "contact-media",
      maxAssetBytes: 12 * MB,
      maxFiles: 5,
    },
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
        const mediaFiles = entries
          .filter(
            (entry) =>
              entry.isFile() && MEDIA_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
          )
          .map((entry) => ({
            name: entry.name,
            sourcePath: path.join(directory.source, entry.name),
          }));

        const filesWithStats = await Promise.all(
          mediaFiles.map(async (file) => ({
            ...file,
            size: (await fs.stat(file.sourcePath)).size,
          }))
        );

        const filteredFiles = filesWithStats
          .filter((file) => file.size <= directory.maxAssetBytes)
          .sort((left, right) => left.size - right.size)
          .slice(0, directory.maxFiles);

        const selectedFiles = (filteredFiles.length > 0 ? filteredFiles : filesWithStats)
          .sort((left, right) =>
            left.name.localeCompare(right.name, undefined, { sensitivity: "base" })
          )
          .map((file) => file.name);

        const targetDir = path.join(outDir, directory.destination);
        await fs.rm(targetDir, { recursive: true, force: true });
        await fs.mkdir(targetDir, { recursive: true });

        for (const fileName of selectedFiles) {
          await fs.copyFile(
            path.join(directory.source, fileName),
            path.join(targetDir, fileName)
          );
        }

        await fs.writeFile(
          path.join(targetDir, "index.json"),
          JSON.stringify({ videos: selectedFiles }, null, 2),
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
