import fs from 'node:fs';
import path from 'node:path';
import raw from '../data/nurses.json';

export type Interview = Partial<Record<'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9', string>>;

/** 写真の種類：main＝縦3:4（全員）／wide＝横3:2（インタビューのある人）／work・team＝横3:2（詳細ページ本文）／board＝比率自由（切らずにそのまま表示） */
export type PhotoKind = 'main' | 'wide' | 'work' | 'team' | 'board';
export const DEFAULT_FOCUS = '50% 35%';
const PHOTO_SIZES = [800, 1600] as const;

export interface Nurse {
  slug: string;
  displayName: string;
  department: string;
  joined: string;
  school?: string;
  hometown?: string;
  showSchool?: boolean;
  showHometown?: boolean;
  order: number;
  hasInterview: boolean;
  featured?: boolean;
  headline?: string;
  interview?: Interview;
  q4Quote?: string;
  /** ボード（board.jpg）の内容を一文で説明する代替テキスト */
  boardAlt?: string;
  /** 写真ごとの切り抜きの中心（例 { "main": "50% 30%" }）。未指定は "50% 35%" */
  focus?: Partial<Record<PhotoKind, string>>;
}

/** 全員（order 順） */
export const nurses: Nurse[] = [...(raw as Nurse[])].sort((a, b) => a.order - b.order);
/** インタビューのある人（order 順） */
export const interviewed = nurses.filter((n) => n.hasInterview);
/** 写真のみの人（order 順） */
export const photoOnly = nurses.filter((n) => !n.hasInterview);
/** トップのヒーロー（featured の1人。いなければインタビューの先頭） */
export const featured = interviewed.find((n) => n.featured) ?? interviewed[0];

/** base（GitHub Pages のリポジトリ名）を付けたURLにする */
export function withBase(p: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (/^(https?:|mailto:|tel:|#)/.test(p)) return p;
  return `${base}/${p.replace(/^\//, '')}`;
}

/** public/ にその画像ファイルが実際にあるか（なければ仮のグレー画像を出す） */
export function photoExists(p?: string): boolean {
  if (!p) return false;
  return fs.existsSync(path.join(process.cwd(), 'public', p.replace(/^\//, '')));
}

export const detailUrl = (n: Nurse) => withBase(`nurses/${n.slug}/`);
export const photoAlt = (n: Nurse) => `${n.department}で働く${n.displayName}`;

/** 同じ部署でインタビューのある人 */
export const sameDeptInterview = (n: Nurse) =>
  interviewed.find((m) => m.department === n.department && m.slug !== n.slug);

/** 詳細ページの設問（表示順） */
export const questions = [
  { key: 'q1', title: '入職を決めた理由' },
  { key: 'q2', title: '学生時代との違い' },
  { key: 'q3', title: 'できるようになったこと' },
  { key: 'q4', title: '先輩・研修のサポート' },
  { key: 'q5', title: '印象に残っている出来事' },
  { key: 'q6', title: '部署の雰囲気' },
  { key: 'q7', title: 'いまの気持ち' },
  { key: 'q8', title: 'これからの目標' },
] as const;

export interface PhotoSource {
  /** 実際に使うファイルの種類（wide がない人は main） */
  kind: PhotoKind;
  src: string;
  srcset: string;
  /** object-position に入れる切り抜きの中心 */
  position: string;
}

/**
 * 写真のURLを返す。public/images/<slug>/<種類>-1600.webp がなければ null（仮のグレー画像を出す）。
 * wide がない人は main を横向きに切り抜いて代わりにする。
 */
export function photoSource(n: Nurse, kind: PhotoKind): PhotoSource | null {
  const has = (k: PhotoKind) => photoExists(`images/${n.slug}/${k}-1600.webp`);
  const use: PhotoKind | null = has(kind) ? kind : kind === 'wide' && has('main') ? 'main' : null;
  if (!use) return null;
  const url = (size: number) => withBase(`images/${n.slug}/${use}-${size}.webp`);
  return {
    kind: use,
    src: url(1600),
    srcset: PHOTO_SIZES.map((w) => `${url(w)} ${w}w`).join(', '),
    position: n.focus?.[use] || DEFAULT_FOCUS,
  };
}

/** OGP 用の画像パス（public/ から）。wide → main の順で、変換済みのものがあれば返す */
export function ogImagePath(n?: Nurse): string | undefined {
  if (!n) return undefined;
  return (['wide', 'main'] as const)
    .map((k) => `images/${n.slug}/${k}-1600.webp`)
    .find((p) => photoExists(p));
}
