#!/bin/bash

# 定义要处理的文件列表
FILES=("orders.html" "cases.html" "franchisees.html" "users.html" "organizations.html" "roles.html" "settings.html" "customer-profile-templates.html" "task-templates.html" "templates.html")

echo "开始批量更新侧边栏菜单顺序..."
echo "================================================================="

SUCCESS=0
FAIL=0

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        # 使用perl进行多行替换，匹配并交换组织管理和模板管理+系统设置的位置
        perl -i -pe 'BEGIN{undef $/;} s/(<h3[^>]*>系统管理<\/h3>\s*<a href="organizations\.html".*?<span>组织管理<\/span>.*?<\/a>\s*)(<!-- 模板管理.*?<\/div>\s*<a href="settings\.html".*?<span>系统设置<\/span>.*?<\/a>)/$2\n                    <a href="organizations.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">\n                        <i data-lucide="building-2" class="w-4 h-4"><\/i>\n                        <span>组织管理<\/span>\n\n                    <\/a>/s' "$file"

        if [ $? -eq 0 ]; then
            echo "[OK] $file - 更新成功"
            ((SUCCESS++))
        else
            echo "[FAIL] $file - 更新失败"
            ((FAIL++))
        fi
    else
        echo "[SKIP] $file - 文件不存在"
        ((FAIL++))
    fi
done

echo "================================================================="
echo "更新完成! 成功: $SUCCESS, 失败/跳过: $FAIL"
