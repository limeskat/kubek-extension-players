import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { execSync } from "node:child_process";

console.log("Packaging extension com.kubek.players...");

// Ensure frontend bundle is built
execSync("node build.mjs", { stdio: "inherit" });

const archiveName = "com.kubek.players.kubekext";
if (fs.existsSync(archiveName)) {
  fs.unlinkSync(archiveName);
}

const targets = ['kubek-extension.json', 'package.json', 'backend', 'frontend', 'locales'];
if (fs.existsSync('icon.png')) {
  targets.push('icon.png');
}

// Collect all files recursively
function collectFiles(basePaths) {
  const result = [];
  for (const p of basePaths) {
    if (!fs.existsSync(p)) continue;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      function walk(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(currentDir, entry.name);
          if (entry.isDirectory()) {
            walk(full);
          } else if (entry.isFile()) {
            result.push(full);
          }
        }
      }
      walk(p);
    } else if (stat.isFile()) {
      result.push(p);
    }
  }
  return result;
}

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[i] = c;
}

function calcCrc32(buf) {
  if (typeof zlib.crc32 === 'function') return zlib.crc32(buf);
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function dosDateTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1)) & 0xFFFF;
  const d = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xFFFF;
  return { time, date: d };
}

function createZipArchive(filePaths, outputPath) {
  const localChunks = [];
  const centralEntries = [];
  let offset = 0;

  for (const filePath of filePaths) {
    const rawData = fs.readFileSync(filePath);
    const compressedData = zlib.deflateRawSync(rawData);
    const isDeflated = compressedData.length < rawData.length;
    const data = isDeflated ? compressedData : rawData;
    const method = isDeflated ? 8 : 0;
    const crc = calcCrc32(rawData);

    const normalizedName = filePath.split(path.sep).join('/');
    const nameBuf = Buffer.from(normalizedName, 'utf8');
    const mtime = fs.statSync(filePath).mtime;
    const { time, date } = dosDateTime(mtime);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(method, 8);
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(rawData.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localChunks.push(localHeader, nameBuf, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(method, 10);
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(rawData.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralEntries.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + data.length;
  }

  const centralDirOffset = offset;
  const centralDirSize = centralEntries.reduce((acc, b) => acc + b.length, 0);

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(filePaths.length, 8);
  eocd.writeUInt16LE(filePaths.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirOffset, 16);
  eocd.writeUInt16LE(0, 20);

  const finalZipBuffer = Buffer.concat([...localChunks, ...centralEntries, eocd]);
  fs.writeFileSync(outputPath, finalZipBuffer);
}

const fileList = collectFiles(targets);
createZipArchive(fileList, archiveName);

console.log(`\nSuccessfully created extension archive: ${archiveName}`);
console.log(`Archive size: ${(fs.statSync(archiveName).size / 1024).toFixed(1)} KB (${fileList.length} files)`);

