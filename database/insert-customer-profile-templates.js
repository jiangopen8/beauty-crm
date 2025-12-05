const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库连接配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'beautydb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// 测试数据
const templates = [
    {
        template_code: 'DEFAULT_BASIC',
        template_name: '客户基础资料模板（标准版）',
        description: '适用于大多数美业门店的客户信息采集',
        org_id: null,
        scope: 'global',
        apply_scene: 'all',
        fields: [
            {
                field_key: 'skin_type',
                field_name: '肤质类型',
                field_type: 'select',
                required: true,
                options: ['干性', '油性', '混合性', '敏感性', '中性'],
                default_value: '',
                placeholder: '请选择肤质类型',
                display_order: 1,
                group: '皮肤信息'
            },
            {
                field_key: 'skin_problems',
                field_name: '主要皮肤问题',
                field_type: 'checkbox',
                required: false,
                options: ['痘痘', '斑点', '皱纹', '松弛', '毛孔粗大', '暗沉', '红血丝'],
                default_value: [],
                display_order: 2,
                group: '皮肤信息'
            },
            {
                field_key: 'allergies',
                field_name: '过敏史',
                field_type: 'textarea',
                required: false,
                default_value: '',
                placeholder: '请详细描述过敏情况（药物、食物、化妆品等）',
                display_order: 3,
                group: '健康信息',
                validation: { maxLength: 500 }
            },
            {
                field_key: 'medical_history',
                field_name: '既往病史',
                field_type: 'textarea',
                required: false,
                default_value: '',
                placeholder: '请填写重要病史（如高血压、糖尿病等）',
                display_order: 4,
                group: '健康信息',
                validation: { maxLength: 500 }
            },
            {
                field_key: 'preferred_time',
                field_name: '偏好服务时间',
                field_type: 'checkbox',
                required: false,
                options: ['工作日上午', '工作日下午', '工作日晚上', '周末上午', '周末下午', '周末晚上'],
                default_value: [],
                display_order: 5,
                group: '偏好设置'
            },
            {
                field_key: 'occupation',
                field_name: '职业',
                field_type: 'text',
                required: false,
                default_value: '',
                placeholder: '请填写职业',
                display_order: 6,
                group: '基础信息'
            }
        ],
        field_groups: [
            { group_name: '基础信息', display_order: 1 },
            { group_name: '皮肤信息', display_order: 2 },
            { group_name: '健康信息', display_order: 3 },
            { group_name: '偏好设置', display_order: 4 }
        ],
        is_default: 1,
        status: 'active'
    },
    {
        template_code: 'PREMIUM_PROFESSIONAL',
        template_name: '客户资料模板（专业版）',
        description: '适用于高端美业门店，包含更详细的皮肤分析字段',
        org_id: null,
        scope: 'global',
        apply_scene: 'vip_customer',
        fields: [
            {
                field_key: 'skin_type',
                field_name: '肤质类型',
                field_type: 'select',
                required: true,
                options: ['干性', '油性', '混合性', '敏感性', '中性'],
                display_order: 1,
                group: '皮肤诊断'
            },
            {
                field_key: 'skin_problems',
                field_name: '主要皮肤问题',
                field_type: 'checkbox',
                required: true,
                options: ['痘痘', '斑点', '皱纹', '松弛', '毛孔粗大', '暗沉', '红血丝', '黑眼圈', '眼袋'],
                default_value: [],
                display_order: 2,
                group: '皮肤诊断'
            },
            {
                field_key: 'skin_ph',
                field_name: '皮肤pH值',
                field_type: 'number',
                required: false,
                placeholder: '4.5-6.5',
                display_order: 3,
                group: '皮肤诊断',
                validation: { min: 0, max: 14, step: 0.1 }
            },
            {
                field_key: 'moisture_level',
                field_name: '皮肤含水量（%）',
                field_type: 'number',
                required: false,
                placeholder: '0-100',
                display_order: 4,
                group: '皮肤诊断',
                validation: { min: 0, max: 100 }
            },
            {
                field_key: 'oil_level',
                field_name: '皮肤含油量（%）',
                field_type: 'number',
                required: false,
                placeholder: '0-100',
                display_order: 5,
                group: '皮肤诊断',
                validation: { min: 0, max: 100 }
            },
            {
                field_key: 'lifestyle',
                field_name: '生活习惯',
                field_type: 'checkbox',
                required: false,
                options: ['经常熬夜', '长期对电脑', '户外工作', '经常化妆', '定期运动', '饮食规律'],
                default_value: [],
                display_order: 6,
                group: '生活方式'
            },
            {
                field_key: 'current_skincare',
                field_name: '当前使用的护肤品牌',
                field_type: 'textarea',
                required: false,
                placeholder: '请列举正在使用的护肤品牌和产品',
                display_order: 7,
                group: '护肤习惯',
                validation: { maxLength: 500 }
            }
        ],
        field_groups: [
            { group_name: '皮肤诊断', display_order: 1 },
            { group_name: '生活方式', display_order: 2 },
            { group_name: '护肤习惯', display_order: 3 },
            { group_name: '健康信息', display_order: 4 }
        ],
        is_default: 0,
        status: 'active'
    },
    {
        template_code: 'ONLINE_SIMPLE',
        template_name: '线上注册快速模板',
        description: '适用于线上客户快速注册，字段精简便于填写',
        org_id: null,
        scope: 'global',
        apply_scene: 'online_register',
        fields: [
            {
                field_key: 'skin_type',
                field_name: '肤质类型',
                field_type: 'select',
                required: true,
                options: ['干性', '油性', '混合性', '敏感性', '中性', '不清楚'],
                placeholder: '请选择您的肤质',
                display_order: 1,
                group: '基础信息'
            },
            {
                field_key: 'skin_concerns',
                field_name: '最关注的问题（最多选3项）',
                field_type: 'checkbox',
                required: true,
                options: ['美白', '补水', '抗衰老', '祛痘', '淡斑', '收毛孔', '紧致提拉'],
                default_value: [],
                display_order: 2,
                group: '需求分析',
                validation: { maxSelect: 3 }
            },
            {
                field_key: 'age_range',
                field_name: '年龄段',
                field_type: 'select',
                required: true,
                options: ['18岁以下', '18-25岁', '26-35岁', '36-45岁', '46-55岁', '56岁以上'],
                display_order: 3,
                group: '基础信息'
            },
            {
                field_key: 'budget_range',
                field_name: '护理预算（月）',
                field_type: 'select',
                required: false,
                options: ['500元以下', '500-1000元', '1000-2000元', '2000-5000元', '5000元以上'],
                display_order: 4,
                group: '消费意向'
            }
        ],
        field_groups: [
            { group_name: '基础信息', display_order: 1 },
            { group_name: '需求分析', display_order: 2 },
            { group_name: '消费意向', display_order: 3 }
        ],
        is_default: 0,
        status: 'active'
    },
    {
        template_code: 'NEW_CUSTOMER_DETAILED',
        template_name: '新客到店详细登记模板',
        description: '新客户首次到店使用，全面采集客户信息',
        org_id: null,
        scope: 'global',
        apply_scene: 'new_customer',
        fields: [
            {
                field_key: 'referral_source',
                field_name: '了解渠道',
                field_type: 'select',
                required: true,
                options: ['朋友推荐', '网络广告', '路过看到', '社交媒体', '团购平台', '其他'],
                display_order: 1,
                group: '来源信息'
            },
            {
                field_key: 'referral_person',
                field_name: '推荐人',
                field_type: 'text',
                required: false,
                placeholder: '如有推荐人请填写姓名或会员号',
                display_order: 2,
                group: '来源信息'
            },
            {
                field_key: 'skin_type',
                field_name: '肤质类型',
                field_type: 'select',
                required: true,
                options: ['干性', '油性', '混合性', '敏感性', '中性'],
                display_order: 3,
                group: '皮肤分析'
            },
            {
                field_key: 'main_concerns',
                field_name: '主要护理需求',
                field_type: 'checkbox',
                required: true,
                options: ['补水保湿', '美白淡斑', '抗衰老', '祛痘控油', '收缩毛孔', '敏感修复', '紧致提拉'],
                default_value: [],
                display_order: 4,
                group: '皮肤分析'
            },
            {
                field_key: 'allergies',
                field_name: '过敏史',
                field_type: 'textarea',
                required: false,
                placeholder: '请详细说明过敏物质和过敏反应',
                display_order: 5,
                group: '健康档案',
                validation: { maxLength: 300 }
            },
            {
                field_key: 'current_medications',
                field_name: '正在服用的药物',
                field_type: 'textarea',
                required: false,
                placeholder: '如有请填写',
                display_order: 6,
                group: '健康档案',
                validation: { maxLength: 200 }
            },
            {
                field_key: 'service_preferences',
                field_name: '服务偏好',
                field_type: 'checkbox',
                required: false,
                options: ['安静环境', '轻音乐', '聊天互动', '美容知识讲解', '独立包间'],
                default_value: [],
                display_order: 7,
                group: '服务偏好'
            },
            {
                field_key: 'preferred_time',
                field_name: '偏好到店时间',
                field_type: 'checkbox',
                required: false,
                options: ['工作日上午', '工作日下午', '工作日晚上', '周末上午', '周末下午', '周末晚上'],
                default_value: [],
                display_order: 8,
                group: '服务偏好'
            }
        ],
        field_groups: [
            { group_name: '来源信息', display_order: 1 },
            { group_name: '皮肤分析', display_order: 2 },
            { group_name: '健康档案', display_order: 3 },
            { group_name: '服务偏好', display_order: 4 }
        ],
        is_default: 0,
        status: 'active'
    },
    {
        template_code: 'BODY_CARE_TEMPLATE',
        template_name: '身体护理客户模板',
        description: '适用于身体护理、SPA类项目的客户信息采集',
        org_id: null,
        scope: 'global',
        apply_scene: 'other',
        fields: [
            {
                field_key: 'body_type',
                field_name: '体型特征',
                field_type: 'select',
                required: true,
                options: ['偏瘦', '标准', '偏胖', '肥胖'],
                display_order: 1,
                group: '身体信息'
            },
            {
                field_key: 'body_concerns',
                field_name: '身体护理需求',
                field_type: 'checkbox',
                required: true,
                options: ['减肥塑形', '淋巴排毒', '肩颈舒缓', '腿部护理', '背部护理', '产后修复', '胸部护理'],
                default_value: [],
                display_order: 2,
                group: '护理需求'
            },
            {
                field_key: 'skin_sensitivity',
                field_name: '身体皮肤敏感度',
                field_type: 'select',
                required: true,
                options: ['不敏感', '轻度敏感', '中度敏感', '重度敏感'],
                display_order: 3,
                group: '身体信息'
            },
            {
                field_key: 'chronic_conditions',
                field_name: '慢性疾病',
                field_type: 'checkbox',
                required: false,
                options: ['高血压', '低血压', '糖尿病', '心脏病', '静脉曲张', '无'],
                default_value: [],
                display_order: 4,
                group: '健康信息'
            },
            {
                field_key: 'pregnancy_status',
                field_name: '孕产状态',
                field_type: 'select',
                required: false,
                options: ['无', '备孕期', '孕期', '哺乳期', '产后恢复期'],
                display_order: 5,
                group: '健康信息'
            },
            {
                field_key: 'massage_pressure',
                field_name: '按摩力度偏好',
                field_type: 'select',
                required: false,
                options: ['轻柔', '适中', '稍重', '重度'],
                display_order: 6,
                group: '服务偏好'
            },
            {
                field_key: 'aromatherapy_preference',
                field_name: '精油香型偏好',
                field_type: 'checkbox',
                required: false,
                options: ['薰衣草', '玫瑰', '柠檬', '茶树', '薄荷', '檀香', '无特殊要求'],
                default_value: [],
                display_order: 7,
                group: '服务偏好'
            }
        ],
        field_groups: [
            { group_name: '身体信息', display_order: 1 },
            { group_name: '护理需求', display_order: 2 },
            { group_name: '健康信息', display_order: 3 },
            { group_name: '服务偏好', display_order: 4 }
        ],
        is_default: 0,
        status: 'active'
    }
];

async function insertTemplates() {
    let connection;

    try {
        console.log('====================================');
        console.log('  客户模板测试数据插入');
        console.log('====================================\n');

        // 创建连接
        console.log('📝 正在连接数据库...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ 数据库连接成功\n');

        // 清空现有数据
        console.log('🗑️  正在清空现有模板数据...');
        await connection.execute('DELETE FROM customer_profile_templates WHERE 1=1');
        console.log('✅ 现有数据已清空\n');

        // 插入测试数据
        console.log('📥 正在插入测试数据...\n');

        for (const template of templates) {
            const sql = `
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                template.template_code,
                template.template_name,
                template.description,
                template.org_id,
                template.scope,
                template.apply_scene,
                JSON.stringify(template.fields),
                JSON.stringify(template.field_groups),
                template.is_default,
                template.status
            ];

            await connection.execute(sql, values);
            console.log(`  ✓ ${template.template_name}`);
        }

        console.log('\n✅ 所有测试数据插入成功！\n');

        // 查询并显示结果
        const [rows] = await connection.execute('SELECT * FROM customer_profile_templates');
        console.log('====================================');
        console.log(`  共插入 ${rows.length} 个模板`);
        console.log('====================================\n');

        rows.forEach((row, index) => {
            console.log(`${index + 1}. ${row.template_name}`);
            console.log(`   编码: ${row.template_code}`);
            console.log(`   场景: ${row.apply_scene}`);
            const fields = typeof row.fields === 'string' ? JSON.parse(row.fields) : row.fields;
            console.log(`   字段数: ${fields.length}`);
            console.log(`   状态: ${row.status}`);
            console.log('');
        });

    } catch (error) {
        console.error('❌ 错误:', error.message);
        console.error(error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 数据库连接已关闭');
        }
    }
}

// 运行脚本
insertTemplates();
