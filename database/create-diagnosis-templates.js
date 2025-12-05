const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function createDiagnosisTemplatesTable() {
    let connection;

    try {
        // 创建数据库连接
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            charset: 'utf8mb4'
        });

        console.log('✅ 数据库连接成功');

        // 读取SQL文件
        const sqlFile = path.join(__dirname, 'create-diagnosis-templates-table.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // 分割SQL语句（按分号和换行符）
        const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 准备执行 ${statements.length} 条SQL语句...\n`);

        // 逐条执行SQL语句
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];

            // 跳过注释
            if (statement.startsWith('--') || statement.length === 0) {
                continue;
            }

            try {
                console.log(`执行第 ${i + 1} 条语句...`);
                const [result] = await connection.execute(statement);

                if (statement.trim().toUpperCase().startsWith('SELECT')) {
                    console.log('查询结果:', result);
                } else {
                    console.log(`✅ 执行成功`);
                }
            } catch (err) {
                // 如果是"表已存在"错误，不视为失败
                if (err.code === 'ER_TABLE_EXISTS_ERROR') {
                    console.log('⚠️  表已存在，跳过创建');
                } else {
                    console.error(`❌ 执行失败:`, err.message);
                    throw err;
                }
            }
        }

        console.log('\n🎉 诊断模板表创建完成！');

        // 验证表是否创建成功
        const [tables] = await connection.execute(
            "SHOW TABLES LIKE 'diagnosis_templates'"
        );

        if (tables.length > 0) {
            console.log('✅ 表验证成功: diagnosis_templates');

            // 查询表结构
            const [columns] = await connection.execute(
                "DESCRIBE diagnosis_templates"
            );
            console.log('\n📋 表结构:');
            console.table(columns);

            // 查询已插入的数据
            const [rows] = await connection.execute(
                "SELECT id, template_code, template_name, scope, apply_scene, version FROM diagnosis_templates"
            );
            console.log('\n📊 默认模板数据:');
            console.table(rows);
        } else {
            console.log('❌ 表验证失败');
        }

    } catch (error) {
        console.error('❌ 创建失败:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n👋 数据库连接已关闭');
        }
    }
}

// 执行创建
createDiagnosisTemplatesTable();
