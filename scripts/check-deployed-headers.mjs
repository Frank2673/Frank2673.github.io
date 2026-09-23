#!/usr/bin/env node
/**
 * 部署后自校验：线上响应头是否与仓库里的 `_headers` 一致
 *
 * 为什么站点仓库要自己再做一遍这个检查？
 *   `_headers` 只是"意图"，只有线上真实响应才算数。若无此检查，
 *   某天有人改了 Cloudflare 配置或换了托管平台，防护静默降级也没人知道。
 *
 * 用法：
 *   node scripts/check-deployed-headers.mjs --url https://xxx.pages.dev/
 *   node scripts/check-deployed-headers.mjs            # 默认检查 pages.dev 站点
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import https from 'node:https';
import http from 'node:http';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** 与 Cloudflare Pages 站点对应的默认校验地址（可用 --url 覆盖） */
const DEFAULT_URL = 'https://frank2673-site.pages.dev/';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--url') args.url = argv[++i];
  }
  return args;
}

/** 解析 `_headers` 文件（Cloudflare Pages 格式，取 /* 路径块） */
export function parseHeadersFile(text) {
  const headers = {};
  let inWildcardBlock = false;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      inWildcardBlock = line.trim() === '/*';
      continue;
    }
    if (!inWildcardBlock) continue;
    const m = line.trim().match(/^([^:]+):\s*(.*)$/);
    if (m) headers[m[1].trim()] = m[2].trim();
  }
  return headers;
}

function request(url, timeoutMs = 15000) {
  return new Promise((resolve) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'http:' ? http : https;
    const req = client.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'http:' ? 80 : 443),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: { 'User-Agent': 'header-check/1.0', 'Accept-Encoding': 'identity' },
        rejectUnauthorized: false,
        timeout: timeoutMs,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve({ ok: true, status: res.statusCode, headers: res.headers }));
        res.on('error', (e) => resolve({ ok: false, error: e.code || e.message }));
      }
    );
    req.on('timeout', () => req.destroy(Object.assign(new Error('超时'), { code: 'TIMEOUT' })));
    req.on('error', (e) => resolve({ ok: false, error: e.code || e.message }));
    req.end();
  });
}

/** 比较单个响应头（HSTS 允许线上更强） */
export function compareHeader(name, expected, actual) {
  if (actual === undefined) return { ok: false, note: '线上未返回该响应头' };

  if (name.toLowerCase() === 'strict-transport-security') {
    const maxAge = (v) => Number((String(v).match(/max-age\s*=\s*(\d+)/i) || [])[1] || 0);
    if (maxAge(actual) < maxAge(expected)) {
      return { ok: false, note: `max-age 偏小（线上 ${maxAge(actual)} < 期望 ${maxAge(expected)}）` };
    }
    if (/includeSubDomains/i.test(expected) && !/includeSubDomains/i.test(actual)) {
      return { ok: false, note: '缺少 includeSubDomains' };
    }
    return { ok: true, note: '满足（允许更强）' };
  }

  const norm = (s) => String(s).trim().replace(/\s+/g, ' ').toLowerCase();
  return norm(actual) === norm(expected)
    ? { ok: true, note: '一致' }
    : { ok: false, note: `取值不同（线上 "${actual}" / 期望 "${expected}"）` };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const url = args.url || DEFAULT_URL;

  const headersPath = join(ROOT, '_headers');
  if (!existsSync(headersPath)) {
    console.error('❌ 缺少 _headers 文件');
    return 2;
  }

  const expected = parseHeadersFile(readFileSync(headersPath, 'utf8'));
  const names = Object.keys(expected);
  console.log(`🔍 校验 ${url}`);
  console.log(`   期望响应头：${names.length} 项（来自仓库 _headers）`);

  const res = await request(url);
  if (!res.ok) {
    console.error(`\n🛑 请求失败：${res.error}`);
    console.error('   若站点尚未部署，请先完成 Cloudflare Pages 部署（见 DEPLOY-CLOUDFLARE.md）');
    return 2;
  }

  console.log(`   HTTP ${res.status}`);
  console.log('');

  let failures = 0;
  for (const [name, value] of Object.entries(expected)) {
    const actual = res.headers[name.toLowerCase()];
    const r = compareHeader(name, value, actual);
    console.log(`  ${r.ok ? '✅' : '❌'} ${name}${r.ok ? '' : ' —— ' + r.note}`);
    if (!r.ok) failures++;
  }

  console.log('');
  if (failures === 0) {
    console.log(`✅ 线上响应头与 _headers 完全一致（${names.length} 项全部通过）`);
    return 0;
  }
  console.error(`❌ ${failures} 项不一致 —— 部署配置可能未生效或已回退`);
  return 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`🛑 运行失败：${err.message}`);
    process.exit(2);
  });
