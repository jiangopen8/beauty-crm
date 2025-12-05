/**
 * 服务器启动文件
 * 启动Express服务器
 */

const app = require('./app');
const db = require('./config/db');

// 从环境变量获取端口，默认5004
const PORT = process.env.APP_PORT || 5004;
const ENV = process.env.APP_ENV || 'development';

/**
 * 启动服务器
 */
async function startServer() {
    try {
        // 测试数据库连接
        console.log('🔌 正在测试数据库连接...');
        const isConnected = await db.testConnection();

        if (!isConnected) {
            console.error('❌ 数据库连接失败，服务器启动中止');
            process.exit(1);
        }

        // 启动HTTP服务器
        app.listen(PORT, () => {
            console.log('\n====================================');
            console.log('  美业CRM系统后端服务器');
            console.log('====================================');
            console.log(`✅ 服务器运行中...`);
            console.log(`   环境: ${ENV}`);
            console.log(`   端口: ${PORT}`);
            console.log(`   地址: http://localhost:${PORT}`);
            console.log(`   健康检查: http://localhost:${PORT}/health`);
            console.log(`   API文档: http://localhost:${PORT}/api`);
            console.log('====================================\n');
            console.log('💡 提示: 按 Ctrl+C 停止服务器\n');
        });

    } catch (error) {
        console.error('❌ 服务器启动失败:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGTERM', async () => {
    console.log('\n📋 收到SIGTERM信号，正在关闭服务器...');
    await db.closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n📋 收到SIGINT信号，正在关闭服务器...');
    await db.closePool();
    process.exit(0);
});

// 捕获未处理的Promise拒绝
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    console.error('Promise:', promise);
});

// 捕获未捕获的异常
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    process.exit(1);
});

// 启动服务器
startServer();
