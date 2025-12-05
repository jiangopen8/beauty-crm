const fs = require('fs');

const pages = [
    'index.html',
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
    'task-templates.html'
];

console.log('检查各页面组织名称显示功能...\n');

const needsUpdate = [];
const hasFeature = [];

pages.forEach(page => {
    if (!fs.existsSync(page)) {
        console.log(`[不存在] ${page}`);
        return;
    }

    const content = fs.readFileSync(page, 'utf8');

    const hasHeaderOrgName = content.includes('id="header-org-name"');
    const hasUpdateFunction = content.includes('updateHeaderOrgName');

    if (hasHeaderOrgName && hasUpdateFunction) {
        console.log(`[✓ 已实现] ${page}`);
        hasFeature.push(page);
    } else if (hasHeaderOrgName && !hasUpdateFunction) {
        console.log(`[△ 部分实现] ${page} - 有HTML元素但缺少JS函数`);
        needsUpdate.push(page);
    } else {
        console.log(`[✗ 未实现] ${page}`);
        needsUpdate.push(page);
    }
});

console.log('\n========================================');
console.log(`已实现: ${hasFeature.length}个页面`);
console.log(`需要添加: ${needsUpdate.length}个页面`);
console.log('\n需要添加的页面:');
needsUpdate.forEach(page => console.log(`  - ${page}`));
