#!/usr/bin/env node
/**
 * 站点自检脚本 —— CI 与本地共用同一套标准
 *
 * 检查项：
 *   1. 必需文件是否齐全
 *   2. 内部链接 / 资源引用是否真实存在（避免 404）
 *   3. 是否误引外部运行时依赖（本站设计目标：零外部请求）
 *   4. SEO 元信息是否完整
 *   5. 无障碍基础项
 *   6. 结构化数据是否是可解析的 JSON
 *
 * 用法：node scripts/validate-site.mjs
 * 退出码：0 = 全部通过；1 = 存在失败项
 */

import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ORIGIN = 'https://frank2673.github.io';

const results = { pass: [], fail: [], warn: [] };
const ok = (m) => results.pass.push(m);
const bad = (m) => results.fail.push(m);
const warn = (m) => results.warn.push(m);

/* --------------------------------------------------------------------------
   1. 必需文件
   -------------------------------------------------------------------------- */
const REQUIRED = [
  'index.html',
  '404.html',
  'assets/css/style.css',
  'assets/js/main.js',
  'assets/img/favicon.svg',
  'assets/img/og-cover.png',
  'assets/img/apple-touch-icon.png',
  'robots.txt',
  'sitemap.xml',
  '.nojekyll',
  'README.md',
  'LICENSE',
];

for (const file of REQUIRED) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) {
    bad(`缺少必需文件：${file}`);
  } else if (statSync(abs).size === 0 && file !== '.nojekyll') {
    bad(`文件为空：${file}`);
  } else {
    ok(`必需文件存在：${file}`);
  }
}

/* --------------------------------------------------------------------------
   2/5/6. HTML 检查
   -------------------------------------------------------------------------- */
/* 页面分型：不同用途的页面适用不同标准
   - indexable：可被搜索引擎索引的页面，必须有 canonical / 社交卡片
   - nav：是否有站点级导航结构（404 这类"尽头页"不需要） */
const PAGE_RULES = {
  'index.html': { indexable: true, nav: true },
  '404.html': { indexable: false, nav: false },
};

const HTML_FILES = Object.keys(PAGE_RULES);

/** 把站内路径（含根相对路径）解析为磁盘路径 */
function resolveLocalPath(url) {
  const clean = url.split('#')[0].split('?')[0];
  if (!clean) return null;
  return clean.startsWith('/') ? join(ROOT, clean) : join(ROOT, clean);
}

/** 收集标签属性里的 URL */
function collectUrls(html) {
  const urls = [];
  const attrRe = /\b(href|src|srcset|poster)\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = attrRe.exec(html)) !== null) {
    urls.push({ attr: m[1].toLowerCase(), value: m[2].trim() });
  }
  return urls;
}

/** 这些属性属于「页面运行时必须加载」的资源，绝不该指向外网 */
const RESOURCE_ATTRS = new Set(['src', 'srcset', 'poster']);

for (const file of HTML_FILES) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) continue;
  const html = readFileSync(abs, 'utf8');

  /* --- 内部链接与资源存在性 --- */
  let localChecked = 0;
  for (const { attr, value } of collectUrls(html)) {
    if (/^(https?:)?\/\//i.test(value) || /^(mailto:|tel:|data:)/i.test(value)) continue;
    if (value.startsWith('#')) continue;

    const target = resolveLocalPath(value);
    if (!target) continue;

    localChecked++;
    if (!existsSync(target)) {
      bad(`${file}：引用了不存在的本地路径 → ${value}`);
    }
  }
  if (localChecked > 0) ok(`${file}：${localChecked} 个本地引用全部存在`);

  /* --- 零外部运行时依赖 --- */
  const externalResources = collectUrls(html).filter(
    ({ attr, value }) => RESOURCE_ATTRS.has(attr) && /^https?:\/\//i.test(value)
  );
  if (externalResources.length) {
    bad(
      `${file}：存在外部运行时资源（破坏零依赖目标）→ ` +
        externalResources.map((r) => r.value).join(', ')
    );
  } else {
    ok(`${file}：无外部运行时资源`);
  }

  /* 外链安全：target="_blank" 必须带 rel="noopener" */
  const blankLinks = html.match(/<a\b[^>]*target="_blank"[^>]*>/gi) || [];
  const unsafe = blankLinks.filter((tag) => !/rel="[^"]*noopener/i.test(tag));
  if (unsafe.length) bad(`${file}：${unsafe.length} 个 target="_blank" 链接缺少 rel="noopener"`);
  else if (blankLinks.length) ok(`${file}：${blankLinks.length} 个新窗口外链均有 noopener`);

  /* --- SEO（按页面分型应用标准）--- */
  const pageRule = PAGE_RULES[file];
  const seoRules = [
    [/<html[^>]+lang=["'][a-zA-Z-]+["']/i, 'html 标签有 lang 属性'],
    [/<meta[^>]+name=["']viewport["']/i, 'viewport 元信息'],
    [/<title>[^<]{5,}<\/title>/i, 'title 标签'],
    [/<link[^>]+rel=["']icon["']/i, 'favicon'],
  ];
  if (pageRule.indexable) {
    seoRules.push(
      [/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i, 'meta description'],
      [/<link[^>]+rel=["']canonical["']/i, 'canonical 链接'],
      [/<meta[^>]+property=["']og:title["']/i, 'Open Graph og:title'],
      [/<meta[^>]+property=["']og:image["']/i, 'Open Graph og:image'],
      [/<meta[^>]+name=["']twitter:card["']/i, 'Twitter 卡片']
    );
  } else {
    /* 非索引页必须显式声明 noindex，避免被搜索引擎收录成"内容页" */
    seoRules.push([/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i, 'robots noindex']);
  }
  const missingSeo = seoRules.filter(([re]) => !re.test(html)).map(([, label]) => label);
  if (missingSeo.length) bad(`${file}：SEO 元信息缺失 → ${missingSeo.join('、')}`);
  else ok(`${file}：SEO 元信息完整（${pageRule.indexable ? '可索引页标准' : '非索引页标准'}）`);

  /* --- 无障碍基础项 --- */
  const a11yRules = [[/<main\b/i, 'main 语义标签']];
  if (pageRule.nav) {
    a11yRules.push(
      [/class=["'][^"']*skip-link/i, '跳到主要内容链接'],
      [/<nav\b/i, 'nav 语义标签'],
      [/<footer\b/i, 'footer 语义标签']
    );
  }
  const missingA11y = a11yRules.filter(([re]) => !re.test(html)).map(([, label]) => label);
  if (missingA11y.length) bad(`${file}：无障碍基础项缺失 → ${missingA11y.join('、')}`);
  else ok(`${file}：无障碍基础项齐全`);

  /* 图片必须有 alt（本站目前用内联 SVG，此项为未来兜底） */
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  const noAlt = imgs.filter((tag) => !/\balt\s*=/i.test(tag));
  if (noAlt.length) bad(`${file}：${noAlt.length} 个 <img> 缺少 alt`);

  /* --- 结构化数据可解析 --- */
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ld;
  let ldCount = 0;
  while ((ld = ldRe.exec(html)) !== null) {
    ldCount++;
    try {
      JSON.parse(ld[1]);
    } catch (e) {
      bad(`${file}：JSON-LD 结构化数据无法解析 → ${e.message}`);
    }
  }
  if (ldCount) ok(`${file}：${ldCount} 段 JSON-LD 结构化数据可解析`);
}

/* --------------------------------------------------------------------------
   3. 全站 grep：不该出现的模式
   -------------------------------------------------------------------------- */
const css = existsSync(join(ROOT, 'assets/css/style.css'))
  ? readFileSync(join(ROOT, 'assets/css/style.css'), 'utf8')
  : '';

if (/@import\s+url\(\s*["']?https?:/i.test(css)) {
  bad('style.css：存在外部 @import 字体/样式');
} else {
  ok('style.css：无外部 @import');
}

/* 合并冲突标记：最容易被误提交的破坏性问题 */
const TEXT_FILES = ['index.html', '404.html', 'assets/css/style.css', 'assets/js/main.js', 'README.md'];
for (const file of TEXT_FILES) {
  const abs = join(ROOT, file);
  if (!existsSync(abs)) continue;
  const text = readFileSync(abs, 'utf8');
  if (/^(<{7}|={7}|>{7})/m.test(text)) bad(`${file}：存在 Git 合并冲突标记`);
  if (text.charCodeAt(0) === 0xfeff) bad(`${file}：文件含 UTF-8 BOM（建议去除）`);
}

/* --------------------------------------------------------------------------
   4. sitemap 与 robots 一致性
   -------------------------------------------------------------------------- */
if (existsSync(join(ROOT, 'sitemap.xml'))) {
  const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
  if (!sitemap.includes(SITE_ORIGIN)) bad(`sitemap.xml：未包含站点地址 ${SITE_ORIGIN}`);
  else ok('sitemap.xml：包含站点地址');

  if (existsSync(join(ROOT, 'robots.txt'))) {
    const robots = readFileSync(join(ROOT, 'robots.txt'), 'utf8');
    if (!/Sitemap:\s*\S+sitemap\.xml/i.test(robots)) bad('robots.txt：未声明 Sitemap');
    else ok('robots.txt：已声明 Sitemap');
  }
}

/* --------------------------------------------------------------------------
   汇总输出
   -------------------------------------------------------------------------- */
const line = (s) => console.log(s);
line('');
line('站点自检报告');
line('='.repeat(56));

for (const m of results.pass) line(`  ✅ ${m}`);
for (const m of results.warn) line(`  ⚠️  ${m}`);
for (const m of results.fail) line(`  ❌ ${m}`);

line('-'.repeat(56));
line(`通过 ${results.pass.length} 项 · 警告 ${results.warn.length} 项 · 失败 ${results.fail.length} 项`);
line('');

if (results.fail.length) {
  console.error('自检未通过，请修复上面的失败项后重试。');
  process.exit(1);
}
console.log('✅ 自检全部通过');
