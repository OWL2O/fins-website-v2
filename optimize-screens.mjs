/**
 * Optimize laptop screen images → WebP
 *
 * Usage (from fins-landing/ folder):
 *   node optimize-screens.mjs
 *
 * Drop your 6 images into:
 *   public/assets/laptop/screens/
 *
 * Accepted filenames (tries in order):
 *   ლ1.png … ლ6.png   ← Georgian names (what you have)
 *   screen-1.png … screen-6.png
 *   (also accepts .jpg / .jpeg variants)
 *
 * Outputs screen-1.webp … screen-6.webp in the same folder.
 * Also optimises laptop.png → laptop.webp (if present).
 */

import sharp from 'sharp'
import { existsSync, statSync } from 'fs'
import { resolve } from 'path'

const SCREENS_DIR = resolve('public/assets/laptop/screens')
const LAPTOP_DIR  = resolve('public/assets/laptop')
const MAX_W   = 1600  // max width for screen images
const QUALITY = 85    // WebP quality (1-100)

const fmtKB = (b) => `${(b / 1024).toFixed(1)} KB`

// ── Screen images ────────────────────────────────────────────────────────────
for (let i = 1; i <= 6; i++) {
  let src = null

  const candidates = [
    `ლ${i}.png`,           // Georgian letter ლ (your naming)
    `ლ${i}.jpg`,
    `screen-${i}.png`,
    `screen-${i}.jpg`,
    `screen-${i}.jpeg`,
  ]

  for (const name of candidates) {
    const p = resolve(SCREENS_DIR, name)
    if (existsSync(p)) { src = p; break }
  }

  if (!src) {
    console.warn(`  [!] screen-${i}: not found — tried ${candidates.join(', ')}`)
    continue
  }

  const dest = resolve(SCREENS_DIR, `screen-${i}.webp`)
  const origSize = statSync(src).size

  await sharp(src)
    .resize({ width: MAX_W, withoutEnlargement: true })
    .webp({ quality: QUALITY, effort: 5 })
    .toFile(dest)

  const newSize = statSync(dest).size
  const saved = ((1 - newSize / origSize) * 100).toFixed(1)
  console.log(`  screen-${i}: ${fmtKB(origSize)} → ${fmtKB(newSize)} (−${saved}%) ✓`)
}

// ── Laptop frame (optional) ──────────────────────────────────────────────────
for (const name of ['laptop.png', 'laptop.jpg']) {
  const src = resolve(LAPTOP_DIR, name)
  if (!existsSync(src)) continue

  const dest = resolve(LAPTOP_DIR, 'laptop.webp')
  const origSize = statSync(src).size

  await sharp(src)
    .resize({ width: 2400, withoutEnlargement: true })
    .webp({ quality: 92, effort: 5 })   // higher quality for the frame
    .toFile(dest)

  const newSize = statSync(dest).size
  const saved = ((1 - newSize / origSize) * 100).toFixed(1)
  console.log(`  laptop frame: ${fmtKB(origSize)} → ${fmtKB(newSize)} (−${saved}%) ✓`)
  break
}

console.log('\nAll done — drop the .webp files are ready for LaptopShowcase.')
