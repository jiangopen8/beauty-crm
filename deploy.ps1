# 美业CRM系统部署脚本 (PowerShell)
# 目标服务器: 8.210.246.101:5002

$ErrorActionPreference = "Stop"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  美业CRM系统 - 部署脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 服务器配置
$SERVER_IP = "8.210.246.101"
$SERVER_USER = "root"
$REMOTE_DIR = "/var/www/beauty-crm"

Write-Host "步骤 1: 检查本地环境..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "错误: 未找到 package.json 文件" -ForegroundColor Red
    exit 1
}
Write-Host "✓ 本地文件检查完成" -ForegroundColor Green
Write-Host ""

Write-Host "步骤 2: 使用rsync上传文件..." -ForegroundColor Yellow
Write-Host "提示: 请确保已安装Git Bash或WSL，并配置了SSH密钥" -ForegroundColor Cyan
Write-Host ""

# 检查是否安装了WSL或Git Bash
$hasWSL = Get-Command wsl -ErrorAction SilentlyContinue
$hasGitBash = Test-Path "C:\Program Files\Git\usr\bin\bash.exe"

if ($hasWSL) {
    Write-Host "使用WSL执行部署..." -ForegroundColor Cyan
    wsl bash -c "cd /mnt/d/work6/美业客户后台 && bash deploy.sh"
} elseif ($hasGitBash) {
    Write-Host "使用Git Bash执行部署..." -ForegroundColor Cyan
    & "C:\Program Files\Git\usr\bin\bash.exe" -c "cd '/d/work6/美业客户后台' && bash deploy.sh"
} else {
    Write-Host ""
    Write-Host "未检测到WSL或Git Bash，请手动执行以下命令：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 打开Git Bash终端" -ForegroundColor White
    Write-Host "2. 执行命令: bash deploy.sh" -ForegroundColor White
    Write-Host ""
    Write-Host "或者使用SCP手动上传文件：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "pscp -r * ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "部署提示：" -ForegroundColor Cyan
Write-Host "  如果您是首次部署，请确保：" -ForegroundColor White
Write-Host "  1. 服务器已安装 Node.js、PM2、Nginx" -ForegroundColor White
Write-Host "  2. 已配置SSH密钥认证" -ForegroundColor White
Write-Host "  3. .env文件已正确配置" -ForegroundColor White
Write-Host ""
