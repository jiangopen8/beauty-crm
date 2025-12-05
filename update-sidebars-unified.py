#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
统一更新所有页面的侧边栏菜单
按照 roles.html 的标准侧边栏结构更新所有主要页面
"""

import re
import os

# 定义标准侧边栏模板（从roles.html提取）
def get_sidebar_template(active_page):
    """
    生成侧边栏HTML，根据active_page参数高亮当前页面
    active_page可选值: index, customers, orders, tasks, cases, templates, franchisees, users, roles, organizations, settings
    """

    # 菜单项配置
    menus = {
        'index': {'label': '数据看板', 'icon': 'layout-dashboard', 'href': 'index.html', 'badge': ''},
        'customers': {'label': '客户管理', 'icon': 'users', 'href': 'customers.html', 'badge': '128'},
        'orders': {'label': '订单管理', 'icon': 'shopping-cart', 'href': 'orders.html', 'badge': '67'},
        'tasks': {'label': '任务管理', 'icon': 'check-square', 'href': 'tasks.html', 'badge': '24'},
        'cases': {'label': '客户案例', 'icon': 'file-text', 'href': 'cases.html', 'badge': ''},
        'templates': {'label': '方案模板', 'icon': 'layers', 'href': 'templates.html', 'badge': ''},
        'franchisees': {'label': '加盟管理', 'icon': 'store', 'href': 'franchisees.html', 'badge': ''},
        'users': {'label': '用户管理', 'icon': 'user-cog', 'href': 'users.html', 'badge': '', 'sub': True, 'note': '(内部员工)'},
        'roles': {'label': '角色管理', 'icon': 'shield', 'href': 'roles.html', 'badge': '', 'sub': True},
        'organizations': {'label': '组织管理', 'icon': 'building-2', 'href': 'organizations.html', 'badge': ''},
        'profile_templates': {'label': '资料模板', 'icon': 'file-edit', 'href': 'customer-profile-templates.html', 'badge': ''},
        'settings': {'label': '系统设置', 'icon': 'settings', 'href': 'settings.html', 'badge': ''},
    }

    def get_menu_class(key):
        """获取菜单项的CSS类"""
        if key == active_page:
            return 'flex items-center space-x-3 px-3 py-2 text-sm text-blue-600 bg-blue-50 font-medium rounded-lg transition-colors'
        return 'flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors'

    def render_menu_item(key, info):
        """渲染单个菜单项"""
        menu_class = get_menu_class(key)
        # 如果是子菜单，添加ml-4缩进
        if info.get('sub'):
            menu_class += ' ml-4'

        badge_html = ''
        if info['badge']:
            badge_color = {
                '128': 'bg-purple-100 text-purple-800',
                '67': 'bg-green-100 text-green-800',
                '24': 'bg-orange-100 text-orange-800'
            }.get(info['badge'], 'bg-gray-100 text-gray-800')
            badge_html = f'<span class="ml-auto {badge_color} text-xs px-2 py-0.5 rounded-full">{info["badge"]}</span>'

        note_html = ''
        if info.get('note'):
            note_html = f'<span class="ml-auto text-xs text-gray-500">{info["note"]}</span>'

        return f'''                    <a href="{info['href']}" class="{menu_class}">
                        <i data-lucide="{info['icon']}" class="w-4 h-4"></i>
                        <span>{info['label']}</span>
                        {badge_html}{note_html}
                    </a>'''

    # 构建侧边栏HTML
    sidebar_html = f'''        <!-- 侧边栏 -->
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
{render_menu_item('index', menus['index'])}
{render_menu_item('customers', menus['customers'])}
{render_menu_item('orders', menus['orders'])}
{render_menu_item('tasks', menus['tasks'])}
                </div>

                <!-- 智能服务 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">智能服务</h3>
{render_menu_item('cases', menus['cases'])}
{render_menu_item('templates', menus['templates'])}
{render_menu_item('franchisees', menus['franchisees'])}
                    <!-- 二级菜单：用户管理和角色管理 -->
{render_menu_item('users', menus['users'])}
{render_menu_item('roles', menus['roles'])}
                </div>

                <!-- 系统管理 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">系统管理</h3>
{render_menu_item('organizations', menus['organizations'])}
{render_menu_item('profile_templates', menus['profile_templates'])}
{render_menu_item('settings', menus['settings'])}
                </div>
            </div>
        </aside>

        <!-- 遮罩层 (移动端) -->
        <div id="sidebar-overlay" class="hidden md:hidden fixed inset-0 bg-black bg-opacity-50 z-30" onclick="toggleSidebar()"></div>'''

    return sidebar_html


def update_page_sidebar(filepath, active_page):
    """更新单个页面的侧边栏"""
    print(f"正在更新: {filepath} (激活菜单: {active_page})")

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # 使用正则表达式匹配并替换侧边栏部分
        # 匹配从 <!-- 侧边栏 --> 或 <aside 开始，到 <!-- 遮罩层 --> 结束的部分
        pattern = r'(\s*)(?:<!-- 侧边栏 -->[\s\n]*)*<aside id="sidebar".*?<!-- 遮罩层 \(移动端\) -->.*?</div>'

        new_sidebar = get_sidebar_template(active_page)

        # 替换侧边栏
        updated_content = re.sub(pattern, new_sidebar, content, flags=re.DOTALL)

        # 检查是否成功替换
        if updated_content == content:
            print(f"  [WARNING] {filepath} - not found sidebar markup, skipped")
            return False

        # 写回文件
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        print(f"  [SUCCESS] {filepath}")
        return True

    except Exception as e:
        print(f"  [ERROR] {filepath} - {str(e)}")
        return False


def main():
    """主函数：批量更新所有页面"""

    # 定义需要更新的页面及其激活菜单
    pages_to_update = {
        'index.html': 'index',
        'customers.html': 'customers',
        'orders.html': 'orders',
        'tasks.html': 'tasks',
        'cases.html': 'cases',
        'templates.html': 'templates',
        'franchisees.html': 'franchisees',
        'users.html': 'users',
        'roles.html': 'roles',
        'organizations.html': 'organizations',
        'customer-profile-templates.html': 'profile_templates',
        'settings.html': 'settings',
    }

    # 获取脚本所在目录
    base_dir = os.path.dirname(os.path.abspath(__file__))

    print("=" * 60)
    print("开始批量更新侧边栏菜单")
    print("=" * 60)

    success_count = 0
    fail_count = 0

    for filename, active_page in pages_to_update.items():
        filepath = os.path.join(base_dir, filename)

        if not os.path.exists(filepath):
            print(f"[WARNING] File not exists: {filepath}")
            fail_count += 1
            continue

        if update_page_sidebar(filepath, active_page):
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "=" * 60)
    print(f"更新完成！成功: {success_count}, 失败: {fail_count}")
    print("=" * 60)


if __name__ == '__main__':
    main()
