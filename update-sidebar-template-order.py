#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新所有页面的侧边栏菜单顺序
按照业务流程：客户模板 → 诊断模板 → 方案模板 → 任务模板
"""

import os
import re

# 新的模板管理菜单顺序（HTML格式）
NEW_TEMPLATE_MENU = '''                    <!-- 模板管理 -->
                    <div class="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        模板管理
                    </div>
                    <a href="customer-profile-templates.html" class="nav-link flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                        <i data-lucide="user-square" class="w-5 h-5 mr-3"></i>
                        <span>客户模板</span>
                    </a>
                    <a href="diagnosis-templates.html" class="nav-link flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                        <i data-lucide="stethoscope" class="w-5 h-5 mr-3"></i>
                        <span>诊断模板</span>
                    </a>
                    <a href="templates.html" class="nav-link flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                        <i data-lucide="file-text" class="w-5 h-5 mr-3"></i>
                        <span>方案模板</span>
                    </a>
                    <a href="task-templates.html" class="nav-link flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                        <i data-lucide="list-checks" class="w-5 h-5 mr-3"></i>
                        <span>任务模板</span>
                    </a>'''

def update_sidebar_menu(filepath):
    """更新单个文件的侧边栏菜单"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 查找模板管理部分的开始和结束
        # 模式：从"模板管理"标题到下一个分组或侧边栏结束
        pattern = r'(<!-- 模板管理 -->.*?<div class="px-3 py-2 text-xs font-semibold.*?模板管理.*?</div>)(.*?)((?=<div class="px-3 py-2 text-xs font-semibold)|(?=</nav>))'

        # 如果找到模板管理部分
        if re.search(pattern, content, re.DOTALL):
            # 替换模板管理部分
            new_content = re.sub(pattern, rf'\1{NEW_TEMPLATE_MENU}\n\n                    \3', content, flags=re.DOTALL)

            # 只在内容有变化时写入
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'[OK] 已更新: {filepath}')
                return True
            else:
                print(f'[SKIP] 无需更新: {filepath}')
                return False
        else:
            print(f'[WARN] 未找到模板管理部分: {filepath}')
            return False

    except Exception as e:
        print(f'[ERROR] 更新失败 {filepath}: {str(e)}')
        return False

def main():
    """主函数"""
    # 需要更新的HTML文件列表
    html_files = [
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
        'customer-detail.html',
        'customer-detail-v2.html'
    ]

    print('开始更新侧边栏菜单顺序...\n')
    print('新顺序：客户模板 → 诊断模板 → 方案模板 → 任务模板\n')

    success_count = 0
    for filename in html_files:
        if os.path.exists(filename):
            if update_sidebar_menu(filename):
                success_count += 1
        else:
            print(f'[WARN] 文件不存在: {filename}')

    print(f'\n完成！成功更新 {success_count} 个文件')

if __name__ == '__main__':
    main()
