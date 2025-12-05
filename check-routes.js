const app = require('./api/app');

console.log('Checking registered routes...\n');

app._router.stack.forEach((middleware) => {
    if (middleware.route) {
        // Routes registered directly on the app
        console.log(middleware.route.path, Object.keys(middleware.route.methods));
    } else if (middleware.name === 'router') {
        // Router middleware
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                const path = handler.route.path;
                const methods = Object.keys(handler.route.methods);
                console.log(`  Router: ${path}`, methods);
            }
        });
    }
});

console.log('\nChecking for task-templates routes specifically...');
const hasTaskTemplates = app._router.stack.some(middleware => {
    if (middleware.regexp) {
        const regexpStr = middleware.regexp.toString();
        return regexpStr.includes('task-templates');
    }
    return false;
});

console.log('Has task-templates routes:', hasTaskTemplates);
