/**
 * Re-compress all WebP images at lower quality + size cap.
 * Outputs to <folder>/_opt/ so the dev server doesn't lock source files.
 * Run: node scripts/reoptimize-images.mjs
 */
import sharp from 'sharp'
import { readdirSync, statSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'

const JOBS = [
  { dir: 'public/assets/main-page-photos', quality: 72, maxWidth: 1920, effort: 5 },
  { dir: 'public/assets/laptop',           quality: 75, maxWidth: 1280, effort: 5 },
]

const fmtKB = (b) => `${Math.round(b / 1024)} KB`

for (const job of JOBS) {
  const srcDir = join(process.cwd(), job.dir)
  const outDir = join(srcDir, '_opt')
  mkdirSync(outDir, { recursive: true })

  const files = readdirSync(srcDir).filter(f => /\.webp$/i.test(f))
  console.log(`\n📁 ${job.dir} — ${files.length} webp files`)

  let savedTotal = 0

  for (const file of files) {
    const srcPath = join(srcDir, file)
    const outPath = join(outDir, file)
    const before = statSync(srcPath).size

    const buf = await sharp(srcPath)
      .resize({ width: job.maxWidth, withoutEnlargement: true })
      .webp({ quality: job.quality, effort: job.effort })
      .toBuffer()

    const after = buf.byteLength

    writeFileSync(outPath, buf)

    const saved = before - after
    savedTotal += saved
    const pct = ((1 - after / before) * 100).toFixed(0)
    const arrow = after < before ? '✅' : '⚠️ '
    console.log(`  ${arrow} ${file}: ${fmtKB(before)} → ${fmtKB(after)} (${pct > 0 ? '-' : '+'}${Math.abs(pct)}%)`)
  }

  console.log(`  💾 Total saved: ${fmtKB(savedTotal)}`)
  console.log(`  📂 Output: ${outDir}`)
}

console.log('\n✅ Done. Copy files from _opt/ folders back to their parent to apply.')
