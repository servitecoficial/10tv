const fs = require("fs");
const path = require("path");

const root = process.cwd();
const inputPath = process.argv[2]
    ? path.resolve(root, process.argv[2])
    : path.join(root, "canales.txt");
const outputPath = process.argv[3]
    ? path.resolve(root, process.argv[3])
    : path.join(root, "files", "canales-convertido.m3u");

const raw = fs.readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/);

let currentGroup = "VARIOS";
const output = ["#EXTM3U"];

for (const originalLine of lines) {
    const line = originalLine.trim();

    if (!line) {
        continue;
    }

    if (line.startsWith("#EXTM3U")) {
        continue;
    }

    if (line.startsWith("#EXTINF")) {
        output.push(line);
        continue;
    }

    if (/^group,/i.test(line)) {
        currentGroup = line.split(",").slice(1).join(",").trim() || "VARIOS";
        continue;
    }

    if (/^https?:/i.test(line)) {
        output.push(line);
        continue;
    }

    const parts = line.split(",");
    if (parts.length < 3) {
        continue;
    }

    const sourceTag = (parts[0] || "").trim();
    const url = (parts[parts.length - 1] || "").trim();
    const name = parts.slice(1, -1).join(",").trim() || sourceTag || "Canal";

    if (!/^https?:/i.test(url)) {
        continue;
    }

    output.push(`#EXTINF:-1 tvg-name="${escapeAttr(name)}" group-title="${escapeAttr(currentGroup)}" source-tag="${escapeAttr(sourceTag)}",${name}`);
    output.push(url);
}

fs.writeFileSync(outputPath, `${output.join("\n")}\n`);
console.log(`Convertido: ${path.relative(root, outputPath)}`);

function escapeAttr(value) {
    return String(value || "").replace(/"/g, "'");
}
