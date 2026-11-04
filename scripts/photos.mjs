// 写真の変換：photos/<slug>/main.jpg など → public/images/<slug>/main-1600.webp と main-800.webp
// ・長辺 1600px（PC用）と 800px（スマホ用）の WebP を作る
// ・EXIF（撮影場所・日時など）は書き出さない。縦向き写真の回転だけは反映する
// ・変換済みで元の写真が変わっていなければ飛ばす（--force で全部作り直す）
// 使い方：npm run photos   （npm run dev / npm run build の前にも自動で実行される）
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'photos';
const OUT = path.join('public', 'images');
const KINDS = ['main', 'wide', 'work', 'team', 'board'];
const SIZES = [1600, 800];
const force = process.argv.includes('--force');

if (!fs.existsSync(SRC)) process.exit(0);

let made = 0;
let skipped = 0;
for (const slug of fs.readdirSync(SRC)) {
  const dir = path.join(SRC, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  for (const file of fs.readdirSync(dir)) {
    // main.jpg.jpg のような二重拡張子（拡張子を表示しない設定で起きやすい）も main として扱う
    const m = file.match(/^(.+?)(?:\.(?:jpe?g|png|webp|tiff?|heic|heif))+$/i);
    if (!m) continue;
    const kind = m[1].toLowerCase();
    if (!KINDS.includes(kind)) {
      console.warn(`[photos] 名前が main / wide / work / team / board 以外なので飛ばしました：${path.join(dir, file)}`);
      continue;
    }
    const src = path.join(dir, file);
    const srcTime = fs.statSync(src).mtimeMs;
    fs.mkdirSync(path.join(OUT, slug), { recursive: true });
    for (const size of SIZES) {
      const out = path.join(OUT, slug, `${kind}-${size}.webp`);
      if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs >= srcTime) {
        skipped++;
        continue;
      }
      await sharp(src)
        .rotate() // EXIF の向きを反映してから、EXIF ごと捨てる
        .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(out);
      made++;
      console.log(`[photos] 作成：${out}`);
    }
  }
}
console.log(`[photos] 作成 ${made} 件／変更なし ${skipped} 件`);
