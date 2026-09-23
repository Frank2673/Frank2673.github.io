#!/usr/bin/env node
/**
 * 一键部署：自检 → 构建 → 部署到 Cloudflare Pages → 校验线上响应头
 *
 * 为什么要把四步串成一条命令？
 *   "部署了但没生效"和"部署了但漏了校验"是这类工作的两个典型失误。
 *   串成一条链路后，任一步失败都会立刻停机，不会出现"以为部署成功"的情况。
 *
 * 用法：
 *   node scripts/deploy.mjs              # 完整流程
 *   node scripts/deploy.mjs --skip-check # 跳过最后的线上校验
 */

import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROJECT_NAME = 'frank2673-site';
const SITE_URL = `https://${PROJECT_NAME}.pages.dev/`;
const NPX = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const skipCheck = process.argv.includes('--skip-check');

/** 参数引号保护：含空格或引号的参数需要包裹，避免命令拼接歧义 */
function quoteArg(arg) {
  const value = String(arg);
  return /[\s"]/.test(value) ? `"${value.replace(/"/g, '\\"')}"` : value;
}

function run(command, args, label) {
  /* 拼成完整命令行后交给 shell：
     1. Windows 上 .cmd / .bat 无法被 spawnSync 直接执行
        （Node 为修 CVE-2024-27980，自 18.20.2 / 20.12.2 起直接调用会抛 EINVAL）
     2. 传「命令字符串 + shell」而非「命令 + args 数组 + shell」，可避免 Node 的
        DEP0190 弃用警告（该警告针对未转义的 args 数组） */
  const commandLine = [command, ...args].map(quoteArg).join(' ');
  console.log('');
  console.log(`▶ ${label}`);
  console.log(`  $ ${commandLine}`);

  const result = spawnSync(commandLine, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: true,
  });

  if (result.error) {
    console.error(`❌ ${label}：无法执行 —— ${result.error.message}`);
    if (result.error.code === 'EINVAL') {
      console.error('   提示：若在 Windows 上，请确认执行 .cmd 时经过了 shell。');
    }
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`❌ ${label} 失败（退出码 ${result.status}）—— 已中止，未继续后续步骤`);
    process.exit(result.status ?? 1);
  }
}

console.log('🚀 部署流程开始');
console.log(`   项目：${PROJECT_NAME}`);
console.log(`   目标：${SITE_URL}`);

/* 1. 站点自检 —— 不通过就不该部署 */
run('node', ['scripts/validate-site.mjs'], '步骤 1/4 · 站点自检');

/* 2. 组装发布目录（白名单，排除开发资产） */
run('node', ['scripts/build-public.mjs'], '步骤 2/4 · 组装发布目录');

/* 3. 部署 */
run(
  NPX,
  [
    '--yes',
    'wrangler@latest',
    'pages',
    'deploy',
    'public',
    `--project-name=${PROJECT_NAME}`,
    '--branch=main',
    '--commit-dirty=true',
  ],
  '步骤 3/4 · 部署到 Cloudflare Pages'
);

/* 4. 部署后校验 —— 这一步才是"真的生效了"的证据 */
if (skipCheck) {
  console.log('\n⏭️  已跳过线上校验（--skip-check）');
  console.log('   建议稍后手动执行：node scripts/check-deployed-headers.mjs');
  process.exit(0);
}

console.log('\n⏳ 等待 CDN 生效（10 秒）…');
await new Promise((r) => setTimeout(r, 10000));

run('node', ['scripts/check-deployed-headers.mjs', '--url', SITE_URL], '步骤 4/4 · 校验线上响应头');

console.log('');
console.log('✅ 部署完成且线上校验通过');
console.log(`   ${SITE_URL}`);
