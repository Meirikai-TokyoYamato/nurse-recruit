# 看護師1年生 紹介サイト

Astro で作った静的サイトです。GitHub Pages で公開します。

## パソコンで表示を確認する

1. このフォルダ（`site`）でターミナルを開く
2. 初回だけ `npm install`
3. `npm run dev` を実行し、表示された `http://localhost:4321/nurse-recruit/` をブラウザで開く
4. 終わるときはターミナルで `Ctrl + C`

## よく直すファイル

| やりたいこと | 直すファイル |
|---|---|
| 1年生を追加・修正する | `src/data/nurses.json` |
| 病院名・ロゴ・住所・電話・英字の小見出し・募集要項の要約を変える | `src/data/site.json` |
| 外部リンク（募集要項・見学・インターンシップ・採用試験・看護部サイト）の行き先を変える | `src/data/site.json` の `links` |
| 写真を入れる | `photos/<slug>/`（下の「写真」を参照） |

### 1年生のデータ（`src/data/nurses.json`）
- 1人1件。項目の意味は1つ上の階層の `README.md`「データ」を参照
- **インタビューの回答が届いたら**：その人の `hasInterview` を `true` にし、`headline`・`interview`（q1〜q9）を埋める。一覧の上段に移り、詳細ページが自動で作られる
- 空欄の設問（`""`）は、詳細ページで見出しごと表示されない
- 出身校・出身地は `showSchool` / `showHometown` が `true` のときだけ表示
- トップの大きい1人は `featured: true`（1人だけ）
- 並び順は `order` の小さい順
- インタビュー本文の「（仮）〜が入ります。」は、回答が届いたら差し替える

### ID（slug）と写真フォルダ
- ID は URL（`/nurses/<ID>/`）と写真フォルダ名に使う。本名やフルネームは使わない
- 付け方：表示名の頭文字（小文字）＋「-」＋部署の略。同じ ID になる人は2人目から `-2`、`-3` …
  - 部署の略：「◯階病棟」「◯病棟」→ `◯f`、「3階東病棟」→ `3e`（西 `w`・南 `s`・北 `n`）、ICU → `icu`、外来 → `op`、手術室 → `or`
- **1年生を追加するとき**：`nurses.json` に `"slug"` なしで1件追加し、`npm run ids` を実行する
  - ID が自動で付いて `nurses.json` に保存され、`photos/<ID>/` フォルダ（中に「ここに写真を入れる.txt」）ができる
  - すでに付いている ID は変わらない

### 写真
**1人あたりの写真**（ファイル名は決まっています）
| ファイル | 向き | 誰の分 | 使う場所 |
|---|---|---|---|
| `main.jpg` | 縦 3:4 | 全員 | 同期一覧・写真のみの人の欄・拡大表示・スマホの最初の1人の欄 |
| `wide.jpg` | 横 3:2 | インタビューのある人 | 一覧のインタビューの段・詳細ページの一番上・PCの最初の1人の欄 |
| `work.jpg` / `team.jpg` | 横 3:2 | インタビューのある人 | 詳細ページの本文写真（04のあと／06のあと） |

- `wide.jpg` がない人は、`main.jpg` を横向きに切り抜いて代わりに使う
- `work.jpg` / `team.jpg` は、ある写真だけ本文に表示する（なければ枠ごと出さない。`team.jpg` は無くてもよい）
- 写真がまだない人は、仮のグレー画像が表示される

**入れ方**
1. 元の写真を `photos/<slug>/main.jpg` のように置く（例：`photos/a-3e/main.jpg`）。jpg / png / heic などが使える
2. `npm run dev` または `npm run build` を実行すると、自動で変換される（手動なら `npm run photos`、全部作り直すなら `npm run photos -- --force`）
   - 長辺1600px（PC用）と800px（スマホ用）の WebP を `public/images/<slug>/` に作る
   - EXIF（撮影場所・日時・機種など）は削除される
3. `photos/` は GitHub に上げない設定（`.gitignore`）。上がるのは変換後の `public/images/` だけ

**切り抜き位置の調整**
- 表示する場所ごとに比率が決まっていて、はみ出す部分は切り抜かれる
- `nurses.json` の `focus` で写真ごとに切り抜きの中心を指定できる（「左右％ 上下％」。未指定は `50% 35%`）
  - 例：`"focus": { "main": "50% 30%", "wide": "50% 40%" }`（上下の％を小さくすると上寄り）
- **確認用ページ**：`npm run dev` 中に http://localhost:4321/nurse-recruit/_check/photos/ を開くと、全員の写真を表示場所ごとに並べて確認できる（公開サイトには含まれない）

### 外部リンク（`site.json` の `links`）
| キー | 使われている場所 |
|---|---|
| `events` | 「見学・インターンシップ」ボタン（ヘッダー・スマホ下の固定ボタン・各ページ・フッター） |
| `requirements` | 「募集要項」（ヘッダー・フッター） |
| `exam` | 「採用試験」（ヘッダー・トップ・詳細ページの最後・フッター） |
| `nurseSite` | フッターの「看護部サイトへ →」 |
| `instagram` | フッターの「Instagram」 |
| `hospitalSite` | フッターの「病院公式サイトへ →」 |
| `education` | 「教育体制を見る →」（トップ・詳細ページ） |

- `https://` で始まるリンクは、自動で新しいタブで開きます

### トップの募集要項（`site.json` の `recruit`）
年度が変わったらここを書き換える。
- `target`：見出しのかっこ内（例 `2027年4月入職・新卒看護師`）
- `items`：項目名（`label`）と内容（`value`）。行の追加・削除も可
- `note`：小さい文字の注記（空欄 `""` にすると表示しない）
- `detailUrl`：「募集要項をすべて見る →」のリンク先

## 公開（GitHub Pages）

1. 病院（組織）名義の GitHub アカウントでリポジトリを作る
2. `astro.config.mjs` の `site`（例 `https://○○hospital.github.io`）と `base`（例 `/nurse-recruit`＝リポジトリ名）を書き換える
3. この `site` フォルダの中身をリポジトリに push する
4. GitHub のリポジトリ → Settings → Pages → Source を「GitHub Actions」にする
5. 以降は `main` に push するたびに自動で公開される（`.github/workflows/deploy.yml`）

- 独自ドメインを使う場合：`site` をそのドメインに、`base` を `'/'` にし、`public/CNAME` にドメイン名を1行で書く。DNS 設定は病院のドメイン管理者に依頼
- **公開承認が出るまで検索に出さない**設定（`site.json` の `"noindex": true`）になっています。承認後に `false` にする
- OGP画像の共通版は `public/og.png`（いまは仮のグレー画像。1200×630px で差し替え）

## まだ仮のもの
- ロゴ画像：`public/images/logo.png` に置くと表示される（ない間は病院名を文字で表示）
- インタビュー本文（「（仮の文章）」と書いてあるもの）
- 写真・OGP画像
