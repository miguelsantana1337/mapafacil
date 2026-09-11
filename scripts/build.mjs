import { copyFile, mkdir } from "node:fs/promises";

const publicFiles = ["index.html", "styles.css", "storage.js", "app.js"];

await mkdir("dist", { recursive: true });
await Promise.all(
  publicFiles.map((file) => copyFile(file, `dist/${file}`)),
);

console.log(`dist sincronizado (${publicFiles.length} arquivos).`);
