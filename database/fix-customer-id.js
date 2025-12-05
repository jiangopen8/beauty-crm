/**
 * 修复 customer_cases 表的 customer_id 字段
 * 将 NOT NULL 改为允许 NULL
 */

require('dotenv').config();
const db = require('./db.config');

async function fixCustomerIdField() {
    console.log('🔧 开始修复 customer_cases 表...\n');

    try {
        // 1. 查看当前表结构
        console.log('1️⃣ 当前表结构:');
        const columns = await db.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'beautydb'
            AND TABLE_NAME = 'customer_cases'
            AND COLUMN_NAME = 'customer_id'
        `);
        console.table(columns);

        // 2. 修改字段为允许 NULL
        console.log('\n2️⃣ 修改 customer_id 字段为允许 NULL...');
        await db.query(`
            ALTER TABLE customer_cases
            MODIFY COLUMN customer_id BIGINT UNSIGNED DEFAULT NULL COMMENT '客户ID（可选）'
        `);
        console.log('✅ 字段修改成功！\n');

        // 3. 验证修改结果
        console.log('3️⃣ 修改后的表结构:');
        const newColumns = await db.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'beautydb'
            AND TABLE_NAME = 'customer_cases'
            AND COLUMN_NAME = 'customer_id'
        `);
        console.table(newColumns);

        // 4. 测试插入（可选）
        console.log('\n4️⃣ 测试插入没有 customer_id 的记录...');
        const result = await db.query(`
            INSERT INTO customer_cases (
                org_id,
                case_title,
                case_type,
                created_by
            ) VALUES (?, ?, ?, ?)
        `, [1, '测试案例-无客户ID', 'skin_care', 1]);

        const insertId = result.insertId;
        console.log(`✅ 测试记录插入成功！ID: ${insertId}\n`);

        // 5. 清理测试数据
        console.log('5️⃣ 清理测试数据...');
        await db.query(`DELETE FROM customer_cases WHERE id = ?`, [insertId]);
        console.log('✅ 测试数据已清理\n');

        console.log('='  .repeat(50));
        console.log('🎉 修复完成！');
        console.log('='  .repeat(50));
        console.log('✅ customer_id 字段现在可以为 NULL');
        console.log('✅ 可以创建不关联客户的独立案例');
        console.log('='  .repeat(50));

    } catch (error) {
        console.error('❌ 修复失败:', error.message);
        console.error('详细错误:', error);
        process.exit(1);
    } finally {
        await db.closePool();
    }
}

// 执行修复
fixCustomerIdField();
