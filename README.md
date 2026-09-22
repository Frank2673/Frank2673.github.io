# Frank2673.github.io

[![CI](https://github.com/Frank2673/Frank2673.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/Frank2673/Frank2673.github.io/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

个人主页源码 —— **零依赖静态站**：没有框架、没有构建步骤、没有外部 CDN，纯手写 HTML / CSS / JS，由 GitHub Pages 托管、GitHub Actions 守护质量。

🔗 **线上地址**：<https://frank2673.github.io/>

---

## 为什么这么做

个人主页是最该"轻"的项目：它不需要 npm 安装、不需要打包工具，任何人 clone 下来双击就能看。所以这里的每一个字节都是可读、可改、可追溯的——这本身就是一种工程态度。

## 目录结构

```
.
├── index.html              # 主页（单页，含 SEO 结构化数据）
├── 404.html                # 自定义 404 页
├── assets/
│   ├── css/style.css       # 全部样式：设计令牌 → 组件 → 响应式 → 打印
│   ├── js/main.js          # 交互：主题切换 / 导航 / 滚动动效 / 导航高亮
│   └── img/                # 图标与社交分享图
├── scripts/
│   ├── validate-site.mjs   # 站点自检（CI 与本地共用）
│   └── generate-og-cover.mjs  # 生成社交分享图（纯 Node，无依赖）
├── .github/workflows/ci.yml   # 质量检查流水线
├── robots.txt / sitemap.xml   # 搜索引擎配置
└── .nojekyll               # 告诉 Pages 不要用 Jekyll 处理
```

## 本地预览

不需要任何依赖，二选一：

```bash
# 方式一：Python 自带服务器（推荐）
python -m http.server 8080

# 方式二：Node
npx --yes serve .
```

然后浏览器打开 <http://localhost:8080>。

> 直接双击 `index.html` 也能看，但用本地服务器更接近线上环境（绝对路径资源才正常）。

## 质量自检

改完代码先跑一遍自检，和 CI 用的是同一套标准：

```bash
node scripts/validate-site.mjs
```

它会检查：必需文件是否齐全、内部链接与资源是否存在、是否误引外部依赖、SEO 元信息是否完整、无障碍基础项是否达标。

## 怎么改内容

| 想改什么 | 改哪里 |
|---|---|
| 自我介绍、技能、项目卡片 | `index.html` 里对应区块（项目卡片有注释标记，复制即可新增） |
| 颜色、间距、字体 | `assets/css/style.css` 顶部「设计令牌」区，改一处全局生效 |
| 交互行为 | `assets/js/main.js`，每个功能一个独立函数 |
| 社交分享图 | 改 `scripts/generate-og-cover.mjs` 里的颜色参数后重新生成 |

## 部署方式

**自动**：推送到 `main` 分支即自动发布（GitHub Pages 分支部署）。

```bash
git add .
git commit -m "feat: 更新主页内容"   # 提交信息需符合 Conventional Commits
git push
```

**质量门禁**：每次 push / PR 都会触发 `.github/workflows/ci.yml`，检查不通过就亮红灯。

## 技术要点

- **主题**：深/浅色自动跟随系统，可手动切换并记住选择（`localStorage`）
- **无障碍**：跳转链接、语义化标签、键盘可达、焦点可见、`prefers-reduced-motion` 支持
- **SEO**：canonical、Open Graph、Twitter 卡片、JSON-LD `Person` 结构化数据、`sitemap.xml`
- **性能**：零外部请求（系统字体 + 内联 SVG 图标），首屏无阻塞脚本
- **降级**：禁用 JavaScript 时页面依然完整可读、可导航

## 许可

[MIT](LICENSE) © 2026 Frank2673
