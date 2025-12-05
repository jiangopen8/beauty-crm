const db = require('./db.config');

async function checkTableStructure() {
    try {
        console.log('🔍 查询 solution_templates 表结构...\n');

        const columns = await db.query('DESCRIBE solution_templates');

        console.log('📋 表字段列表:\n');
        columns.forEach(col => {
            console.log(`  ${col.Field.padEnd(30)} ${col.Type.padEnd(20)} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });

        console.log('\n✅ 查询完成');
    } catch (error) {
        console.error('❌ 查询失败:', error);
    } finally {
        process.exit(0);
    }
}

checkTableStructure();
