import sharp from 'sharp'
import { readdirSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

const folders = [
  'public/assets/main-page-photos',
  'public/assets/laptop',
]

for (const folder of folders) {
  const dir = join(process.cwd(), folder)
  if (!existsSync(dir)) { console.log(`Skipping (not found): ${folder}`); continue }

  const files = readdirSync(dir).filter(f => /\.(png|jpg|jpeg)$/i.test(f))
  console.log(`\n📁 ${folder} — ${files.length} files`)

  for (const file of files) {
    const input  = join(dir, file)
    const output = join(dir, basename(file, extname(file)) + '.webp')

    if (existsSync(output)) {
      console.log(`  ⏭  skip (exists): ${file}`)
      continue
    }

    const { size: before } = await import('fs').then(m => m.promises.stat(input))
    await sharp(input)
      .webp({ quality: 82, effort: 4 })
      .toFile(output)
    const { size: after } = await import('fs').then(m => m.promises.stat(output))
    const pct = ((1 - after / before) * 100).toFixed(0)
    console.log(`  ✅ ${file} → .webp  (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB, -${pct}%)`)
  }
}

console.log('\nDone.')
