#!/usr/bin/env node
/**
 * 组装发布目录 `public/`
 *
 * 为什么不直接发布仓库根目录？
 *   仓库里有 scripts/、.github/、README.md、.gitignore 等等 —— 它们属于开发资产，
 *   不该出现在生产站点上（多暴露一个文件就多一分信息泄露面）。
 *
 * 因此这里用显式白名单：只复制站点真正需要的文件。
 * 顺带做一道保险：`_headers` 必须存在且包含必需的安全响应头，否则直接失败。
 *
 * 用法：node scripts/build-public.mjs [--out public]
 */

import {
  cpSync,
  mkdirSync,
  rmSync,
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** 白名单：只有这些会进入生产站点 */
const PUBLIC_FILES = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers'];
const PUBLIC_DIRS = ['assets', '.well-known'];

/** `_headers` 中必须存在的安全响应头（基线；权威策略在 header-forge 仓库） */
const REQUIRED_HEADERS = [
  'Strict-Transport-Security',
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'Referrer-Policy',
  'X-Frame-Options',
];

/** 明确排除并打印出来，避免"以为发布了其实没有" */
const EXCLUDED = [
  'scripts/',
  '.github/',
  'README.md',
  'LICENSE',
  '.gitignore',
  '.gitattributes',
  '.nojekyll',
];

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--out') args.out = argv[++i];
  }
  return args;
}

/** 递归统计目录内的文件数与字节数 */
function measure(dir) {
  let count = 0;
  let bytes = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    let entries = [];
    try {
      entries = readdirSync(current);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(current, entry);
      if (statSync(full).isDirectory()) stack.push(full);
      else {
        count++;
        bytes += statSync(full).size;
      }
    }
  }
  return { count, bytes };
}

const args = parseArgs(process.argv.slice(2));
const outDir = resolve(ROOT, args.out || 'public');

/* ---- 1. 前置校验：_headers 必须存在且含必需响应头 ---- */
const headersPath = join(ROOT, '_headers');
if (!existsSync(headersPath)) {
  console.error('❌ 缺少 _headers 文件 —— 响应头策略不会生效。');
  console.error('   生成方式（在 header-forge 仓库执行）：');
  console.error(
    '   node src/index.mjs generate --policy headers.policy.json --out . --only cloudflare-pages'
  );
  process.exit(1);
}

const headersContent = readFileSync(headersPath, 'utf8');
const missing = REQUIRED_HEADERS.filter(
  (name) => !new RegExp(`^\\s*${name}\\s*:`, 'im').test(headersContent)
);
if (missing.length) {
  console.error(`❌ _headers 缺少必需的安全响应头：${missing.join(', ')}`);
  process.exit(1);
}
console.log(`✅ _headers 校验通过（含 ${REQUIRED_HEADERS.length} 项基线响应头）`);

/* ---- 2. 清空并重建发布目录 ---- */
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

/* ---- 3. 白名单复制 ---- */
let count = 0;
let bytes = 0;

for (const file of PUBLIC_FILES) {
  const src = join(ROOT, file);
  if (!existsSync(src)) continue;
  const dst = join(outDir, file);
  mkdirSync(dirname(dst), { recursive: true });
  cpSync(src, dst);
  count++;
  bytes += statSync(src).size;
}

for (const dir of PUBLIC_DIRS) {
  const src = join(ROOT, dir);
  if (!existsSync(src)) continue;
  cpSync(src, join(outDir, dir), { recursive: true });
  const m = measure(src);
  count += m.count;
  bytes += m.bytes;
}

/* ---- 4. 输出清单 ---- */
console.log(`📦 发布目录已生成：${relative(ROOT, outDir)}/`);
console.log(`   ${count} 个文件 · ${(bytes / 1024).toFixed(1)} KB`);
console.log(`   已排除（开发资产，不进入生产）：${EXCLUDED.join(' ')}`);

writeFileSync(
  join(ROOT, 'public-manifest.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      fileCount: count,
      bytes,
      files: PUBLIC_FILES,
      dirs: PUBLIC_DIRS,
      excluded: EXCLUDED,
      headerBaseline: REQUIRED_HEADERS,
    },
    null,
    2
  ) + '\n',
  'utf8'
);
