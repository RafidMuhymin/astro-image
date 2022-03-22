// @ts-check
import fs from "fs";
import { fsCachePath } from "../../runtimeChecks.js";

const copied = [];
let assetsDirExists;

export async function getCachedBuffer(hash, image) {
  const cacheFilePath = fsCachePath + hash;

  if (fs.existsSync(cacheFilePath)) {
    return fs.promises.readFile(cacheFilePath);
  }

  const buffer = await image.clone().toBuffer();

  await fs.promises.writeFile(cacheFilePath, buffer);

  return buffer;
}

export async function saveAndCopyAsset(
  hash,
  image,
  buffer,
  outDir,
  assetsDir,
  assetPath
) {
  const src = fsCachePath + hash;

  const dest = `${outDir}${assetPath}`;

  if (copied.includes(assetPath)) return;

  if (!assetsDirExists) {
    await fs.promises.mkdir(outDir + assetsDir, { recursive: true });

    assetsDirExists = true;
  }

  await fs.promises.copyFile(src, dest).catch(async (error) => {
    if (error.code === "ENOENT") {
      const imageBuffer = buffer || (await image.toBuffer());

      await Promise.all(
        [src, dest].map(async (dir) => {
          await fs.promises.writeFile(dir, imageBuffer);
        })
      );
    } else {
      throw error;
    }
  });

  copied.push(assetPath);
}
