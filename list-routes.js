/**
 * 列出所有已注册的Express路由
 */
const app = require('./api/app');

console.log('\n=== 已注册的路由 ===\n');

function printRoutes(routes, prefix = '') {
    routes.forEach(route => {
        if (route.route) {
            // 直接路由
            const methods = Object.keys(route.route.methods).join(', ').toUpperCase();
            console.log(`${methods.padEnd(10)} ${prefix}${route.route.path}`);
        } else if (route.name === 'router' && route.handle.stack) {
            // 路由中间件
            const path = route.regexp.toString()
                .replace('/^\\', '')
                .replace('\\/?(?=\\/|$)/i', '')
                .replace(/\\\//g, '/');
            const cleanPath = path.includes('(?:') ? path.split('(?:')[0] : path;
            printRoutes(route.handle.stack, cleanPath);
        }
    });
}

printRoutes(app._router.stack);

console.log('\n=== 检查特定路由 ===\n');

// 检查task-templates路由
const hasTaskTemplates = app._router.stack.some(r => {
    if (r.regexp) {
        return r.regexp.toString().includes('task-templates');
    }
    return false;
});

console.log('task-templates 路由存在:', hasTaskTemplates);

// 检查customer-profile-templates路由
const hasCustomerProfile = app._router.stack.some(r => {
    if (r.regexp) {
        return r.regexp.toString().includes('customer-profile-templates');
    }
    return false;
});

console.log('customer-profile-templates 路由存在:', hasCustomerProfile);

// 打印路由正则表达式
console.log('\n=== 路由正则表达式 ===\n');
app._router.stack.forEach((r, i) => {
    if (r.name === 'router' && r.regexp) {
        console.log(`${i}: ${r.regexp.toString()}`);
    }
});
