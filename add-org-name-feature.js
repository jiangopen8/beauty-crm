const fs = require('fs');

const pagesToUpdate = [
    'customers.html',
    'orders.html',
    'tasks.html',
    'cases.html',
    'templates.html',
    'organizations.html',
    'customer-profile-templates.html',
    'task-templates.html'
];

// 要添加的HTML片段（在标题后）
const htmlToAdd = '<span id="header-org-name" class="hidden md:inline text-purple-600"></span>';

// 要添加的JavaScript函数
const jsFunction = `
        // 更新顶部标题栏显示当前组织名称
        function updateHeaderOrgName() {
            const headerOrgNameEl = document.getElementById('header-org-name');
            const currentOrgName = localStorage.getItem('currentOrgName');
            if (headerOrgNameEl && currentOrgName) {
                headerOrgNameEl.textContent = ' - ' + currentOrgName;
            }
        }

        // 页面加载时更新标题
        updateHeaderOrgName();
`;

console.log('开始批量添加组织名称显示功能...\n');

let successCount = 0;
let failCount = 0;

pagesToUpdate.forEach(page => {
    try {
        if (!fs.existsSync(page)) {
            console.log(`[SKIP] ${page} - 文件不存在`);
            failCount++;
            return;
        }

        let content = fs.readFileSync(page, 'utf8');
        let modified = false;

        // 1. 添加HTML元素（在"美业洞察CRM"标题后）
        if (!content.includes('id="header-org-name"')) {
            // 匹配标题行
            const titlePattern = /(<h1[^>]*>\s*美业洞察CRM)\s*(<\/h1>)/;
            if (content.match(titlePattern)) {
                content = content.replace(titlePattern, `$1\n                                ${htmlToAdd}\n                            $2`);
                modified = true;
                console.log(`  ✓ 添加HTML元素到 ${page}`);
            } else {
                console.log(`  ✗ 未找到标题位置 ${page}`);
            }
        }

        // 2. 添加JavaScript函数（在lucide.createIcons()之后）
        if (!content.includes('updateHeaderOrgName')) {
            // 查找lucide.createIcons()的位置
            const lucidePattern = /(lucide\.createIcons\(\);)/;
            if (content.match(lucidePattern)) {
                content = content.replace(lucidePattern, `$1\n${jsFunction}`);
                modified = true;
                console.log(`  ✓ 添加JS函数到 ${page}`);
            } else {
                // 如果没有lucide.createIcons()，尝试在<script>标签后添加
                const scriptPattern = /(<script>\s*)/;
                if (content.match(scriptPattern)) {
                    content = content.replace(scriptPattern, `$1${jsFunction}\n        `);
                    modified = true;
                    console.log(`  ✓ 添加JS函数到 ${page} (在script标签后)`);
                } else {
                    console.log(`  ✗ 未找到JS插入位置 ${page}`);
                }
            }
        }

        if (modified) {
            fs.writeFileSync(page, content, 'utf8');
            console.log(`[OK] ${page} - 更新成功\n`);
            successCount++;
        } else {
            console.log(`[SKIP] ${page} - 已存在相关代码\n`);
            failCount++;
        }

    } catch (error) {
        console.log(`[FAIL] ${page} - 错误: ${error.message}\n`);
        failCount++;
    }
});

console.log('========================================');
console.log(`批量添加完成! 成功: ${successCount}, 失败/跳过: ${failCount}`);
