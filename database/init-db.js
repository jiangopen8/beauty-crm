/**
 * 美业客户洞察CRM系统 - 数据库初始化脚本
 * 功能: 读取 init.sql 文件并执行，创建所有表
 * 用法: node database/init-db.js
 */

const fs = require('fs').promises;
const path = require('path');
const db = require('./db.config');

async function initDatabase() {
    console.log('====================================');
    console.log('  美业CRM系统 - 数据库初始化');
    console.log('====================================\n');

    try {
        // 1. 测试连接
        console.log('📋 步骤 1/3: 测试数据库连接...');
        const isConnected = await db.testConnection();
        if (!isConnected) {
            throw new Error('数据库连接失败');
        }

        // 2. 读取SQL文件
        console.log('\n📋 步骤 2/3: 读取SQL初始化文件...');
        const sqlFilePath = path.join(__dirname, 'init.sql');
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        console.log('✅ SQL文件读取成功');

        // 3. 执行SQL语句
        console.log('\n📋 步骤 3/3: 执行SQL语句创建表...');

        // 分割SQL语句（按分号分割，但要排除注释和空行）
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => {
                // 过滤掉空语句和纯注释
                return stmt.length > 0 &&
                       !stmt.startsWith('--') &&
                       !stmt.startsWith('/*') &&
                       stmt !== '';
            });

        console.log(`   发现 ${statements.length} 条SQL语句\n`);

        const pool = db.getPool();
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];

            // 跳过USE语句（因为连接配置已指定数据库）
            if (stmt.toUpperCase().startsWith('USE ')) {
                console.log(`   [${i + 1}/${statements.length}] ⏭️  跳过: USE语句`);
                skipCount++;
                continue;
            }

            // 跳过CREATE DATABASE语句（使用配置的数据库）
            if (stmt.toUpperCase().includes('CREATE DATABASE')) {
                console.log(`   [${i + 1}/${statements.length}] ⏭️  跳过: CREATE DATABASE语句`);
                skipCount++;
                continue;
            }

            try {
                // 提取表名用于显示
                let tableName = 'unknown';
                const createTableMatch = stmt.match(/CREATE TABLE.*?`(\w+)`/i);
                const dropTableMatch = stmt.match(/DROP TABLE.*?`(\w+)`/i);
                const insertMatch = stmt.match(/INSERT INTO.*?`(\w+)`/i);

                if (createTableMatch) {
                    tableName = createTableMatch[1];
                    console.log(`   [${i + 1}/${statements.length}] 📝 创建表: ${tableName}`);
                } else if (dropTableMatch) {
                    tableName = dropTableMatch[1];
                    console.log(`   [${i + 1}/${statements.length}] 🗑️  删除表: ${tableName}`);
                } else if (insertMatch) {
                    tableName = insertMatch[1];
                    console.log(`   [${i + 1}/${statements.length}] 📥 插入数据: ${tableName}`);
                } else {
                    console.log(`   [${i + 1}/${statements.length}] ⚙️  执行语句...`);
                }

                await pool.query(stmt);
                successCount++;

            } catch (error) {
                errorCount++;
                console.error(`   ❌ 执行失败: ${error.message}`);
                // 继续执行其他语句
            }
        }

        // 4. 验证表创建
        console.log('\n📋 验证表创建结果...\n');
        const [tables] = await pool.query('SHOW TABLES');
        const tableList = tables.map(t => Object.values(t)[0]);

        console.log('✅ 当前数据库中的表:');
        tableList.forEach((table, index) => {
            console.log(`   ${index + 1}. ${table}`);
        });

        // 5. 显示统计信息
        console.log('\n====================================');
        console.log('  初始化完成统计');
        console.log('====================================');
        console.log(`✅ 成功执行: ${successCount} 条`);
        console.log(`⏭️  跳过语句: ${skipCount} 条`);
        console.log(`❌ 执行失败: ${errorCount} 条`);
        console.log(`📊 创建表数: ${tableList.length} 张`);
        console.log('====================================\n');

        if (tableList.length >= 15) {
            console.log('🎉 数据库初始化成功！所有表已创建完成。\n');
        } else {
            console.log('⚠️  警告: 表数量少于预期（15张），请检查是否有错误。\n');
        }

        process.exit(0);

    } catch (error) {
        console.error('\n❌ 初始化失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        await db.closePool();
    }
}

// 执行初始化
initDatabase();
