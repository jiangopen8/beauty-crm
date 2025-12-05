#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新所有页面的侧边栏菜单
统一模板管理菜单顺序：客户模板 → 诊断模板 → 方案模板 → 任务模板
"""

import os
import re

# 标准的模板管理菜单HTML
STANDARD_TEMPLATE_MENU = '''                    <!-- 系统管理 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
                    <!-- 模板管理（一级菜单） -->
                    <div class="space-y-1">
                        <div class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 font-medium">
                            <i data-lucide="folder-open" class="w-4 h-4"></i>
                            <span>模板管理</span>
                        </div>
                        <!-- 模板管理二级菜单 - 按业务流程排序 -->
                        <a href="customer-profile-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="user-square" class="w-4 h-4"></i>
                            <span>客户模板</span>
                        </a>
                        <a href="diagnosis-templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="stethoscope" class="w-4 h-4"></i>
                            <span>诊断模板</span>
                        </a>
                        <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors ml-4">
                            <i data-lucide="layers" class="w-4 h-4"></i>
                            <span>方案模板</span>
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

# 需要更新的HTML文件列表
HTML_FILES = [
    'index.html',
    'customers.html',
    'orders.html',
    'tasks.html',
    'cases.html',
    'users.html',
    'roles.html',
    'organizations.html',
    'franchisees.html',
    'settings.html',
    'customer-profile-templates.html',
    'diagnosis-templates.html',
    'templates.html',
    'task-templates.html',
]

def update_sidebar(filepath):
    """更新单个文件的侧边栏菜单"""
    if not os.path.exists(filepath):
        print(f'[SKIP] 文件不存在: {filepath}')
        return False

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 检查是否包含侧边栏
        if '<aside' not in content or '系统管理' not in content:
            print(f'[SKIP] 未找到侧边栏: {filepath}')
            return False

        # 匹配模式：从 "<!-- 系统管理 -->" 开始，到下一个主要的 </div> 或 </aside>
        # 使用多个模式尝试匹配不同的侧边栏结构

        patterns = [
            # 模式1: 系统管理部分后面跟着 </div>\n</aside>
            (r'([ \t]*)<!-- 系统管理 -->.*?</div>\s*</div>\s*</aside>',
             lambda indent: STANDARD_TEMPLATE_MENU + '\n' + indent + '</div>\n' + indent[:-4] + '</aside>'),

            # 模式2: 系统管理部分后面跟着 </div>\n<div (遮罩层)
            (r'([ \t]*)<!-- 系统管理 -->.*?</div>\s*</div>\s*</aside>\s*<!-- 遮罩层',
             lambda indent: STANDARD_TEMPLATE_MENU + '\n' + indent + '</div>\n' + indent[:-4] + '</aside>\n\n' + indent[:-4] + '<!-- 遮罩层'),
        ]

        updated = False
        for pattern, replacer in patterns:
            regex = re.compile(pattern, re.DOTALL)
            match = regex.search(content)

            if match:
                indent = match.group(1)
                replacement = replacer(indent)
                new_content = regex.sub(replacement, content, count=1)

                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f'[OK] 已更新: {filepath}')
                    updated = True
                    break
                else:
                    print(f'[SKIP] 无需更新: {filepath}')
                    updated = True
                    break

        if not updated:
            print(f'[WARN] 未匹配到模式: {filepath}')
            return False

        return True

    except Exception as e:
        print(f'[ERROR] 更新失败 {filepath}: {str(e)}')
        return False

def main():
    """主函数"""
    print('='*60)
    print('开始批量更新侧边栏菜单')
    print('='*60)
    print()
    print('标准菜单顺序:')
    print('  系统管理 → 模板管理')
    print('    1. 客户模板')
    print('    2. 诊断模板')
    print('    3. 方案模板')
    print('    4. 任务模板')
    print()
    print('='*60)
    print()

    success_count = 0
    skip_count = 0
    error_count = 0

    for filename in HTML_FILES:
        result = update_sidebar(filename)
        if result:
            success_count += 1
        elif os.path.exists(filename):
            error_count += 1
        else:
            skip_count += 1

    print()
    print('='*60)
    print('更新完成!')
    print('='*60)
    print(f'成功更新: {success_count} 个文件')
    print(f'跳过文件: {skip_count} 个文件')
    print(f'更新失败: {error_count} 个文件')
    print('='*60)

if __name__ == '__main__':
    main()
