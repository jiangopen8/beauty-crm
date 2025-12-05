#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新所有页面的侧边栏，添加任务模板链接
"""

import os
import re
from pathlib import Path

# 需要更新的HTML文件列表
html_files = [
    'index.html',
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
    'customer-profile-templates.html',
    'task-templates.html'
]

# 要插入的任务模板链接
task_template_link = '''                        <a href="task-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="list-checks" class="w-4 h-4"></i>
                            <span>任务模板</span>
                        </a>'''

success_count = 0
fail_count = 0
skip_count = 0

print("====================================")
print("  批量更新侧边栏菜单")
print("====================================\n")

for html_file in html_files:
    file_path = Path(__file__).parent / html_file

    if not file_path.exists():
        print(f"[SKIP] {html_file} - 文件不存在")
        skip_count += 1
        continue

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否已经包含任务模板链接
        if 'task-templates.html' in content:
            print(f"[OK] {html_file} - 已包含任务模板链接，跳过")
            skip_count += 1
            continue

        # 查找客户模板链接后面的位置，插入任务模板链接
        pattern = r'(<a href="customer-profile-templates\.html".*?</a>)'

        def add_task_template(match):
            return match.group(1) + '\n' + task_template_link

        new_content = re.sub(pattern, add_task_template, content, flags=re.DOTALL)

        if new_content == content:
            print(f"[FAIL] {html_file} - 未找到插入点")
            fail_count += 1
            continue

        # 保存文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"[OK] {html_file} - 更新成功")
        success_count += 1

    except Exception as e:
        print(f"[FAIL] {html_file} - 错误: {str(e)}")
        fail_count += 1

print(f"\n====================================")
print(f"  更新完成")
print(f"====================================")
print(f"成功: {success_count}")
print(f"跳过: {skip_count}")
print(f"失败: {fail_count}")
