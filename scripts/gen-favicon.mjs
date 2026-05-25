import sharp from "sharp";
import { writeFileSync } from "fs";

// SVG design matching icon.tsx: blue #3db6e8 bg + white "E" + white dot
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="12" fill="#3db6e8"/>
  <text x="20" y="48" font-family="-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif" font-weight="900" font-size="46" fill="white" letter-spacing="-2">E</text>
  <circle cx="46" cy="42" r="4" fill="white"/>
</svg>`;

// Generate PNGs at 16, 32, 48 px for ICO container
const sizes = [16, 32, 48];
const pngs = await Promise.all(
  sizes.map(s => sharp(Buffer.from(svg)).resize(s, s).png().toBuffer())
);

// Build ICO container (ICONDIR + ICONDIRENTRY + PNG data)
const headerSize = 6;
const entrySize = 16;
const numImages = sizes.length;
let offset = headerSize + entrySize * numImages;

// ICONDIR (6 bytes)
const header = Buffer.alloc(headerSize);
header.writeUInt16LE(0, 0);       // reserved
header.writeUInt16LE(1, 2);       // type = ICO
header.writeUInt16LE(numImages, 4); // image count

// ICONDIRENTRY for each image (16 bytes each)
const entries = sizes.map((size, i) => {
  const entry = Buffer.alloc(entrySize);
  entry.writeUInt8(size === 256 ? 0 : size, 0); // width
  entry.writeUInt8(size === 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2);                       // num colors (0 = no palette)
  entry.writeUInt8(0, 3);                       // reserved
  entry.writeUInt16LE(1, 4);                    // color planes
  entry.writeUInt16LE(32, 6);                   // bits per pixel
  entry.writeUInt32LE(pngs[i].length, 8);       // PNG data size
  entry.writeUInt32LE(offset, 12);              // PNG data offset
  offset += pngs[i].length;
  return entry;
});

const ico = Buffer.concat([header, ...entries, ...pngs]);
writeFileSync("src/app/favicon.ico", ico);
console.log("✅ favicon.ico generated:", ico.length, "bytes");
