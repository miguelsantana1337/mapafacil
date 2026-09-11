import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const publicFiles = ["index.html", "styles.css", "storage.js", "app.js"];
const javascriptFiles = ["storage.js", "app.js", "config.js", "scripts/build.mjs", "scripts/check.mjs"];

for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
}

const builtConfig = await readFile("dist/config.js", "utf8");
if (!builtConfig.startsWith("window.__MASTER_MIND_CONFIG__ = ")) {
  console.error("dist/config.js não contém uma configuração pública válida.");
  process.exit(1);
}

for (const file of publicFiles) {
  const [source, distribution] = await Promise.all([
    readFile(file),
    readFile(`dist/${file}`),
  ]);

  if (!source.equals(distribution)) {
    console.error(`${file} diverge de dist/${file}. Execute npm run build.`);
    process.exit(1);
  }
}

console.log("JavaScript válido e dist sincronizado.");
