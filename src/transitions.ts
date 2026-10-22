/**
 * Canva-style circle wipe between views:
 *   1. a colored circle grows from `origin` until it covers the window,
 *   2. the view is swapped underneath,
 *   3. a hole grows from the same point, revealing the new view.
 * `el` is the fixed `.wipe` overlay; its `--r` / `--hole` are registered @property lengths.
 */

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r(null)));

/** Distance from a point to the farthest window corner. */
const coverRadius = (x: number, y: number) =>
  Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 4;

let running = false;

export async function circleWipe(
  el: HTMLElement,
  from: HTMLElement,
  color: string,
  swap: () => void,
): Promise<void> {
  if (running) return;
  if (reducedMotion()) return swap();
  running = true;

  const rect = from.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  el.style.setProperty("--x", `${x}px`);
  el.style.setProperty("--y", `${y}px`);
  el.style.setProperty("--hole", "0px");
  el.style.background = color;
  el.style.display = "block";

  try {
    await el.animate([{ "--r": "0px" }, { "--r": `${coverRadius(x, y)}px` }], {
      duration: 420,
      easing: "cubic-bezier(0.7, 0, 0.3, 1)",
      fill: "forwards",
    }).finished;
    // Stay fully covered even if the window grows to fit the new view.
    el.getAnimations().forEach((a) => a.cancel());
    el.style.setProperty("--r", "9999px");

    swap();
    // Let React paint and the window finish resizing before measuring the reveal.
    await nextFrame();
    await nextFrame();

    await el.animate([{ "--hole": "0px" }, { "--hole": `${coverRadius(x, y)}px` }], {
      duration: 560,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    }).finished;
  } finally {
    el.getAnimations().forEach((a) => a.cancel());
    el.style.display = "none";
    running = false;
  }
}

const colorCache = new Map<string, string>();

/** Average color of a thumbnail, used as its wipe color. */
export async function averageColor(src: string | null | undefined, fallback: string): Promise<string> {
  if (!src) return fallback;
  const cached = colorCache.get(src);
  if (cached) return cached;
  const img = new Image();
  img.src = src;
  await img.decode().catch(() => null);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  const color = `rgb(${r} ${g} ${b})`;
  colorCache.set(src, color);
  return color;
}
