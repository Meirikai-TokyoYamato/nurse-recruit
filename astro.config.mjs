// @ts-check
import { defineConfig } from 'astro/config';

// ▼ GitHub Pages で公開するときの設定（ここだけ書き換えればOK）
//   site … 公開先のドメイン（例：https://○○hospital.github.io）
//   base … リポジトリ名（例：/nurse-recruit）
//   独自ドメイン（recruit.○○hospital.jp など）を使う場合は
//   site を そのドメイン に、base を '/' にして、public/CNAME を置く
export default defineConfig({
  site: 'https://meirikai-tokyoyamato.github.io',
  base: '/nurse-recruit',
  trailingSlash: 'always',
  integrations: [devOnlyPages()],
});

// 確認用ページ（写真の切り抜き確認 /_check/photos/）は npm run dev のときだけ追加する。
// npm run build（公開用）には含まれない。
function devOnlyPages() {
  return {
    name: 'dev-only-pages',
    hooks: {
      /** @param {any} options */
      'astro:config:setup': ({ command, injectRoute }) => {
        if (command !== 'dev') return;
        injectRoute({ pattern: '/_check/photos', entrypoint: './src/dev/check-photos.astro' });
      },
    },
  };
}
