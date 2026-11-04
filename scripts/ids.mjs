// 1年生の ID（slug）を付けて、写真を入れるフォルダ photos/<ID>/ を作る
// ・nurses.json で "slug" が空（または項目なし）の人に、ID を自動で付けて保存する
// ・ID ＝ 表示名の頭文字（小文字）＋「-」＋部署の略（例：6階病棟・Oさん → o-6f）
//   本名やフルネームは使わない。同じ ID になる人がいたら、2人目から末尾に -2, -3 … を付ける
// ・すでに付いている ID は変えない（URL が変わらないように）
// ・全員分の photos/<ID>/ を作り、「ここに写真を入れる.txt」を置く
// 使い方：npm run ids
import fs from 'node:fs';
import path from 'node:path';

const DATA = path.join('src', 'data', 'nurses.json');
const PHOTOS = 'photos';

/** 部署の略：3階東病棟→3e／6階病棟・6病棟→6f／ICU→icu／外来→op／手術室→or */
export function deptCode(dept) {
  const d = dept.normalize('NFKC').trim();
  const ward = d.match(/^(\d+)階?(東|西|南|北)?病棟$/);
  if (ward) return ward[1] + ({ 東: 'e', 西: 'w', 南: 's', 北: 'n' }[ward[2]] ?? 'f');
  const fixed = { ICU: 'icu', HCU: 'hcu', CCU: 'ccu', NICU: 'nicu', 外来: 'op', 手術室: 'or', 救急外来: 'er', 救急: 'er', 透析室: 'hd' };
  if (fixed[d.toUpperCase()] || fixed[d]) return fixed[d.toUpperCase()] || fixed[d];
  const ascii = d.toLowerCase().replace(/[^a-z0-9]+/g, '');
  return ascii || 'dept';
}

/** 表示名の頭文字（Oさん → o）。英字がなければ n */
export function initialOf(name) {
  const m = name.normalize('NFKC').match(/[A-Za-z]/);
  return m ? m[0].toLowerCase() : 'n';
}

const README_TXT = (n) => `${n.department}・${n.displayName}（ID：${n.slug}）の写真を入れるフォルダです。

■ 入れる写真（ファイル名をこのとおりにしてください）
  main.jpg … 縦向き（3:4）。全員必要
${n.hasInterview ? `  wide.jpg … 横向き（3:2）。インタビュー用
  work.jpg … 横向き（3:2）。詳細ページの本文（働いている様子）
  team.jpg … 横向き（3:2）。詳細ページの本文（同期・先輩と）
` : `  wide.jpg … 横向き（3:2）。インタビューが届いたら追加
`}  ※ jpg のほか png / heic なども使えます

■ 入れたあと
  site フォルダでターミナルを開き、次のコマンドを実行します
    npm run photos
  （npm run dev / npm run build のときにも自動で実行されます）

■ 注意
  このフォルダ（photos）は GitHub に上がりません。
  公開されるのは、変換後の写真（EXIF＝撮影場所などの情報を削除したもの）だけです。
`;

const nurses = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const used = new Set(nurses.map((n) => n.slug).filter(Boolean));
let added = 0;

for (const n of nurses) {
  if (n.slug) continue;
  const base = `${initialOf(n.displayName)}-${deptCode(n.department)}`;
  let id = base;
  for (let i = 2; used.has(id); i++) id = `${base}-${i}`;
  used.add(id);
  // slug を先頭に置いて保存する
  const rest = { ...n };
  delete rest.slug;
  Object.keys(n).forEach((k) => delete n[k]);
  Object.assign(n, { slug: id, ...rest });
  added++;
  console.log(`[ids] ID を付けました：${n.department}・${n.displayName} → ${id}`);
}

if (added) {
  const body = nurses.map((n) => '  ' + JSON.stringify(n, null, 2).replace(/\n/g, '\n  ')).join(',\n');
  fs.writeFileSync(DATA, `[\n${body}\n]\n`);
}

for (const n of nurses) {
  const dir = path.join(PHOTOS, n.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ここに写真を入れる.txt'), README_TXT(n));
}
console.log(`[ids] 新しく付けた ID：${added} 件／写真フォルダ：${nurses.length} 件（${PHOTOS}/）`);
