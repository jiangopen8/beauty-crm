#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有HTML页面的侧边栏菜单结构
将"方案模板"和"客户模板"归集到"系统管理 > 模板管理"下
"""

import os
import re
from pathlib import Path

# 需要更新的HTML文件列表
html_files = [
    'customers.html',
    'orders.html',
    'tasks.html',
    'cases.html',
    'templates.html',
    'franchisees.html',
    'users.html',
    'roles.html',
    'organizations.html',
    'settings.html',
    'customer-profile-templates.html'
]

# 旧的侧边栏结构模式
old_sidebar_pattern = r'(<!-- 智能服务 -->.*?)<a href="templates\.html".*?方案模板.*?</a>(.*?)(<!-- 系统管理 -->.*?)<a href="customer-profile-templates\.html".*?资料模板.*?</a>(.*?)<a href="settings\.html"'

# 新的侧边栏结构
new_sidebar_template = r'''\1\2\3<!-- 模板管理（一级菜单） -->
                    <div class="space-y-1">
                        <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 font-medium">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                            <span>模板管理</span>
                        </div>
                        <!-- 模板管理二级菜单 -->
                        <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_TEMPLATES} rounded-lg transition-colors ml-4">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                            <span>方案模板</span>
                        </a>
                        <a href="customer-profile-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_CUSTOMER_TEMPLATES} rounded-lg transition-colors ml-4">
                            <i data-lucide="file-edit" class="w-4 h-4"></i>
                            <span>客户模板</span>
                        </a>
                    </div>
                    \5<a href="settings.html"'''

def update_sidebar_in_file(file_path):
    """更新单个文件的侧边栏结构"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否需要更新
        if '资料模板' not in content and '模板管理' in content:
            print(f"[OK] {file_path} - 已经更新过，跳过")
            return True

        # 执行替换
        # 第一步：移除方案模板从智能服务
        content = re.sub(
            r'(<a href="cases\.html".*?</a>\s*)((?:<a href="templates\.html".*?</a>\s*)?)(<a href="franchisees\.html")',
            r'\1\3',
            content,
            flags=re.DOTALL
        )

        # 第二步：在系统管理下添加模板管理，移除旧的资料模板
        content = re.sub(
            r'(<a href="organizations\.html".*?</a>\s*)(<a href="customer-profile-templates\.html".*?</a>\s*)(<a href="settings\.html")',
            r'''\1<!-- 模板管理（一级菜单） -->
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
                    </div>
                    \3''',
            content,
            flags=re.DOTALL
        )

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

        print(f"[OK] {file_path} - 更新成功")
        return True

    except Exception as e:
        print(f"[FAIL] {file_path} - 更新失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("开始批量更新侧边栏菜单结构")
    print("=" * 60)
    print()

    success_count = 0
    fail_count = 0

    for html_file in html_files:
        file_path = Path(__file__).parent / html_file
        if file_path.exists():
            if update_sidebar_in_file(file_path):
                success_count += 1
            else:
                fail_count += 1
        else:
            print(f"[FAIL] {html_file} - 文件不存在")
            fail_count += 1

    print()
    print("=" * 60)
    print(f"更新完成！成功: {success_count}, 失败: {fail_count}")
    print("=" * 60)

if __name__ == '__main__':
    main()
