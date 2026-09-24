<#
.SYNOPSIS
  交互式设置 Cloudflare API Token 密钥（带格式校验与真实有效性验证）

.DESCRIPTION
  直接往 GitHub 密钥框里粘贴很容易出错 —— 实测踩过两种：
    ① 粘贴成了别的内容（例如从聊天记录里带入了 curl 命令，值以 curl"https:// 开头）
    ② 带入了不可见字符（零宽空格、换行），导致 Authorization 头格式非法

  本脚本把「粘贴 → 校验 → 验证 → 写入」串成一件事：
    - 输入时不回显（避免令牌留在屏幕/历史里）
    - 先做格式校验（前缀与字符集）
    - 再调用 Cloudflare API 真实验证令牌是否有效
    - 两者都通过才写入 GitHub 密钥

  令牌不会打印出来，也不会写进任何文件。

.EXAMPLE
  pwsh -File scripts/set-cloudflare-token.ps1
#>

[CmdletBinding()]
param(
    [string]$Repo = 'Frank2673/Frank2673.github.io',
    [string]$SecretName = 'CLOUDFLARE_API_TOKEN'
)

$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '=== 设置 Cloudflare API Token 密钥 ===' -ForegroundColor Cyan
Write-Host '在 Cloudflare 控制台创建/滚动令牌后，点页面上方的 Copy 按钮复制，再粘到这里。'
Write-Host '（不要用鼠标选中拖拽复制，容易连带页面其它文字）'
Write-Host ''
Write-Host '提示：令牌值只显示一次，形如 cfut_ 开头的一长串字符。' -ForegroundColor DarkGray
Write-Host ''

# ---------- 1. 隐藏输入 ----------
$secure = Read-Host -Prompt '粘贴令牌（输入不显示）' -AsSecureString
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $raw = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

if ([string]::IsNullOrWhiteSpace($raw)) {
    Write-Host '❌ 没有输入内容。' -ForegroundColor Red
    exit 1
}

# ---------- 2. 清理：只保留可打印 ASCII，去掉首尾空白 ----------
$clean = ($raw -replace '[^\x20-\x7E]', '').Trim()
if ($clean -ne $raw.Trim()) {
    Write-Host "⚠️  输入中含有不可见/非 ASCII 字符（已自动剔除）。原始长度 $($raw.Length)，清理后 $($clean.Length)。" -ForegroundColor Yellow
}

# ---------- 3. 格式校验 ----------
Write-Host ''
Write-Host "长度：$($clean.Length)" -ForegroundColor DarkGray
Write-Host "开头片段：$($clean.Substring(0, [Math]::Min(16, $clean.Length)))…" -ForegroundColor DarkGray

$looksLikeToken =
    $clean -match '^cf(ut|at|k)_[A-Za-z0-9]{40,}$' -or   # 2026 起的新格式
    $clean -match '^[A-Za-z0-9_-]{40}$'                  # 旧格式

$looksLikeOtherPlatform =
    $clean -match '^(ghp_|gho_|ghs_|github_pat_|AKIA|ASIA|sk-|xox[bp]-|AIza)'

if ($looksLikeOtherPlatform) {
    Write-Host '❌ 这看起来是其它平台的凭证，不是 Cloudflare API Token。' -ForegroundColor Red
    exit 1
}

if (-not $looksLikeToken) {
    Write-Host '❌ 格式不像 Cloudflare 令牌。' -ForegroundColor Red
    Write-Host '   期望：以 cfut_ / cfat_ / cfk_ 开头（2026 起新格式），或 40 位字母数字（旧格式）。' -ForegroundColor Red
    Write-Host '   常见错误：复制成了页面上的命令、令牌名称或令牌 ID。' -ForegroundColor Red
    Write-Host ''
    Write-Host '   正确做法：控制台 → My Profile → API Tokens → 创建或 Roll 令牌 →' -ForegroundColor Yellow
    Write-Host '             在“令牌已创建”页面点 Copy 按钮。' -ForegroundColor Yellow
    exit 1
}
Write-Host '✅ 格式校验通过' -ForegroundColor Green

# ---------- 4. 调用 Cloudflare API 实测有效性 ----------
Write-Host ''
Write-Host '正在向 Cloudflare 验证令牌有效性…' -ForegroundColor DarkGray

try {
    $verify = Invoke-RestMethod -Method Get `
        -Uri 'https://api.cloudflare.com/client/v4/user/tokens/verify' `
        -Headers @{ Authorization = "Bearer $clean" } `
        -TimeoutSec 20
} catch {
    Write-Host "❌ 调用 Cloudflare API 失败：$($_.Exception.Message)" -ForegroundColor Red
    Write-Host '   若为网络问题，请稍后重试；若为 4xx，多半是令牌本身无效。' -ForegroundColor Yellow
    exit 1
}

if (-not $verify.success) {
    Write-Host '❌ Cloudflare 判定该令牌无效：' -ForegroundColor Red
    $verify.errors | ForEach-Object { Write-Host "   [$($_.code)] $($_.message)" -ForegroundColor Red }
    exit 1
}

Write-Host "✅ 令牌有效（状态：$($verify.result.status)）" -ForegroundColor Green

# ---------- 5. 写入 GitHub 密钥（经 stdin，不出现在命令行参数里） ----------
Write-Host ''
Write-Host "正在写入密钥 $SecretName → $Repo …" -ForegroundColor DarkGray

$clean | gh secret set $SecretName --repo $Repo
if ($LASTEXITCODE -ne 0) {
    Write-Host '❌ 写入失败。请确认本机已完成 gh 登录（gh auth status）。' -ForegroundColor Red
    exit 1
}

Write-Host ''
Write-Host '🎉 完成！密钥已更新，且已验证真实有效。' -ForegroundColor Green
Write-Host ''
Write-Host '下一步：触发部署工作流验证全链路' -ForegroundColor Cyan
Write-Host "  gh workflow run deploy-cloudflare-pages.yml --repo $Repo" -ForegroundColor DarkGray
Write-Host ''
