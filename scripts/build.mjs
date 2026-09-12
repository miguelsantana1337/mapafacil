import { copyFile, cp, mkdir, writeFile } from "node:fs/promises";

const publicFiles = ["index.html", "styles.css", "storage.js", "app.js"];

await mkdir("dist", { recursive: true });
await Promise.all(
  publicFiles.map((file) => copyFile(file, `dist/${file}`)),
);
await cp("assets", "dist/assets", { recursive: true });
const publicConfig = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
};
await writeFile("dist/config.js", `window.__MASTER_MIND_CONFIG__ = ${JSON.stringify(publicConfig)};\n`);

console.log(`dist sincronizado (${publicFiles.length + 1} arquivos e identidade visual).`);
