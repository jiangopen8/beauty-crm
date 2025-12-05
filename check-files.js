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

console.log('检查哪些文件需要修改...\n');

files.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        // 检查是否组织管理在模板管理之前（需要修改）
        const orgIndex = content.indexOf('<span>组织管理</span>');
        const templateIndex = content.indexOf('<!-- 模板管理（一级菜单） -->');

        if (orgIndex > 0 && templateIndex > 0 && orgIndex < templateIndex) {
            console.log(`[需要修改] ${file}`);
        } else {
            console.log(`[无需修改] ${file}`);
        }
    } else {
        console.log(`[文件不存在] ${file}`);
    }
});
