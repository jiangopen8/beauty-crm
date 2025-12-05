/**
 * 创建测试角色数据
 */
const db = require('./db.config');

async function createTestRoles() {
    console.log('🔄 开始创建测试角色...\n');

    try {
        // 测试数据库连接
        const testQuery = await db.query('SELECT 1 + 1 AS result');
        console.log('✅ 数据库连接成功\n');

        // 检查 roles 表是否存在
        const tableCheck = await db.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = DATABASE()
            AND table_name = 'roles'
        `);

        if (tableCheck[0].count === 0) {
            console.log('❌ roles 表不存在，请先运行 init-db.js 创建表结构');
            process.exit(1);
        }

        console.log('✅ roles 表存在\n');

        // 检查是否已有角色数据
        const existingRoles = await db.query('SELECT COUNT(*) as count FROM roles WHERE is_deleted = 0');
        if (existingRoles[0].count > 0) {
            console.log(`⚠️  已存在 ${existingRoles[0].count} 个角色，是否清空并重新创建？`);
            console.log('如需继续，请先手动执行: DELETE FROM roles;\n');

            // 直接添加新角色，不删除旧的
            console.log('📝 将添加新的测试角色（不删除现有角色）...\n');
        }

        // 定义测试角色
        const testRoles = [
            {
                role_code: 'admin',
                role_name: '系统管理员',
                description: '拥有系统所有权限，可管理组织、用户、角色等',
                status: 'active',
                data_scope: 'all'
            },
            {
                role_code: 'store_manager',
                role_name: '门店经理',
                description: '管理门店日常运营，包括客户、订单、员工管理',
                status: 'active',
                data_scope: 'org'
            },
            {
                role_code: 'beautician',
                role_name: '美容顾问',
                description: '负责客户接待、咨询和服务',
                status: 'active',
                data_scope: 'self'
            },
            {
                role_code: 'sales',
                role_name: '销售专员',
                description: '负责客户开发和订单跟进',
                status: 'active',
                data_scope: 'self'
            },
            {
                role_code: 'customer_service',
                role_name: '客服人员',
                description: '处理客户咨询和售后服务',
                status: 'active',
                data_scope: 'org'
            },
            {
                role_code: 'data_analyst',
                role_name: '数据分析师',
                description: '负责数据统计和分析报表',
                status: 'active',
                data_scope: 'all'
            }
        ];

        console.log('📝 准备插入角色数据...\n');

        // 插入角色
        let successCount = 0;
        let skipCount = 0;

        for (const role of testRoles) {
            try {
                // 检查角色代码是否已存在
                const existing = await db.query(
                    'SELECT id FROM roles WHERE role_code = ? AND is_deleted = 0',
                    [role.role_code]
                );

                if (existing.length > 0) {
                    console.log(`⏭️  角色 "${role.role_name}" (${role.role_code}) 已存在，跳过`);
                    skipCount++;
                    continue;
                }

                const result = await db.query(`
                    INSERT INTO roles (
                        role_code, role_name, description, status,
                        data_scope, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())
                `, [
                    role.role_code,
                    role.role_name,
                    role.description,
                    role.status,
                    role.data_scope
                ]);

                console.log(`✅ 创建角色: ${role.role_name} (${role.role_code}) - ID: ${result.insertId}`);
                successCount++;
            } catch (error) {
                console.error(`❌ 创建角色 "${role.role_name}" 失败:`, error.message);
            }
        }

        console.log('\n═══════════════════════════════════════');
        console.log('📊 角色创建完成统计:');
        console.log(`   ✅ 成功创建: ${successCount} 个`);
        console.log(`   ⏭️  跳过已存在: ${skipCount} 个`);
        console.log('═══════════════════════════════════════\n');

        // 查询并显示所有角色
        const allRoles = await db.query(`
            SELECT id, role_code, role_name, description, status, data_scope
            FROM roles
            WHERE is_deleted = 0
            ORDER BY id ASC
        `);

        console.log('📋 当前所有角色列表:\n');
        console.log('ID  | 角色代码          | 角色名称      | 状态   | 数据范围');
        console.log('----+------------------+--------------+--------+---------');
        allRoles.forEach(role => {
            const id = String(role.id).padEnd(3);
            const code = String(role.role_code).padEnd(16);
            const name = String(role.role_name).padEnd(12);
            const status = role.status === 'active' ? '活跃' : '停用';
            const scope = role.data_scope === 'all' ? '全部' : role.data_scope === 'org' ? '本组织' : '仅自己';
            console.log(`${id} | ${code} | ${name} | ${status.padEnd(6)} | ${scope}`);
        });

        console.log('\n✅ 测试角色创建完成！');
        console.log('\n💡 提示: 现在可以在用户管理页面为用户分配角色了');
        console.log('   访问: http://localhost:3000/users.html\n');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ 创建失败:', error);
        process.exit(1);
    }
}

// 运行脚本
createTestRoles();
