/**
 * 创建订单表
 */
const fs = require('fs');
const path = require('path');
const { getPool } = require('./db.config');

async function createOrdersTable() {
    const pool = getPool();

    try {
        console.log('📝 开始创建订单表...\n');

        // 读取SQL文件
        const sqlFile = path.join(__dirname, 'orders-design.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // 分割SQL语句(按分号分割,但要注意存储过程等特殊情况)
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        // 逐个执行SQL语句
        for (const statement of statements) {
            if (statement.trim()) {
                await pool.query(statement);
            }
        }

        console.log('✅ 订单表创建成功!\n');

        // 验证表是否创建成功
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM orders');
        console.log(`📊 当前订单数量: ${rows[0].count}\n`);

        // 显示表结构
        const [columns] = await pool.query('DESCRIBE orders');
        console.log('📋 订单表结构:');
        console.table(columns);

    } catch (error) {
        console.error('❌ 创建订单表失败:', error.message);
        console.error(error);
        throw error;
    } finally {
        await pool.end();
    }
}

// 执行
createOrdersTable()
    .then(() => {
        console.log('\n✅ 所有操作完成!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ 操作失败:', error);
        process.exit(1);
    });
