#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一更新所有HTML页面的侧边栏菜单
使用franchisees.html的侧边栏作为标准模板
"""

import re
import os

# 页面配置 - 定义每个页面应该高亮哪个菜单项
PAGE_CONFIGS = {
    'index.html': 'INDEX',
    'customers.html': 'CUSTOMERS',
    'orders.html': 'ORDERS',
    'tasks.html': 'TASKS',
    'cases.html': 'CASES',
    'templates.html': 'TEMPLATES',
    'franchisees.html': 'FRANCHISEES',
    'users.html': 'USERS',
    'organizations.html': 'ORGANIZATIONS',
    'settings.html': 'SETTINGS',
}

# 标准侧边栏模板
SIDEBAR_TEMPLATE = '''        <!-- 侧边栏 -->
        <aside id="sidebar" class="sidebar w-64 bg-white shadow-sm border-r border-gray-200 fixed md:static h-full z-40 closed md:block">
            <div class="p-4 md:p-6 space-y-6 overflow-y-auto h-full">
                <!-- 快速统计 -->
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <h3 class="text-sm font-medium text-purple-900 mb-3">今日概览</h3>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">客户总数</span>
                            <span class="font-semibold text-purple-600" id="totalCustomers">128</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">今日新增</span>
                            <span class="font-semibold text-green-600" id="newCustomers">5</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">待跟进</span>
                            <span class="font-semibold text-orange-600" id="pendingCustomers">12</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">本月订单</span>
                            <span class="font-semibold text-blue-600" id="monthlyOrders">67</span>
                        </div>
                    </div>
                </div>

                <!-- 主导航菜单 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">主要功能</h3>
                    <a href="index.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_INDEX} rounded-lg transition-colors">
                        <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                        <span>数据看板</span>
                    </a>
                    <a href="customers.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_CUSTOMERS} rounded-lg transition-colors">
                        <i data-lucide="users" class="w-4 h-4"></i>
                        <span>客户管理</span>
                        <span class="ml-auto bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full">128</span>
                    </a>
                    <a href="orders.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_ORDERS} rounded-lg transition-colors">
                        <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                        <span>订单管理</span>
                        <span class="ml-auto bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">67</span>
                    </a>
                    <a href="tasks.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_TASKS} rounded-lg transition-colors">
                        <i data-lucide="check-square" class="w-4 h-4"></i>
                        <span>任务管理</span>
                        <span class="ml-auto bg-orange-100 text-orange-800 text-xs px-2 py-0.5 rounded-full">24</span>
                    </a>
                </div>

                <!-- 智能服务 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">智能服务</h3>
                    <a href="cases.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_CASES} rounded-lg transition-colors">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        <span>客户案例</span>
                    </a>
                    <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_TEMPLATES} rounded-lg transition-colors">
                        <i data-lucide="layers" class="w-4 h-4"></i>
                        <span>方案模板</span>
                    </a>
                    <a href="franchisees.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_FRANCHISEES} rounded-lg transition-colors">
                        <i data-lucide="store" class="w-4 h-4"></i>
                        <span>加盟管理</span>
                    </a>
                    <a href="users.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_USERS} rounded-lg transition-colors ml-4">
                        <i data-lucide="user-cog" class="w-4 h-4"></i>
                        <span>用户管理</span>
                        <span class="ml-auto text-xs text-gray-500">(内部员工)</span>
                    </a>
                </div>

                <!-- 系统管理 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
                    <a href="organizations.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_ORGANIZATIONS} rounded-lg transition-colors">
                        <i data-lucide="building-2" class="w-4 h-4"></i>
                        <span>组织管理</span>
                    </a>
                    <a href="settings.html" class="flex items-center space-x-3 px-3 py-2 text-sm {ACTIVE_SETTINGS} rounded-lg transition-colors">
                        <i data-lucide="settings" class="w-4 h-4"></i>
                        <span>系统设置</span>
                    </a>
                </div>
            </div>
        </aside>'''

def get_sidebar_for_page(page_name):
    """为指定页面生成侧边栏HTML"""
    active_item = PAGE_CONFIGS.get(page_name, '')

    # 替换所有占位符
    sidebar = SIDEBAR_TEMPLATE

    # 定义所有可能的菜单项
    menu_items = ['INDEX', 'CUSTOMERS', 'ORDERS', 'TASKS', 'CASES',
                  'TEMPLATES', 'FRANCHISEES', 'USERS', 'ORGANIZATIONS', 'SETTINGS']

    # 替换每个菜单项的样式
    for item in menu_items:
        if item == active_item:
            # 当前页面 - 高亮显示
            sidebar = sidebar.replace(f'{{ACTIVE_{item}}}', 'text-blue-600 bg-blue-50 font-medium')
        else:
            # 其他页面 - 默认样式
            sidebar = sidebar.replace(f'{{ACTIVE_{item}}}', 'text-gray-700 hover:bg-gray-50')

    return sidebar

def update_html_sidebar(file_path):
    """更新HTML文件的侧边栏"""
    try:
        # 读取文件
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 提取文件名
        file_name = os.path.basename(file_path)

        # 获取该页面的侧边栏
        new_sidebar = get_sidebar_for_page(file_name)

        # 使用正则表达式替换侧边栏
        # 匹配从 <aside id="sidebar" 到 </aside>
        pattern = r'<aside id="sidebar".*?</aside>'

        if re.search(pattern, content, re.DOTALL):
            # 替换侧边栏
            new_content = re.sub(pattern, new_sidebar.strip(), content, flags=re.DOTALL)

            # 写回文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)

            print(f"[OK] 已更新: {file_name}")
            return True
        else:
            print(f"[WARN] 未找到侧边栏: {file_name}")
            return False

    except Exception as e:
        print(f"[ERROR] 更新失败 {file_name}: {str(e)}")
        return False

def main():
    """主函数"""
    base_dir = r"D:\work6\美业客户后台"

    print("="*60)
    print("开始统一更新所有HTML页面的侧边栏")
    print("="*60)
    print()

    success_count = 0
    total_count = len(PAGE_CONFIGS)

    for page_name in PAGE_CONFIGS.keys():
        file_path = os.path.join(base_dir, page_name)
        if os.path.exists(file_path):
            if update_html_sidebar(file_path):
                success_count += 1
        else:
            print(f"[WARN] 文件不存在: {page_name}")

    print()
    print("="*60)
    print(f"更新完成: {success_count}/{total_count} 个文件成功")
    print("="*60)

if __name__ == '__main__':
    main()
