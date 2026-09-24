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

> ✅ **本仓库已按此路径配置完成并验证通过**（2026-09-24）。链路为：
> push → 站点自检 38 项 → 构建 `public/` → 凭据校验与诊断 → 部署到 Cloudflare Pages → 自动校验线上响应头（7/7）。
> 下面的「故障排查」一节记录了配置过程中实际踩到的 5 个坑，遇到问题先看它。

工作流已就绪：`.github/workflows/deploy-cloudflare-pages.yml`。未配置密钥时会**优雅跳过**，不会让 CI 变红。

### 1. 拿到 Account ID

Cloudflare 控制台 → **Workers & Pages** → 右侧栏可见 **Account ID**（一串 32 位十六进制）。

### 2. 创建 API Token

**My Profile** → **API Tokens** → **Create Token** → 使用模板 **Edit Cloudflare Workers**，
或自定义权限：

- `Account` → `Cloudflare Pages` → **Edit**
- `User` → `Memberships` → **Read**（用于列出账号）

创建后**只显示一次**，请立即复制。

> **令牌格式说明**（2026 年 4 月起）：Cloudflare 新建令牌采用带前缀的可扫描格式 ——
> 用户级为 `cfut_` 开头、账户级为 `cfat_`、Global Key 为 `cfk_`，后接 40 个字符与校验和，
> 总长度约 60+ 位。**不要再按"40 位"来判断有效性**（旧格式仅对 2026 年前创建的老令牌有效）。
> 参考：<https://developers.cloudflare.com/fundamentals/api/get-started/token-formats/>

> **安全提示**：Cloudflare 已加入 GitHub Secret Scanning —— 若令牌被提交进**公开仓库**，
> Cloudflare 会自动吊销它。所以务必放进 **GitHub Secrets**（加密存储），不要写进任何文件。

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

---

## 故障排查：配置过程中真实踩过的 5 个坑

以下每一条都是本仓库实际发生过的故障，附**症状 → 根因 → 修复**。工作流里已内置诊断，遇到问题先看 CI 日志里的 `::notice::` / `::warning::` 行。

### 坑 1：把密钥直接插值进 `run:` 脚本 → 引号被截断

**症状**：CI 报 `/home/runner/work/_temp/xxx.sh: line 4: unexpected EOF while looking for matching '"'`

**根因**：写成 `if [ -n "${{ secrets.X }}" ]` —— 当密钥值含换行或特殊字符时，插值后把 shell 引号截断。

**修复**：密钥一律通过 `env:` 注入，脚本里引用变量：

```yaml
env:
  RAW_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
run: |
  token="$RAW_API_TOKEN"
```

### 坑 2：`tr` 的八进制转义陷阱 → 令牌被清空

**症状**：工作流"成功"但**跳过了部署**，日志显示「未配置 Cloudflare 凭据」。

**根因**：写了 `tr -cd '\040-\0176'`。`tr` 的 `\ooo` **最多解析 3 位八进制**，于是被拆成 `\017`(=15) + 字面量 `6`，区间变成 32–15（反向），`tr` 直接报
`range-endpoints of ' -\017' are in reverse collating sequence order` 并输出空值。

**修复**：用 POSIX 字符类，可读性也更好：

```bash
token="$(printf '%s' "$RAW_API_TOKEN" | LC_ALL=C tr -cd '[:print:]' | tr -d '[:space:]')"
```

### 坑 3：令牌格式假设过时 → 有效令牌被误判

**症状**：格式校验报「实际长度 62，应为 40 位」，但令牌其实是对的。

**根因**：按旧规范（40 位无前缀）判断。Cloudflare 自 2026 年起新建令牌改为**带前缀的可扫描格式**：
`cfut_`（用户级）/ `cfat_`（账户级）/ `cfk_`（Global Key）+ 40 字符 + 校验和，总长约 53–62 位。
参考：<https://developers.cloudflare.com/fundamentals/api/get-started/token-formats/>

**修复**：只拦「明显不是 Cloudflare 凭证」的情况（`ghp_`/`github_pat_`/`AKIA`/`sk-`/`AIza` 等其它平台前缀），
其余交给 Cloudflare API 判定；未知格式只告警不阻断。

### 坑 4：粘贴成了命令文本 → 6111 Invalid format for Authorization header

**症状**：Cloudflare 对所有请求返回
`{"code":6003,"message":"Invalid request headers","error_chain":[{"code":6111,"message":"Invalid format for Authorization header"}]}`

**根因**：密钥框里存的**不是令牌值**，而是一段命令文本（实测抓到开头是 `curl"https://api…`）。
用鼠标拖拽选中复制、或从聊天记录里误复制，都会造成这种结果。

**定位方法**（工作流已内置，不泄露密钥内容）：

```
令牌构成：总长 62｜大写 0｜小写 48｜数字 1｜连字符 0｜下划线 0｜其它字符 13
前缀为「cu」，不是 cf 开头
字符集合为：["./:\]
```

看到「其它字符 > 0」且「不以 cf 开头」，基本就是复制错了内容。

**修复**：在 Cloudflare 令牌页面点 **Copy 按钮**复制（不要拖拽选中）。
或使用 `scripts/set-cloudflare-token.ps1` —— 它会在写入前校验格式并调用 Cloudflare 实测有效性。

### 坑 5：令牌有效但缺权限 → 9109 / 10000

**症状**：诊断①令牌有效，但②③返回

```
② HTTP 403 {"code":9109,"message":"Unauthorized to access requested resource"}
③ HTTP 403 {"code":10000,"message":"Authentication error"}
```

**根因**：令牌创建时**权限**或**账户资源**没配全。后者尤其容易漏 —— 权限给了但没选账号，等于令牌不覆盖任何账号。

**修复**：编辑令牌（或新建自定义令牌），确保：

| 项目 | 应为 |
|---|---|
| Permissions | `Account` → `Cloudflare Pages` → **Edit** |
| Account Resources | `Include` → 你的账号 |

> 注意：诊断②（读取账号详情）需要 `Account Settings:Read`。**最小权限令牌返回 403 是正常的**，
> 不影响部署 —— 只有诊断③（列出 Pages 项目）才是部署真正依赖的权限。
