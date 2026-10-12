// Kaynak GLB'yi web için optimize eder: WebP dokular + meshopt geometri sıkıştırma.
// Node adları (Object_N) korunur; join/palette/simplify bilerek kullanılmaz çünkü
// eşya kataloğu bu adlara bağlıdır.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const SRC = '3D/trilocale_via_boncompagni_milano.glb'
const OUT = 'public/models/apartment.glb'
const tmp = mkdtempSync(join(tmpdir(), 'gltf-'))
const step = (n) => join(tmp, `step${n}.glb`)
const run = (...args) => execFileSync('npx', ['gltf-transform', ...args], { stdio: 'inherit' })

try {
  run('dedup', SRC, step(1))
  run('prune', step(1), step(2))
  run('resize', step(2), step(3), '--width', '2048', '--height', '2048')
  run('webp', step(3), step(4), '--quality', '88')
  run('meshopt', step(4), OUT, '--level', 'medium')
} catch (err) {
  console.warn('\nOptimizasyon başarısız oldu, ham GLB kopyalanıyor:', err.message)
  copyFileSync(SRC, OUT)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

const mb = (f) => (statSync(f).size / 1024 / 1024).toFixed(2) + ' MB'
console.log(`\n${SRC} (${mb(SRC)}) -> ${OUT} (${mb(OUT)})`)
