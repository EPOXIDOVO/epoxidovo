import sharp from "sharp";
import { writeFileSync, readFileSync } from "fs";

const sourcePng = readFileSync("/Users/puska/epoxidovo/src/app/icon.png");

const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map(s => sharp(sourcePng).resize(s, s).png().toBuffer())
);

const headerSize = 6;
const entrySize = 16;
const numImages = sizes.length;
let offset = headerSize + entrySize * numImages;

const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(numImages, 4);

const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(entrySize);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(pngs[i].length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += pngs[i].length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync("src/app/favicon.ico", ico);
console.log("✅ favicon.ico:", ico.length, "bytes");
