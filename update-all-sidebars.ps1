# PowerShell script to update sidebar menu order in all HTML files
# Move "组织管理" (Organization Management) to bottom, after "系统设置" (System Settings)

$files = @(
    "orders.html",
    "tasks.html",
    "cases.html",
    "templates.html",
    "franchisees.html",
    "users.html",
    "organizations.html",
    "roles.html",
    "settings.html",
    "customer-profile-templates.html",
    "task-templates.html"
)

$oldPattern = @"
                <!-- 系统管理 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
                    <a href="organizations.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <i data-lucide="building-2" class="w-4 h-4"></i>
                        <span>组织管理</span>

                    </a>
                    <!-- 模板管理（一级菜单） -->
                    <div class="space-y-1">
                        <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 font-medium">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                            <span>模板管理</span>
                        </div>
                        <!-- 模板管理二级菜单 -->
                        <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                            <span>方案模板</span>
                        </a>
                        <a href="customer-profile-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="file-edit" class="w-4 h-4"></i>
                            <span>客户模板</span>
                        </a>
                        <a href="task-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="list-checks" class="w-4 h-4"></i>
                            <span>任务模板</span>
                        </a>
                    </div>
                    <a href="settings.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                        <span>系统设置</span>

                    </a>
                </div>
"@

$newPattern = @"
                <!-- 系统管理 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
                    <!-- 模板管理（一级菜单） -->
                    <div class="space-y-1">
                        <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 font-medium">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                            <span>模板管理</span>
                        </div>
                        <!-- 模板管理二级菜单 -->
                        <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                            <span>方案模板</span>
                        </a>
                        <a href="customer-profile-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="file-edit" class="w-4 h-4"></i>
                            <span>客户模板</span>
                        </a>
                        <a href="task-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="list-checks" class="w-4 h-4"></i>
                            <span>任务模板</span>
                        </a>
                    </div>
                    <a href="settings.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                        <span>系统设置</span>

                    </a>
                    <a href="organizations.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                        <i data-lucide="building-2" class="w-4 h-4"></i>
                        <span>组织管理</span>

                    </a>
                </div>
"@

$successCount = 0
$failCount = 0

Write-Host "开始更新侧边栏菜单顺序..." -ForegroundColor Cyan
Write-Host "============================================================"

foreach ($file in $files) {
    if (Test-Path $file) {
        try {
            $content = Get-Content -Path $file -Raw -Encoding UTF8

            if ($content -match [regex]::Escape($oldPattern)) {
                $newContent = $content -replace [regex]::Escape($oldPattern), $newPattern
                Set-Content -Path $file -Value $newContent -Encoding UTF8 -NoNewline
                Write-Host "[OK] $file - 成功更新" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "[SKIP] $file - 未找到匹配内容" -ForegroundColor Yellow
                $failCount++
            }
        } catch {
            Write-Host "[FAIL] $file - 错误: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    } else {
        Write-Host "[FAIL] $file - 文件不存在" -ForegroundColor Red
        $failCount++
    }
}

Write-Host "============================================================"
Write-Host "更新完成! 成功: $successCount, 失败/跳过: $failCount" -ForegroundColor Cyan
