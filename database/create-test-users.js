/**
 * 创建测试用户数据
 */

require('dotenv').config();
const db = require('../api/config/db');
const bcrypt = require('bcrypt');

async function createTestUsers() {
    try {
        console.log('🔄 开始创建测试用户...\n');

        // 加密默认密码
        const defaultPassword = await bcrypt.hash('123456', 10);

        // 测试用户数据
        const users = [
            {
                username: 'admin',
                password_hash: defaultPassword,
                real_name: '系统管理员',
                org_id: 1, // 假设org_id=1是总部
                phone: '13800138000',
                email: 'admin@beautycrm.com',
                gender: 'male',
                position: '系统管理员',
                status: 'active'
            },
            {
                username: 'manager_sh',
                password_hash: defaultPassword,
                real_name: '李美丽',
                org_id: 7, // 上海加盟商
                phone: '13900139000',
                email: 'limei@example.com',
                gender: 'female',
                position: '加盟商经理',
                status: 'active'
            },
            {
                username: 'consultant_wang',
                password_hash: defaultPassword,
                real_name: '王美容',
                org_id: 7,
                phone: '13800138001',
                email: 'wangmei@example.com',
                gender: 'female',
                position: '美容顾问',
                status: 'active'
            },
            {
                username: 'beautician_zhang',
                password_hash: defaultPassword,
                real_name: '张美师',
                org_id: 7,
                phone: '13800138002',
                email: 'zhangmei@example.com',
                gender: 'female',
                position: '美容师',
                status: 'active'
            },
            {
                username: 'consultant_liu',
                password_hash: defaultPassword,
                real_name: '刘悦',
                org_id: 7,
                phone: '13800138003',
                email: 'liuyue@example.com',
                gender: 'female',
                position: '高级美容顾问',
                status: 'active'
            },
            {
                username: 'beautician_chen',
                password_hash: defaultPassword,
                real_name: '陈静',
                org_id: 7,
                phone: '13800138004',
                email: 'chenjing@example.com',
                gender: 'female',
                position: '美容师',
                status: 'active'
            },
            {
                username: 'receptionist_zhao',
                password_hash: defaultPassword,
                real_name: '赵婷',
                org_id: 7,
                phone: '13800138005',
                email: 'zhaoting@example.com',
                gender: 'female',
                position: '前台接待',
                status: 'active'
            },
            {
                username: 'beautician_sun',
                password_hash: defaultPassword,
                real_name: '孙丽',
                org_id: 7,
                phone: '13800138006',
                email: 'sunli@example.com',
                gender: 'female',
                position: '资深美容师',
                status: 'active'
            },
            {
                username: 'assistant_zhou',
                password_hash: defaultPassword,
                real_name: '周芳',
                org_id: 7,
                phone: '13800138007',
                email: 'zhoufang@example.com',
                gender: 'female',
                position: '美容助理',
                status: 'inactive'
            },
            {
                username: 'consultant_wu',
                password_hash: defaultPassword,
                real_name: '吴雪',
                org_id: 7,
                phone: '13800138008',
                email: 'wuxue@example.com',
                gender: 'female',
                position: '美容顾问',
                status: 'active'
            }
        ];

        for (const user of users) {
            const sql = `
                INSERT INTO users (
                    username,
                    password_hash,
                    real_name,
                    org_id,
                    phone,
                    email,
                    gender,
                    position,
                    status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    real_name = VALUES(real_name),
                    phone = VALUES(phone),
                    email = VALUES(email)
            `;

            const params = [
                user.username,
                user.password_hash,
                user.real_name,
                user.org_id,
                user.phone,
                user.email,
                user.gender,
                user.position,
                user.status
            ];

            try {
                await db.query(sql, params);
                console.log(`✅ 用户创建成功: ${user.username} (${user.real_name})`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`⚠️  用户已存在: ${user.username}`);
                } else {
                    throw error;
                }
            }
        }

        console.log('\n✅ 所有测试用户创建完成！');
        console.log('\n📝 测试账号信息：');
        console.log('┌─────────────────┬──────────────┬────────────┐');
        console.log('│ 用户名          │ 密码         │ 角色       │');
        console.log('├─────────────────┼──────────────┼────────────┤');
        console.log('│ admin           │ 123456       │ 系统管理员 │');
        console.log('│ manager_sh      │ 123456       │ 加盟商经理 │');
        console.log('│ consultant_wang │ 123456       │ 美容顾问   │');
        console.log('│ beautician_zhang│ 123456       │ 美容师     │');
        console.log('└─────────────────┴──────────────┴────────────┘\n');

    } catch (error) {
        console.error('❌ 创建测试用户失败:', error);
    } finally {
        await db.closePool();
        process.exit(0);
    }
}

// 执行创建
createTestUsers();
