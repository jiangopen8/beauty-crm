# 批量修复移动端适配问题
# 1. 修复viewport配置（移除user-scalable=no）
# 2. 添加移动端样式文件引用

$files = @(
    "index.html",
    "customers.html",
    "customer-detail.html",
    "orders.html",
    "order-detail.html",
    "tasks.html",
    "cases.html",
    "templates.html",
    "franchisees.html",
    "settings.html"
)

foreach ($file in $files) {
    Write-Host "处理文件: $file" -ForegroundColor Cyan

    $content = Get-Content $file -Raw -Encoding UTF8

    # 1. 修复viewport配置
    $oldViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">'
    $newViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0">'

    if ($content -match [regex]::Escape($oldViewport)) {
        $content = $content -replace [regex]::Escape($oldViewport), $newViewport
        Write-Host "  ✓ 已修复viewport配置" -ForegroundColor Green
    } else {
        Write-Host "  - viewport已正确配置" -ForegroundColor Yellow
    }

    # 2. 添加移动端样式引用
    $stylesLine = '<link rel="stylesheet" href="css/styles.css">'
    $mobileStylesLine = '    <link rel="stylesheet" href="css/mobile-optimizations.css">'

    if ($content -notmatch [regex]::Escape($mobileStylesLine)) {
        # 在styles.css后面添加mobile-optimizations.css
        $content = $content -replace [regex]::Escape($stylesLine), "$stylesLine`n$mobileStylesLine"
        Write-Host "  ✓ 已添加移动端样式引用" -ForegroundColor Green
    } else {
        Write-Host "  - 移动端样式已引用" -ForegroundColor Yellow
    }

    # 3. 保存文件
    $content | Set-Content $file -Encoding UTF8 -NoNewline
    Write-Host "  ✓ 文件已保存`n" -ForegroundColor Green
}

Write-Host "="*50 -ForegroundColor Cyan
Write-Host "所有文件处理完成！" -ForegroundColor Green
Write-Host "="*50 -ForegroundColor Cyan
