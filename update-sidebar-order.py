#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新所有HTML页面的侧边栏菜单顺序
将"组织管理"移到"系统设置"下面
"""

import os
import re

# 需要修改的HTML文件列表
html_files = [
    'customers.html',
    'orders.html',
    'tasks.html',
    'cases.html',
    'templates.html',
    'franchisees.html',
    'users.html',
    'organizations.html',
    'roles.html',
    'settings.html',
    'customer-profile-templates.html',
    'task-templates.html',
    '_sidebar-template.html'
]

# 旧的侧边栏"系统管理"部分模式
old_pattern = r'''(\s+<!-- 系统管理 -->
\s+<div class="space-y-2">
\s+<h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
\s+<a href="organizations\.html"[^>]+>
\s+<i data-lucide="building-2"[^>]+></i>
\s+<span>组织管理</span>

\s+</a>
\s+<!-- 模板管理（一级菜单） -->
\s+<div class="space-y-1">
\s+<div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 font-medium">
\s+<i data-lucide="folder-open"[^>]+></i>
\s+<span>模板管理</span>
\s+</div>
\s+<!-- 模板管理二级菜单 -->
\s+<a href="templates\.html"[^>]+>
\s+<i data-lucide="layers"[^>]+></i>
\s+<span>方案模板</span>
\s+</a>
\s+<a href="customer-profile-templates\.html"[^>]+>
\s+<i data-lucide="file-edit"[^>]+></i>
\s+<span>客户模板</span>
\s+</a>
\s+<a href="task-templates\.html"[^>]+>
\s+<i data-lucide="list-checks"[^>]+></i>
\s+<span>任务模板</span>
\s+</a>
\s+</div>
\s+<a href="settings\.html"[^>]+>
\s+<i data-lucide="settings"[^>]+></i>
\s+<span>系统设置</span>

\s+</a>
\s+</div>)'''

# 新的侧边栏"系统管理"部分内容
new_content = '''                <!-- 系统管理 -->
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
                </div>'''

def update_sidebar_order(file_path):
    """更新单个HTML文件的侧边栏菜单顺序"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 使用字符串替换而不是正则表达式，因为正则表达式可能太复杂
        # 查找旧的系统管理部分并替换

        # 旧的系统管理部分（组织管理在前）
        old_section = '''                <!-- 系统管理 -->
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
                </div>'''

        if old_section in content:
            new_content_value = content.replace(old_section, new_content)
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content_value)
            return True, "成功"
        else:
            return False, "未找到匹配的侧边栏内容"

    except Exception as e:
        return False, str(e)

def main():
    """主函数"""
    print("开始更新侧边栏菜单顺序...")
    print("=" * 60)

    success_count = 0
    fail_count = 0

    for html_file in html_files:
        file_path = os.path.join(os.path.dirname(__file__), html_file)

        if not os.path.exists(file_path):
            print(f"[FAIL] {html_file} - 文件不存在")
            fail_count += 1
            continue

        success, message = update_sidebar_order(file_path)

        if success:
            print(f"[OK] {html_file} - {message}")
            success_count += 1
        else:
            print(f"[WARN] {html_file} - {message}")
            fail_count += 1

    print("=" * 60)
    print(f"更新完成! 成功: {success_count}, 失败: {fail_count}")

if __name__ == '__main__':
    main()
