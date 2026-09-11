import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";

const publicFiles = ["index.html", "styles.css", "storage.js", "app.js"];
const javascriptFiles = ["storage.js", "app.js", "scripts/build.mjs", "scripts/check.mjs"];

for (const file of javascriptFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr);
    process.exit(result.status ?? 1);
  }
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
