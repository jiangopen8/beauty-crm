# 更新所有页面的侧边栏菜单
# 将用户管理和角色管理改为加盟管理的二级菜单

import os
import re

# 定义需要更新的HTML文件列表
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
    'settings.html'
]

# 定义新的侧边栏菜单HTML - 智能服务部分
new_sidebar_section = '''                <!-- 智能服务 -->
                <div class="space-y-2">
                    <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">智能服务</h3>
                    <a href="cases.html" class="flex items-center space-x-3 px-3 py-2 text-sm {cases_highlight} rounded-lg transition-colors">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        <span>客户案例</span>
                    </a>
                    <a href="templates.html" class="flex items-center space-x-3 px-3 py-2 text-sm {templates_highlight} rounded-lg transition-colors">
                        <i data-lucide="layers" class="w-4 h-4"></i>
                        <span>方案模板</span>
                    </a>
                    <a href="franchisees.html" class="flex items-center space-x-3 px-3 py-2 text-sm {franchisees_highlight} rounded-lg transition-colors">
                        <i data-lucide="store" class="w-4 h-4"></i>
                        <span>加盟管理</span>
                    </a>
                    <!-- 二级菜单：用户管理和角色管理 -->
                    <a href="users.html" class="flex items-center space-x-3 px-3 py-2 text-sm {users_highlight} rounded-lg transition-colors ml-4">
                        <i data-lucide="user-cog" class="w-4 h-4"></i>
                        <span>用户管理</span>
                        <span class="ml-auto text-xs text-gray-500">(内部员工)</span>
                    </a>
                    <a href="roles.html" class="flex items-center space-x-3 px-3 py-2 text-sm {roles_highlight} rounded-lg transition-colors ml-4">
                        <i data-lucide="shield" class="w-4 h-4"></i>
                        <span>角色管理</span>
                    </a>
                </div>'''

# 页面高亮映射
page_highlights = {
    'index.html': {},
    'customers.html': {},
    'orders.html': {},
    'tasks.html': {},
    'cases.html': {'cases_highlight': 'text-blue-600 bg-blue-50 font-medium'},
    'templates.html': {'templates_highlight': 'text-blue-600 bg-blue-50 font-medium'},
    'franchisees.html': {'franchisees_highlight': 'text-blue-600 bg-blue-50 font-medium'},
    'users.html': {'users_highlight': 'text-blue-600 bg-blue-50 font-medium'},
    'roles.html': {'roles_highlight': 'text-blue-600 bg-blue-50 font-medium'},
    'organizations.html': {},
    'settings.html': {}
}

def get_highlight_classes(filename):
    """获取当前页面的高亮类名"""
    highlights = page_highlights.get(filename, {})
    return {
        'cases_highlight': highlights.get('cases_highlight', 'text-gray-700 hover:bg-gray-50'),
        'templates_highlight': highlights.get('templates_highlight', 'text-gray-700 hover:bg-gray-50'),
        'franchisees_highlight': highlights.get('franchisees_highlight', 'text-gray-700 hover:bg-gray-50'),
        'users_highlight': highlights.get('users_highlight', 'text-gray-700 hover:bg-gray-50'),
        'roles_highlight': highlights.get('roles_highlight', 'text-gray-700 hover:bg-gray-50')
    }

def update_sidebar(content, filename):
    """更新侧边栏HTML"""
    # 匹配智能服务部分（从<h3>智能服务</h3>到下一个<div class="space-y-2">之前）
    pattern = r'(<h3[^>]*>智能服务</h3>.*?</div>)\s*(?=<!--\s*系统管理\s*-->|<div class="space-y-2">\s*<h3[^>]*>系统管理</h3>)'

    # 获取高亮类名
    highlights = get_highlight_classes(filename)
    new_section = new_sidebar_section.format(**highlights)

    # 替换内容
    updated_content = re.sub(pattern, new_section, content, flags=re.DOTALL)

    return updated_content

def main():
    updated_count = 0
    failed_files = []

    for filename in html_files:
        filepath = filename

        if not os.path.exists(filepath):
            print(f"⚠️  文件不存在: {filename}")
            failed_files.append(filename)
            continue

        try:
            # 读取文件
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # 更新侧边栏
            updated_content = update_sidebar(content, filename)

            # 写回文件
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)

            print(f"✅ 已更新: {filename}")
            updated_count += 1

        except Exception as e:
            print(f"❌ 更新失败 {filename}: {str(e)}")
            failed_files.append(filename)

    # 输出总结
    print(f"\n{'='*50}")
    print(f"✅ 成功更新: {updated_count} 个文件")
    if failed_files:
        print(f"❌ 失败: {len(failed_files)} 个文件")
        for f in failed_files:
            print(f"   - {f}")
    print(f"{'='*50}\n")

if __name__ == '__main__':
    main()
