#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修改任务模板页面
"""

import re

# 读取文件
with open('task-templates.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 替换分类按钮
old_categories = r'''<button onclick="filterCategory\('hydration'\)".*?补水保湿.*?</button>
\s*<button onclick="filterCategory\('whitening'\)".*?美白亮肤.*?</button>
\s*<button onclick="filterCategory\('anti_aging'\)".*?抗衰老.*?</button>
\s*<button onclick="filterCategory\('repair'\)".*?修复护理.*?</button>
\s*<button onclick="filterCategory\('hair_care'\)".*?头发护理.*?</button>'''

new_categories = '''<button onclick="filterCategory('customer_follow_up')" id="filter-customer_follow_up" class="category-filter-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100">
                        客户跟进
                    </button>
                    <button onclick="filterCategory('service_process')" id="filter-service_process" class="category-filter-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100">
                        服务流程
                    </button>
                    <button onclick="filterCategory('quality_check')" id="filter-quality_check" class="category-filter-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100">
                        质量检查
                    </button>
                    <button onclick="filterCategory('inventory')" id="filter-inventory" class="category-filter-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100">
                        库存管理
                    </button>
                    <button onclick="filterCategory('training')" id="filter-training" class="category-filter-btn px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap text-gray-600 hover:bg-gray-100">
                        培训
                    </button>'''

content = re.sub(old_categories, new_categories, content, flags=re.DOTALL)

# 2. 替换分类标签的CSS类名和显示逻辑
# 将getCategoryBadge函数中的分类替换
category_map = {
    'hydration': 'customer_follow_up',
    'whitening': 'service_process',
    'anti_aging': 'quality_check',
    'repair': 'inventory',
    'hair_care': 'training',
}

for old, new in category_map.items():
    content = content.replace(f"'{old}'", f"'{new}'")

# 3. 替换分类显示名称
display_names = {
    '补水保湿': '客户跟进',
    '美白亮肤': '服务流程',
    '抗衰老': '质量检查',
    '修复护理': '库存管理',
    '头发护理': '培训',
}

for old, new in display_names.items():
    content = content.replace(old, new)

# 4. 将"其他任务模板"替换为"其他"
content = content.replace('其他任务模板', '其他')

# 保存文件
with open('task-templates.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("[OK] 任务模板页面修改完成!")
print("已替换:")
print("- 分类筛选按钮")
print("- 分类显示名称")
print("- 分类相关逻辑")
