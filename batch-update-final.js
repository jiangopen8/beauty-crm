const fs = require('fs');

const files = [
    'franchisees.html',
    'users.html',
    'organizations.html',
    'roles.html',
    'settings.html',
    'customer-profile-templates.html',
    'task-templates.html',
    'templates.html'
];

console.log('开始批量修改剩余文件...\n');

let successCount = 0;
let failCount = 0;

files.forEach(file => {
    try {
        if (!fs.existsSync(file)) {
            console.log(`[SKIP] ${file} - 文件不存在`);
            failCount++;
            return;
        }

        let content = fs.readFileSync(file, 'utf8');

        // 使用正则表达式匹配并替换
        // 匹配从"系统管理"标题到结束</div>的整个区块
        const regex = /(<!--\s*系统管理\s*-->\s*<div class="space-y-2">\s*<h3[^>]*>系统管理<\/h3>)\s*(<a href="organizations\.html"[^>]*>[\s\S]*?<span>组织管理<\/span>[\s\S]*?<\/a>)\s*(<!--\s*模板管理[^]*?<\/div>\s*<a href="settings\.html"[^>]*>[\s\S]*?<span>系统设置<\/span>[\s\S]*?<\/a>)\s*(<\/div>)/;

        if (content.match(regex)) {
            // 替换：将组织管理移到系统设置后面
            content = content.replace(regex, (match, p1, p2, p3, p4) => {
                // p1 = 标题部分
                // p2 = 组织管理链接
                // p3 = 模板管理+系统设置部分
                // p4 = 结束</div>
                return `${p1}\n                    ${p3}\n                    ${p2}\n                ${p4}`;
            });

            fs.writeFileSync(file, content, 'utf8');
            console.log(`[OK] ${file} - 更新成功`);
            successCount++;
        } else {
            console.log(`[SKIP] ${file} - 未找到匹配模式`);
            failCount++;
        }
    } catch (error) {
        console.log(`[FAIL] ${file} - 错误: ${error.message}`);
        failCount++;
    }
});

console.log('\n==========================================================');
console.log(`批量修改完成! 成功: ${successCount}, 失败/跳过: ${failCount}`);
