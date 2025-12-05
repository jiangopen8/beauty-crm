const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beautydb',
    multipleStatements: true
};

async function createTable() {
    let connection;

    try {
        console.log('====================================');
        console.log('  创建任务模板表');
        console.log('====================================\n');

        console.log('📝 正在连接数据库...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功\n');

        // 读取SQL文件
        const sqlFilePath = path.join(__dirname, 'task-templates-design.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log('📋 正在执行SQL脚本...');
        await connection.query(sql);
        console.log('✅ 任务模板表创建成功\n');

        // 查询表结构
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'task_templates'
            ORDER BY ORDINAL_POSITION
        `, [process.env.DB_NAME || 'beautydb']);

        console.log('====================================');
        console.log('  任务模板表结构');
        console.log('====================================\n');
        columns.forEach(col => {
            console.log(`  ${col.COLUMN_NAME.padEnd(25)} ${col.COLUMN_TYPE.padEnd(30)} ${col.COLUMN_COMMENT || ''}`);
        });

        // 查询插入的数据
        const [rows] = await connection.query('SELECT * FROM task_templates');
        console.log('\n====================================');
        console.log(`  已插入 ${rows.length} 个默认模板`);
        console.log('====================================\n');

        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.template_name}`);
            console.log(`   编码: ${row.template_code}`);
            console.log(`   分类: ${row.category}`);
            console.log(`   优先级: ${row.priority}`);
            console.log(`   预计时长: ${row.estimated_duration}分钟`);
            const steps = typeof row.steps === 'string' ? JSON.parse(row.steps) : row.steps;
            console.log(`   步骤数: ${steps.length}`);
            console.log('');
        });

        console.log('✅ 任务模板表创建完成！');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n👋 数据库连接已关闭');
        }
    }
}

// 运行脚本
createTable();
