# 部署到 Cloudflare Pages（让安全响应头真正生效）

## 为什么要做这一步

GitHub Pages **不支持自定义响应头**（平台限制）。因此本仓库里的 `_headers` 在 GitHub Pages 上不会被执行 ——
只有把站点部署到支持 `_headers` 的平台，那 7 项安全响应头才会真正生效。

Cloudflare Pages 免费套餐原生支持 `_headers`，**不需要自有域名**（会分配 `*.pages.dev`）。

> 本方案是**纯增量**：现有 GitHub Pages 站点完全不动，随时可回滚。

---

## 三条路径，选一条

| 路径 | 谁来做 | 适合 |
|---|---|---|
| **A. 控制台 Git 集成** | 你（浏览器点几下） | 最省事，不需要管理任何密钥 |
| **B. API Token + GitHub Secrets** | 你配一次密钥，之后全自动 | 想要"推送即部署"的完整 CI/CD |
| **C. 本地 wrangler 部署** | 助手代跑，你点一次授权 | 想立刻看到结果 |

---

## 路径 A：控制台 Git 集成（推荐新手）

1. 注册 Cloudflare 账号：<https://dash.cloudflare.com/sign-up>（邮箱 + 密码，免费）
2. 登录后进入 **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. 授权 GitHub，选择仓库 `Frank2673/Frank2673.github.io`
4. 构建设置：
   - Framework preset：**None**
   - Build command：**留空**
   - Build output directory：**`public`**
     （若你不想用 `public/`，也可以填 `/`，但那样会把 `scripts/`、`README.md` 等开发文件一起发布出去）
5. 点 **Save and Deploy**
6. 部署完成后访问 `https://<项目名>.pages.dev`

> 注意：仓库根目录的 `_headers` 会被 Cloudflare 自动识别并应用，无需额外配置。

---

## 路径 B：API Token + GitHub Secrets（推送即部署）

工作流已就绪：`.github/workflows/deploy-cloudflare-pages.yml`。未配置密钥时会**优雅跳过**，不会让 CI 变红。

### 1. 拿到 Account ID

Cloudflare 控制台 → **Workers & Pages** → 右侧栏可见 **Account ID**（一串 32 位十六进制）。

### 2. 创建 API Token

**My Profile** → **API Tokens** → **Create Token** → 使用模板 **Edit Cloudflare Workers**，
或自定义权限：

- `Account` → `Cloudflare Pages` → **Edit**
- `User` → `Memberships` → **Read**（用于列出账号）

创建后**只显示一次**，请立即复制。

### 3. 写入 GitHub Secrets

仓库 → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**：

| Name | Value |
|---|---|
| `CLOUDFLARE_API_TOKEN` | 上一步复制的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | 第 1 步的 Account ID |

### 4. 触发一次部署

推送到 `main`，或到 **Actions** → **部署到 Cloudflare Pages** → **Run workflow**。

工作流会依次执行：站点自检 → 组装 `public/` → 部署 → **部署后校验线上响应头**。

---

## 路径 C：本地 wrangler 部署（无需配置任何仓库密钥）

```bash
# 1. 授权（会打开浏览器，点 Allow）
npx wrangler login

# 2. 创建 Pages 项目（只需一次）
npx wrangler pages project create frank2673-site --production-branch=main

# 3. 构建并部署
node scripts/build-public.mjs
npx wrangler pages deploy public --project-name=frank2673-site --branch=main
```

---

## 部署后验证

```bash
node scripts/check-deployed-headers.mjs --url https://<你的站点>.pages.dev/
```

期望输出：

```
✅ 线上响应头与 _headers 完全一致（7 项全部通过）
```

也可以用 header-forge 做更细的校验（它会逐条给出「缺失 / 值不符」的明细）：

```bash
# 在 header-forge 仓库
node src/index.mjs verify --policy headers.policy.json --url https://<你的站点>.pages.dev/
```

---

## 回滚

本方案不修改 GitHub Pages 的任何配置，因此回滚只需：

1. 在 Cloudflare 控制台删除对应的 Pages 项目（或停止自动部署）
2. 现有 `frank2673.github.io` 站点不受影响，仍在正常服务

---

## 常见问题

**Q：`_headers` 放在仓库根目录，但我的发布目录是 `public`，会被带上吗？**

会。本仓库的 `scripts/build-public.mjs` 已把 `_headers` 列入发布白名单并复制到 `public/`。

**Q：部署成功了，但校验仍报缺失？**

按顺序排查：
1. 确认访问的是 `*.pages.dev` 而不是 `github.io`（后者永远不会有这些头）
2. 确认部署的是最新一次构建（控制台看部署时间）
3. 用 `curl -I https://你的站点.pages.dev/` 直接看原始响应头
4. CDN 缓存：首次部署后可能有短暂延迟，等 1–2 分钟

**Q：站点上有两个地址（github.io 和 pages.dev），会不会有 SEO 重复内容问题？**

不会。本站 `index.html` 里已经声明了 `canonical`：

```html
<link rel="canonical" href="https://frank2673.github.io/">
```

搜索引擎会把 `frank2673.github.io` 视为唯一权威地址，`pages.dev` 上的同一份内容不会被判为重复收录。
分工因此很清晰：**GitHub Pages 当门面（记录阅读量、被收录），Cloudflare Pages 负责安全响应头。**

若将来想反过来以 `pages.dev` 或自有域名为主，只需把 `canonical` 改成对应地址即可。

**Q：我想要品牌域名（而不是 `*.pages.dev`）怎么办？**

需要一个自有域名。那时可以走 header-forge 里 `MIGRATION.md` 的**方案 C**：
自有域名 + Cloudflare 代理，这也能顺带解决 DMARC（它需要域名的 DNS 控制权）。
