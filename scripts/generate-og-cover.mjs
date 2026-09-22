#!/usr/bin/env node
/**
 * 生成社交分享图（Open Graph cover）与 Apple touch icon
 *
 * 特点：零依赖。不装 canvas / sharp，直接用 Node 内置 zlib 手写 PNG 编码。
 * 这样 CI 与任何机器上都能复现同一张图，不引入原生模块。
 *
 * 用法：node scripts/generate-og-cover.mjs
 * 产出：assets/img/og-cover.png (1200x630)、assets/img/apple-touch-icon.png (180x180)
 */

import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'assets', 'img');

/* ========================= PNG 编码器 ========================= */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** 把 RGBA 像素缓冲编码成 PNG */
function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 位深
  ihdr[9] = 6; // 颜色类型：RGBA
  ihdr[10] = 0; // 压缩方法
  ihdr[11] = 0; // 过滤方法
  ihdr[12] = 0; // 隔行扫描

  // 每行前置一个 filter 字节（0 = None）
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ========================= 迷你绘图库 ========================= */

class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 4);
  }

  /** alpha 混合写入一个像素 */
  blend(x, y, [r, g, b], alpha = 1) {
    if (alpha <= 0 || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const a = Math.min(1, alpha);
    const dstA = this.buf[i + 3] / 255;
    const outA = a + dstA * (1 - a);
    if (outA === 0) return;
    for (let c = 0; c < 3; c++) {
      const dst = this.buf[i + c];
      const src = [r, g, b][c];
      this.buf[i + c] = Math.round((src * a + dst * dstA * (1 - a)) / outA);
    }
    this.buf[i + 3] = Math.round(outA * 255);
  }

  /** 整幅填充（用回调决定每个像素的颜色） */
  fill(fn) {
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const color = fn(x, y);
        if (color) this.blend(x, y, color, color[3] === undefined ? 1 : color[3]);
      }
    }
  }

  /** 径向光晕 */
  glow(cx, cy, radius, color, strength = 1) {
    const r2 = radius * radius;
    for (let y = Math.max(0, cy - radius); y < Math.min(this.h, cy + radius); y++) {
      for (let x = Math.max(0, cx - radius); x < Math.min(this.w, cx + radius); x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > r2) continue;
        const falloff = 1 - Math.sqrt(d2) / radius;
        this.blend(x, y, color, Math.pow(falloff, 2.1) * strength);
      }
    }
  }

  /** 圆角矩形（实心） */
  roundRect(x, y, w, h, radius, color, alpha = 1) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) {
        const dx = Math.min(px - x, x + w - 1 - px);
        const dy = Math.min(py - y, y + h - 1 - py);
        if (dx < radius && dy < radius) {
          const ox = radius - dx;
          const oy = radius - dy;
          if (ox * ox + oy * oy > radius * radius) continue;
        }
        this.blend(px, py, color, alpha);
      }
    }
  }

  /** 纵向渐变矩形（用于徽标底色） */
  roundRectGradient(x, y, w, h, radius, from, to) {
    for (let py = y; py < y + h; py++) {
      const t = (py - y) / (h - 1);
      const color = [
        Math.round(from[0] + (to[0] - from[0]) * t),
        Math.round(from[1] + (to[1] - from[1]) * t),
        Math.round(from[2] + (to[2] - from[2]) * t),
      ];
      for (let px = x; px < x + w; px++) {
        const dx = Math.min(px - x, x + w - 1 - px);
        const dy = Math.min(py - y, y + h - 1 - py);
        if (dx < radius && dy < radius) {
          const ox = radius - dx;
          const oy = radius - dy;
          if (ox * ox + oy * oy > radius * radius) continue;
        }
        this.blend(px, py, color, 1);
      }
    }
  }

  /** 实心矩形 */
  rect(x, y, w, h, color, alpha = 1) {
    for (let py = y; py < y + h; py++) {
      for (let px = x; px < x + w; px++) this.blend(px, py, color, alpha);
    }
  }

  /** 圆点 */
  dot(cx, cy, r, color, alpha = 1) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) this.blend(x, y, color, alpha);
      }
    }
  }

  toPng() {
    return encodePng(this.w, this.h, this.buf);
  }
}

/* ========================= 配色（与站点设计令牌一致） ========================= */
const BG_DEEP = [11, 17, 32]; // #0b1120
const BG_SOFT = [19, 26, 51]; // #131a33
const CYAN = [34, 211, 238]; // #22d3ee
const VIOLET = [139, 92, 246]; // #8b5cf6
const INK = [4, 18, 26]; // 徽标上的深色字母
const GRID = [148, 163, 184];

/** 画一个圆角方形徽标 + 字母 F */
function drawMonogram(canvas, x, y, size, radius) {
  canvas.roundRectGradient(x, y, size, size, radius, CYAN, VIOLET);

  // 字母 F：一条竖笔 + 两条横笔（几何构造，无需字体）
  const stemW = Math.round(size * 0.145);
  const barH = Math.round(size * 0.145);
  const px = x + Math.round(size * 0.3);
  const py = y + Math.round(size * 0.26);
  const barW = Math.round(size * 0.42);

  canvas.rect(px, py, stemW, Math.round(size * 0.48), INK);
  canvas.rect(px, py, barW, barH, INK);
  canvas.rect(px, py + Math.round(size * 0.185), Math.round(barW * 0.82), barH, INK);
}

/* ========================= 生成 OG 封面 1200x630 ========================= */
function buildCover() {
  const W = 1200;
  const H = 630;
  const c = new Canvas(W, H);

  // 1) 对角渐变底
  c.fill((x, y) => {
    const t = (x / W) * 0.45 + (y / H) * 0.55;
    return [
      Math.round(BG_DEEP[0] + (BG_SOFT[0] - BG_DEEP[0]) * t),
      Math.round(BG_DEEP[1] + (BG_SOFT[1] - BG_DEEP[1]) * t),
      Math.round(BG_DEEP[2] + (BG_SOFT[2] - BG_DEEP[2]) * t),
    ];
  });

  // 2) 两团光晕
  c.glow(1010, 90, 400, CYAN, 0.42);
  c.glow(150, 560, 360, VIOLET, 0.38);

  // 3) 背景网格（营造工程师气质）
  for (let x = 0; x < W; x += 60) {
    for (let y = 0; y < H; y += 60) {
      c.dot(x, y, 1, GRID, 0.12);
    }
  }

  // 4) 居中徽标
  const badge = 200;
  drawMonogram(c, Math.round((W - badge) / 2), 150, badge, 48);

  // 5) 文字位置用几何元素表达"品牌下划线"
  const barW = 300;
  const barH = 8;
  const barX = Math.round((W - barW) / 2);
  const barY = 420;
  for (let i = 0; i < barW; i++) {
    const t = i / (barW - 1);
    const color = [
      Math.round(CYAN[0] + (VIOLET[0] - CYAN[0]) * t),
      Math.round(CYAN[1] + (VIOLET[1] - CYAN[1]) * t),
      Math.round(CYAN[2] + (VIOLET[2] - CYAN[2]) * t),
    ];
    c.rect(barX + i, barY, 1, barH, color, 0.95);
  }

  // 6) 底部状态点（呼应站点里的"正在公开构建"）
  const dots = [CYAN, VIOLET, GRID];
  dots.forEach((color, i) => {
    c.dot(W / 2 - 24 + i * 24, barY + 62, 5, color, i === 2 ? 0.35 : 0.85);
  });

  return c.toPng();
}

/* ========================= 生成 Apple touch icon 180x180 ========================= */
function buildIcon() {
  const S = 180;
  const c = new Canvas(S, S);
  c.fill(() => null);
  drawMonogram(c, 0, 0, S, 40);
  return c.toPng();
}

/* ========================= 输出 ========================= */
mkdirSync(OUT_DIR, { recursive: true });

const cover = buildCover();
writeFileSync(join(OUT_DIR, 'og-cover.png'), cover);

const icon = buildIcon();
writeFileSync(join(OUT_DIR, 'apple-touch-icon.png'), icon);

console.log('✅ 已生成:');
console.log(`   assets/img/og-cover.png        ${(cover.length / 1024).toFixed(1)} KB (1200x630)`);
console.log(`   assets/img/apple-touch-icon.png ${(icon.length / 1024).toFixed(1)} KB (180x180)`);
