/**
 * 验证数据库表结构
 * 用法: node database/verify-tables.js
 */

const db = require('./db.config');

async function verifyTables() {
    console.log('====================================');
    console.log('  数据库表结构验证');
    console.log('====================================\n');

    try {
        const pool = db.getPool();

        // 1. 获取所有表
        const [tables] = await pool.query('SHOW TABLES');
        const tableList = tables.map(t => Object.values(t)[0]);

        console.log(`✅ 找到 ${tableList.length} 张表:\n`);

        // 2. 获取每张表的详细信息
        for (const tableName of tableList) {
            // 获取表注释
            const [tableInfo] = await pool.query(
                `SELECT TABLE_COMMENT
                 FROM INFORMATION_SCHEMA.TABLES
                 WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?`,
                [process.env.DB_NAME, tableName]
            );

            // 获取字段数量
            const [columns] = await pool.query(`DESCRIBE ${tableName}`);

            // 获取索引数量
            const [indexes] = await pool.query(`SHOW INDEX FROM ${tableName}`);
            const uniqueIndexes = [...new Set(indexes.map(idx => idx.Key_name))];

            const comment = tableInfo[0]?.TABLE_COMMENT || '无注释';

            console.log(`📊 ${tableName}`);
            console.log(`   说明: ${comment}`);
            console.log(`   字段: ${columns.length} 个`);
            console.log(`   索引: ${uniqueIndexes.length} 个`);
            console.log('');
        }

        // 3. 验证关键表
        const requiredTables = [
            'organizations',
            'users',
            'roles',
            'permissions',
            'user_roles',
            'role_permissions',
            'customers',
            'customer_diagnoses',
            'customer_cases',
            'services',
            'orders',
            'order_items',
            'tasks',
            'solution_templates',
            'operation_logs'
        ];

        const missingTables = requiredTables.filter(table => !tableList.includes(table));

        if (missingTables.length === 0) {
            console.log('✅ 所有必需表都已创建！');
        } else {
            console.log('❌ 缺少以下表:');
            missingTables.forEach(table => console.log(`   - ${table}`));
        }

        // 4. 检查 organizations 表结构（加盟商管理核心表）
        console.log('\n====================================');
        console.log('  organizations 表结构详情');
        console.log('====================================\n');

        const [orgColumns] = await pool.query(`DESCRIBE organizations`);
        orgColumns.forEach(col => {
            console.log(`  ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });

        console.log('\n✅ 数据库验证完成！\n');

        await db.closePool();
        process.exit(0);

    } catch (error) {
        console.error('❌ 验证失败:', error.message);
        await db.closePool();
        process.exit(1);
    }
}

verifyTables();
