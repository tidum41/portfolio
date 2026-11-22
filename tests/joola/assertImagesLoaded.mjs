/**
 * Fail if any loaded <img> in the page and descendant frames has naturalWidth === 0.
 */
export async function assertAllImagesLoaded(page) {
  const broken = await collectBrokenImages(page.mainFrame());
  if (broken.length > 0) {
    throw new Error(
      `Broken images (naturalWidth 0): ${broken.slice(0, 12).join("; ")}${broken.length > 12 ? ` (+${broken.length - 12} more)` : ""}`,
    );
  }
}

async function collectBrokenImages(frame) {
  const local = await frame.evaluate(() => {
    const out = [];
    for (const img of document.querySelectorAll("img")) {
      const complete = img.complete;
      const nw = img.naturalWidth;
      if (!complete) continue;
      if (nw === 0 && img.getAttribute("src")) {
        out.push(img.currentSrc || img.src);
      }
    }
    return out;
  });

  let all = [...local];
  for (const child of frame.childFrames()) {
    all = all.concat(await collectBrokenImages(child));
  }
  return all;
}

/** Wait for images in all frames to finish loading (or timeout). */
export async function waitForImages(page, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const pending = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll("img")];
      return imgs.some((img) => !img.complete);
    });
    if (!pending) break;
    await page.waitForTimeout(200);
  }
  const frameDeadline = Date.now() + timeoutMs;
  for (const frame of page.frames()) {
    if (Date.now() > frameDeadline) break;
    const remaining = Math.max(0, frameDeadline - Date.now());
    try {
      await frame.evaluate(async (waitMs) => {
        const imgs = [...document.querySelectorAll("img[src]")];
        await Promise.race([
          Promise.all(
            imgs.map(
              (img) =>
                new Promise((resolve) => {
                  if (img.complete) resolve(undefined);
                  else {
                    img.addEventListener("load", () => resolve(undefined), { once: true });
                    img.addEventListener("error", () => resolve(undefined), { once: true });
                  }
                }),
            ),
          ),
          new Promise((resolve) => setTimeout(resolve, waitMs)),
        ]);
      }, remaining);
    } catch {
      /* detached frame */
    }
  }
}
