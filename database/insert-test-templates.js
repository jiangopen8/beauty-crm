/**
 * 插入测试方案模板数据
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function insertTestData() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const sql = `
            INSERT INTO solution_templates
            (template_code, template_name, category, org_id, scope, course_duration, treatment_frequency, expected_effects, status)
            VALUES
            ('TPL_HYDRATION_001', '深层补水方案', 'hydration', 1, 'org', '14天', '每周2-3次', '改善皮肤干燥，提升水润度', 'active'),
            ('TPL_WHITENING_001', '美白亮肤方案', 'whitening', 1, 'org', '28天', '每周2次', '淡化色斑，提亮肤色', 'active'),
            ('TPL_ANTI_AGING_001', '抗衰老护理方案', 'anti_aging', 1, 'org', '60天', '每周1-2次', '改善细纹，紧致肌肤', 'active')
        `;

        await pool.query(sql);
        console.log('✅ 测试数据插入成功！');
        console.log('已插入3条方案模板记录');
    } catch (error) {
        console.error('❌ 插入失败:', error.message);
    } finally {
        await pool.end();
    }
}

insertTestData();
