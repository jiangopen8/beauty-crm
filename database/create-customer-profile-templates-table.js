/**
 * 创建客户资料模板表
 * 执行命令: node database/create-customer-profile-templates-table.js
 */

const db = require('./db.config');

async function createTable() {
    try {
        console.log('🔄 开始创建客户资料模板表...\n');

        // 1. 创建 customer_profile_templates 表
        console.log('📊 创建 customer_profile_templates 表...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS customer_profile_templates (
                id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
                template_code VARCHAR(50) NOT NULL COMMENT '模板编码',
                template_name VARCHAR(100) NOT NULL COMMENT '模板名称',
                description TEXT DEFAULT NULL COMMENT '模板描述',

                -- 所属范围
                org_id BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID（NULL表示全局模板）',
                scope ENUM('global', 'org', 'private') NOT NULL DEFAULT 'org' COMMENT '共享范围',

                -- 适用场景
                apply_scene ENUM('all', 'new_customer', 'vip_customer', 'online_register', 'other') NOT NULL DEFAULT 'all' COMMENT '适用场景',

                -- 字段配置（核心JSON字段）
                fields JSON NOT NULL COMMENT '字段定义（JSON数组）',

                -- 分组配置
                field_groups JSON DEFAULT NULL COMMENT '字段分组配置',

                -- 版本管理
                version VARCHAR(20) DEFAULT '1.0' COMMENT '模板版本号',
                is_default TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认模板',

                -- 使用统计
                usage_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '使用次数',

                -- 状态
                status ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'active' COMMENT '状态',

                -- 审计字段
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_by BIGINT UNSIGNED DEFAULT NULL,
                updated_by BIGINT UNSIGNED DEFAULT NULL,
                is_deleted TINYINT(1) NOT NULL DEFAULT 0,

                UNIQUE KEY uk_org_code (org_id, template_code),
                INDEX idx_org_id (org_id),
                INDEX idx_scope (scope),
                INDEX idx_status (status),
                INDEX idx_apply_scene (apply_scene)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户资料模板表'
        `);
        console.log('✅ customer_profile_templates 表创建成功\n');

        // 2. 修改 customers 表，添加关联字段
        console.log('📊 修改 customers 表，添加模板关联字段...');

        // 检查字段是否已存在
        const columns = await db.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'beautydb'
            AND TABLE_NAME = 'customers'
            AND COLUMN_NAME IN ('profile_template_id', 'profile_data')
        `);

        const existingColumns = columns.map(col => col.COLUMN_NAME);

        if (!existingColumns.includes('profile_template_id')) {
            await db.query(`
                ALTER TABLE customers
                ADD COLUMN profile_template_id BIGINT UNSIGNED DEFAULT NULL COMMENT '使用的资料模板ID'
                AFTER counselor_id
            `);
            console.log('✅ 添加字段 profile_template_id');
        } else {
            console.log('ℹ️  字段 profile_template_id 已存在');
        }

        if (!existingColumns.includes('profile_data')) {
            await db.query(`
                ALTER TABLE customers
                ADD COLUMN profile_data JSON DEFAULT NULL COMMENT '自定义字段数据'
                AFTER tags
            `);
            console.log('✅ 添加字段 profile_data\n');
        } else {
            console.log('ℹ️  字段 profile_data 已存在\n');
        }

        // 3. 插入默认模板数据
        console.log('📝 插入默认模板数据...');

        // 检查是否已有默认模板
        const existingTemplates = await db.query(`
            SELECT COUNT(*) as count FROM customer_profile_templates WHERE template_code = 'DEFAULT_BASIC'
        `);

        if (existingTemplates[0].count === 0) {
            await db.query(`
                INSERT INTO customer_profile_templates (
                    template_code,
                    template_name,
                    description,
                    org_id,
                    scope,
                    apply_scene,
                    fields,
                    field_groups,
                    is_default,
                    status
                ) VALUES (
                    'DEFAULT_BASIC',
                    '客户基础资料模板（标准版）',
                    '适用于大多数美业门店的客户信息采集',
                    NULL,
                    'global',
                    'all',
                    JSON_ARRAY(
                        JSON_OBJECT(
                            'field_key', 'skin_type',
                            'field_name', '肤质类型',
                            'field_type', 'select',
                            'required', true,
                            'options', JSON_ARRAY('干性', '油性', '混合性', '敏感性', '中性'),
                            'default_value', '',
                            'placeholder', '请选择肤质类型',
                            'display_order', 1,
                            'group', '皮肤信息'
                        ),
                        JSON_OBJECT(
                            'field_key', 'skin_problems',
                            'field_name', '主要皮肤问题',
                            'field_type', 'checkbox',
                            'required', false,
                            'options', JSON_ARRAY('痘痘', '斑点', '皱纹', '松弛', '毛孔粗大', '暗沉', '红血丝'),
                            'default_value', JSON_ARRAY(),
                            'display_order', 2,
                            'group', '皮肤信息'
                        ),
                        JSON_OBJECT(
                            'field_key', 'allergies',
                            'field_name', '过敏史',
                            'field_type', 'textarea',
                            'required', false,
                            'default_value', '',
                            'placeholder', '请详细描述过敏情况（药物、食物、化妆品等）',
                            'display_order', 3,
                            'group', '健康信息',
                            'validation', JSON_OBJECT('maxLength', 500)
                        ),
                        JSON_OBJECT(
                            'field_key', 'preferred_time',
                            'field_name', '偏好服务时间',
                            'field_type', 'checkbox',
                            'required', false,
                            'options', JSON_ARRAY('工作日上午', '工作日下午', '工作日晚上', '周末上午', '周末下午', '周末晚上'),
                            'default_value', JSON_ARRAY(),
                            'display_order', 4,
                            'group', '偏好设置'
                        ),
                        JSON_OBJECT(
                            'field_key', 'occupation',
                            'field_name', '职业',
                            'field_type', 'text',
                            'required', false,
                            'default_value', '',
                            'placeholder', '请填写职业',
                            'display_order', 5,
                            'group', '基础信息'
                        )
                    ),
                    JSON_ARRAY(
                        JSON_OBJECT('group_name', '基础信息', 'display_order', 1),
                        JSON_OBJECT('group_name', '皮肤信息', 'display_order', 2),
                        JSON_OBJECT('group_name', '健康信息', 'display_order', 3),
                        JSON_OBJECT('group_name', '偏好设置', 'display_order', 4)
                    ),
                    1,
                    'active'
                )
            `);
            console.log('✅ 默认模板"客户基础资料模板（标准版）"创建成功\n');
        } else {
            console.log('ℹ️  默认模板已存在，跳过插入\n');
        }

        console.log('====================================');
        console.log('✅ 客户资料模板表创建完成！');
        console.log('====================================\n');
        console.log('📌 下一步：');
        console.log('1. 创建 API 模型文件');
        console.log('2. 创建 API 路由文件');
        console.log('3. 创建前端管理页面');
        console.log('4. 更新侧边栏菜单\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error(error);
        process.exit(1);
    }
}

createTable();
