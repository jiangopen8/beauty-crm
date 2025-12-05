/**
 * 测试数据库连接脚本
 * 用法: node database/test-connection.js
 */

const db = require('./db.config');

async function main() {
    console.log('====================================');
    console.log('  美业CRM系统 - 数据库连接测试');
    console.log('====================================\n');

    // 测试连接
    const isConnected = await db.testConnection();

    if (isConnected) {
        console.log('\n✅ 数据库连接测试通过！可以开始创建表了。');
        process.exit(0);
    } else {
        console.log('\n❌ 数据库连接测试失败！请检查配置。');
        process.exit(1);
    }
}

main().catch(error => {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
});
