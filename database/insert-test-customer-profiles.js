const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beautydb'
};

const customerId = 1;  // 使用真实的数字型客户ID

// 模拟数据
const profilesData = [
    {
        template_id: 7,  // 客户基础资料模板（标准版）
        profile_data: {
            skin_type: '干性',
            skin_problems: ['痘痘', '斑点', '皱纹'],
            allergies: '对含酒精产品过敏，曾经因为使用劣质面膜引起皮肤过敏',
            medical_history: '无重大病史，偶有过敏性鼻炎',
            preferred_time: ['周末上午', '周末下午'],
            occupation: 'IT工程师'
        },
        remark: '新客户，首次到店，关注肌肤护理和衰老预防'
    },
    {
        template_id: 8,  // 客户资料模板（专业版）
        profile_data: {
            skin_type: '干性',
            skin_problems: ['皱纹', '松弛', '暗沉'],
            skin_ph: 5.8,
            moisture_level: 35,
            oil_level: 15,
            lifestyle: ['经常熬夜', '长期对电脑'],
            current_skincare: '雅诗兰黛ANR眼霜、兰蔻小黑瓶精华、资生堂红妍乳液'
        },
        remark: 'VIP客户，详细皮肤分析数据'
    },
    {
        template_id: 13,  // 线上注册快速模板
        profile_data: {
            skin_type: '干性',
            skin_concerns: ['美白', '补水', '抗衰老'],
            age_range: '36-45岁',
            budget_range: '2000-5000元'
        },
        remark: '线上注册快速收集'
    }
];

async function insertProfiles() {
    let connection;

    try {
        console.log('====================================');
        console.log('  插入客户资料测试数据');
        console.log('====================================\n');

        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功\n');

        console.log(`📝 正在为客户 ${customerId} 插入测试数据...\n`);

        for (const profile of profilesData) {
            try {
                // 检查是否已存在
                const [existing] = await connection.execute(
                    'SELECT id FROM customer_profiles WHERE customer_id = ? AND template_id = ? AND is_deleted = 0',
                    [customerId, profile.template_id]
                );

                if (existing.length > 0) {
                    // 更新现有数据
                    await connection.execute(
                        'UPDATE customer_profiles SET profile_data = ?, remark = ? WHERE customer_id = ? AND template_id = ? AND is_deleted = 0',
                        [JSON.stringify(profile.profile_data), profile.remark, customerId, profile.template_id]
                    );
                    console.log(`  ✓ 已更新模板 ${profile.template_id} 的数据`);
                } else {
                    // 插入新数据
                    await connection.execute(
                        `INSERT INTO customer_profiles (
                            customer_id,
                            template_id,
                            org_id,
                            profile_data,
                            template_version,
                            remark,
                            created_by,
                            status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            customerId,
                            profile.template_id,
                            1,
                            JSON.stringify(profile.profile_data),
                            '1.0',
                            profile.remark,
                            1,
                            'active'
                        ]
                    );
                    console.log(`  ✓ 已插入模板 ${profile.template_id} 的数据`);
                }
            } catch (error) {
                console.error(`  ✗ 模板 ${profile.template_id} 处理失败: ${error.message}`);
            }
        }

        console.log('\n✅ 测试数据插入完成！\n');

        // 查询验证
        const [results] = await connection.execute(
            `SELECT id, template_id, created_at, updated_at, remark
             FROM customer_profiles
             WHERE customer_id = ? AND is_deleted = 0
             ORDER BY template_id`,
            [customerId]
        );

        console.log('====================================');
        console.log(`  已为客户插入 ${results.length} 条资料`);
        console.log('====================================\n');

        results.forEach((row, index) => {
            console.log(`${index + 1}. 模板ID: ${row.template_id}`);
            console.log(`   资料ID: ${row.id}`);
            console.log(`   创建时间: ${row.created_at}`);
            console.log(`   备注: ${row.remark}`);
            console.log('');
        });

        console.log('💡 现在可以访问以下URL查看数据:');
        console.log(`http://8.210.246.101:5002/customer-detail.html?id=1\n`);

    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 数据库连接已关闭');
        }
    }
}

insertProfiles();
