/**
 * 美业客户洞察 CRM - 数据服务模块
 * 提供多租户数据管理和持久化功能
 *
 * 架构说明:
 * - 支持多租户隔离(Multi-tenancy)
 * - 所有数据存储在同一数组中,通过orgId进行逻辑隔离(Row-Level Security模拟)
 * - 使用localStorage进行数据持久化
 * - 提供完整的CRUD操作接口
 */

// ==================== 存储键定义 ====================

const STORAGE_KEYS = {
    CUSTOMERS: 'customers',
    TEMPLATES: 'templates',
    ORGANIZATIONS: 'organizations',
    CURRENT_ORG_ID: 'current_org_id',
    CASE_STUDIES: 'case_studies',
    PHILOSOPHIES: 'philosophies',
    ORDERS: 'orders',
    TASKS: 'tasks',
    PDCA_CYCLES: 'pdca_cycles',
    FRANCHISEES: 'franchisees'
};

// ==================== 字段类型枚举 ====================

const FieldType = {
    TEXT: 'text',
    TEXTAREA: 'textarea',
    NUMBER: 'number',
    DATE: 'date',
    SELECT: 'select',
    BOOLEAN: 'boolean'
};

// ==================== 模板分类枚举 ====================

const TemplateCategory = {
    PROFILE: 'profile',      // 档案类
    PLAN: 'plan',           // 方案类
    BEHAVIOR: 'behavior'    // 行为类
};

// ==================== 订单状态枚举 ====================

const OrderStatus = {
    PENDING: 'pending',         // 待支付
    PAID: 'paid',              // 已支付
    IN_PROGRESS: 'in_progress', // 进行中
    COMPLETED: 'completed',     // 已完成
    CANCELLED: 'cancelled'      // 已取消
};

// ==================== 任务状态枚举 ====================

const TaskStatus = {
    PENDING: 'pending',       // 待执行
    IN_PROGRESS: 'in_progress', // 进行中
    COMPLETED: 'completed',   // 已完成
    SKIPPED: 'skipped'       // 已跳过
};

// ==================== 种子数据 ====================

// 默认组织数据
const SEED_ORGS = [
    {
        id: 'org_default',
        name: '良辰古一真',
        contactPerson: '王店长',
        phone: '021-12345678',
        address: '上海市静安区南京西路888号',
        createdAt: new Date().toISOString()
    },
    {
        id: 'org_branch_bj',
        name: '北京·悦己美学',
        contactPerson: '张经理',
        phone: '010-87654321',
        address: '北京市朝阳区三里屯SOHO',
        createdAt: new Date().toISOString()
    }
];

// 默认模板数据
const DEFAULT_TEMPLATES = [
    {
        id: 'tpl_basic_info',
        orgId: 'org_default',
        name: '客户基础信息',
        category: TemplateCategory.PROFILE,
        description: '客户基本资料档案',
        schema: [
            { key: 'gender', label: '性别', type: FieldType.SELECT, options: ['女', '男'], required: true },
            { key: 'birthday', label: '出生日期', type: FieldType.DATE },
            { key: 'age', label: '年龄', type: FieldType.NUMBER },
            { key: 'id_card', label: '身份证号', type: FieldType.TEXT },
            { key: 'wechat', label: '微信号', type: FieldType.TEXT },
            { key: 'email', label: '电子邮箱', type: FieldType.TEXT },
            { key: 'address', label: '详细地址', type: FieldType.TEXTAREA },
            { key: 'occupation', label: '职业', type: FieldType.TEXT },
            { key: 'income_level', label: '收入水平', type: FieldType.SELECT, options: ['3千以下', '3-5千', '5-8千', '8千-1万', '1-2万', '2万以上'] },
            { key: 'customer_source', label: '客户来源', type: FieldType.SELECT, options: ['自然到店', '朋友介绍', '线上广告', '短视频平台', '公众号', '线下活动', '老客转介绍', '其他'] },
            { key: 'referrer', label: '推荐人', type: FieldType.TEXT },
            { key: 'vip_level', label: '会员等级', type: FieldType.SELECT, options: ['普通会员', '银卡会员', '金卡会员', '铂金会员', '钻石会员'] },
            { key: 'registration_date', label: '注册日期', type: FieldType.DATE }
        ]
    },
    {
        id: 'tpl_basic_skin',
        orgId: 'org_default',
        name: '皮肤档案',
        category: TemplateCategory.PROFILE,
        description: '详细皮肤状况分析档案',
        schema: [
            { key: 'skin_type', label: '皮肤类型', type: FieldType.SELECT, options: ['干性', '油性', '混合性', '敏感性', '中性'], required: true },
            { key: 'skin_condition', label: '皮肤状态', type: FieldType.SELECT, options: ['健康', '缺水', '暗沉', '粗糙', '松弛', '色斑', '痘痘', '红血丝'] },
            { key: 'concerns', label: '主要困扰', type: FieldType.TEXTAREA, required: true },
            { key: 'allergies', label: '过敏史', type: FieldType.TEXTAREA },
            { key: 'allergy_ingredients', label: '过敏成分', type: FieldType.TEXT },
            { key: 'skin_sensitivity', label: '敏感程度', type: FieldType.SELECT, options: ['不敏感', '轻度敏感', '中度敏感', '重度敏感'] },
            { key: 'pore_size', label: '毛孔大小', type: FieldType.SELECT, options: ['细腻', '正常', '粗大', '非常粗大'] },
            { key: 'acne_history', label: '痘痘历史', type: FieldType.SELECT, options: ['从不长痘', '偶尔长痘', '经常长痘', '重度痤疮'] }
        ]
    },
    {
        id: 'tpl_health_profile',
        orgId: 'org_default',
        name: '健康档案',
        category: TemplateCategory.PROFILE,
        description: '客户健康状况档案',
        schema: [
            { key: 'height', label: '身高(cm)', type: FieldType.NUMBER, required: true },
            { key: 'weight', label: '体重(kg)', type: FieldType.NUMBER, required: true },
            { key: 'bmi', label: 'BMI指数', type: FieldType.NUMBER },
            { key: 'blood_pressure', label: '血压', type: FieldType.TEXT },
            { key: 'blood_sugar', label: '血糖', type: FieldType.TEXT },
            { key: 'medical_history', label: '疾病史', type: FieldType.TEXTAREA },
            { key: 'medications', label: '常用药物', type: FieldType.TEXTAREA },
            { key: 'surgery_history', label: '手术史', type: FieldType.TEXTAREA },
            { key: 'menstrual_cycle', label: '月经周期', type: FieldType.TEXT },
            { key: 'pregnancy_status', label: '怀孕状态', type: FieldType.SELECT, options: ['未怀孕', '备孕中', '已怀孕', '哺乳期'] }
        ]
    },
    {
        id: 'tpl_lifestyle',
        orgId: 'org_default',
        name: '生活习惯',
        category: TemplateCategory.PROFILE,
        description: '客户日常生活习惯档案',
        schema: [
            { key: 'sleep_hours', label: '平均睡眠时长(小时)', type: FieldType.NUMBER },
            { key: 'sleep_quality', label: '睡眠质量', type: FieldType.SELECT, options: ['很好', '良好', '一般', '较差', '很差'] },
            { key: 'water_intake', label: '每日饮水量(ml)', type: FieldType.NUMBER },
            { key: 'diet_preference', label: '饮食偏好', type: FieldType.SELECT, options: ['均衡饮食', '偏素食', '偏肉食', '不规律饮食'] },
            { key: 'exercise_frequency', label: '运动频率', type: FieldType.SELECT, options: ['每天', '每周3-5次', '每周1-2次', '偶尔', '从不'] },
            { key: 'exercise_type', label: '运动类型', type: FieldType.TEXT },
            { key: 'smoking', label: '吸烟状况', type: FieldType.SELECT, options: ['不吸烟', '已戒烟', '偶尔吸烟', '经常吸烟'] },
            { key: 'drinking', label: '饮酒状况', type: FieldType.SELECT, options: ['不饮酒', '偶尔饮酒', '社交饮酒', '经常饮酒'] },
            { key: 'stress_level', label: '压力水平', type: FieldType.SELECT, options: ['很低', '较低', '中等', '较高', '很高'] },
            { key: 'work_nature', label: '工作性质', type: FieldType.SELECT, options: ['久坐办公', '站立工作', '体力劳动', '轮班工作', '自由职业'] }
        ]
    },
    {
        id: 'tpl_beauty_goals',
        orgId: 'org_default',
        name: '美容目标',
        category: TemplateCategory.PROFILE,
        description: '客户美容需求和目标',
        schema: [
            { key: 'primary_goal', label: '主要目标', type: FieldType.SELECT, options: ['减重塑形', '抗衰老', '美白提亮', '祛痘控油', '补水保湿', '紧致提升', '淡化色斑', '改善敏感'], required: true },
            { key: 'secondary_goals', label: '次要目标', type: FieldType.TEXTAREA },
            { key: 'target_weight', label: '目标体重(kg)', type: FieldType.NUMBER },
            { key: 'timeline', label: '期望达成时间', type: FieldType.SELECT, options: ['1个月内', '3个月内', '6个月内', '1年内', '长期保养'] },
            { key: 'budget_range', label: '预算范围', type: FieldType.SELECT, options: ['3千以内', '3-5千', '5-1万', '1-2万', '2-5万', '5万以上'] },
            { key: 'preferred_services', label: '偏好服务', type: FieldType.TEXTAREA },
            { key: 'time_preference', label: '时间偏好', type: FieldType.SELECT, options: ['工作日上午', '工作日下午', '工作日晚上', '周末全天'] },
            { key: 'concerns_and_expectations', label: '顾虑与期望', type: FieldType.TEXTAREA }
        ]
    },
    {
        id: 'tpl_meal_photo_checkin',
        orgId: 'org_default',
        name: '饮食拍照打卡记录',
        category: TemplateCategory.BEHAVIOR,
        description: '记录客户每日饮食拍照打卡行为',
        schema: [
            { key: 'checkin_date', label: '打卡日期', type: FieldType.DATE, required: true },
            { key: 'meal_type', label: '餐次', type: FieldType.SELECT, options: ['早餐', '午餐', '晚餐', '上午加餐', '下午加餐', '夜宵'], required: true },
            { key: 'photo_taken', label: '是否拍照', type: FieldType.BOOLEAN, required: true },
            { key: 'food_types', label: '食物类型', type: FieldType.SELECT, options: ['主食', '蛋白质', '蔬菜', '水果', '饮品', '零食', '其他'], required: true },
            { key: 'portion_size', label: '份量评估', type: FieldType.SELECT, options: ['少量', '适中', '较多', '过量'] },
            { key: 'notes', label: '备注说明', type: FieldType.TEXTAREA }
        ]
    },
    {
        id: 'tpl_exercise_checkin',
        orgId: 'org_default',
        name: '运动打卡记录',
        category: TemplateCategory.BEHAVIOR,
        description: '记录客户每日运动打卡行为',
        schema: [
            { key: 'checkin_date', label: '打卡日期', type: FieldType.DATE, required: true },
            { key: 'exercise_type', label: '运动类型', type: FieldType.SELECT, options: ['有氧运动', '力量训练', '瑜伽', '普拉提', '游泳', '跑步', '快走', '骑行', '球类运动', '其他'], required: true },
            { key: 'exercise_duration', label: '运动时长(分钟)', type: FieldType.NUMBER, required: true },
            { key: 'exercise_intensity', label: '运动强度', type: FieldType.SELECT, options: ['低强度', '中强度', '高强度'], required: true },
            { key: 'calories_burned', label: '消耗卡路里', type: FieldType.NUMBER },
            { key: 'notes', label: '运动感受', type: FieldType.TEXTAREA }
        ]
    },
    {
        id: 'tpl_weight_tracking',
        orgId: 'org_default',
        name: '体重变化记录',
        category: TemplateCategory.BEHAVIOR,
        description: '记录客户每日体重变化',
        schema: [
            { key: 'record_date', label: '记录日期', type: FieldType.DATE, required: true },
            { key: 'measurement_time', label: '测量时间', type: FieldType.TEXT, required: true },
            { key: 'weight_kg', label: '体重(kg)', type: FieldType.NUMBER, required: true },
            { key: 'body_fat_percent', label: '体脂率(%)', type: FieldType.NUMBER },
            { key: 'muscle_mass_kg', label: '肌肉量(kg)', type: FieldType.NUMBER },
            { key: 'bmi', label: 'BMI指数', type: FieldType.NUMBER },
            { key: 'notes', label: '备注说明', type: FieldType.TEXTAREA }
        ]
    },
    // 方案模板
    {
        id: 'plan_weight_loss_basic',
        orgId: 'org_default',
        name: '减重基础方案',
        category: TemplateCategory.PLAN,
        description: '适合轻度超重客户的基础减重方案',
        schema: [
            { key: 'plan_duration', label: '方案周期(天)', type: FieldType.NUMBER, required: true },
            { key: 'target_weight_loss', label: '目标减重(kg)', type: FieldType.NUMBER, required: true },
            { key: 'diet_plan', label: '饮食计划', type: FieldType.TEXTAREA, required: true },
            { key: 'exercise_plan', label: '运动计划', type: FieldType.TEXTAREA, required: true },
            { key: 'service_items', label: '服务项目', type: FieldType.TEXTAREA },
            { key: 'checkin_frequency', label: '打卡频率', type: FieldType.SELECT, options: ['每日', '每周3次', '每周5次'] },
            { key: 'price', label: '方案价格', type: FieldType.NUMBER }
        ],
        defaultData: {
            plan_duration: 90,
            target_weight_loss: 5,
            diet_plan: '低碳水化合物饮食,每日摄入1200-1500卡路里,三餐规律,晚餐减半',
            exercise_plan: '每周至少3次有氧运动,每次30-45分钟',
            service_items: '体脂分析、营养咨询、每周跟踪',
            checkin_frequency: '每日',
            price: 3500
        }
    },
    {
        id: 'plan_weight_loss_advanced',
        orgId: 'org_default',
        name: '减重进阶方案',
        category: TemplateCategory.PLAN,
        description: '适合中重度超重客户的进阶减重方案',
        schema: [
            { key: 'plan_duration', label: '方案周期(天)', type: FieldType.NUMBER, required: true },
            { key: 'target_weight_loss', label: '目标减重(kg)', type: FieldType.NUMBER, required: true },
            { key: 'diet_plan', label: '饮食计划', type: FieldType.TEXTAREA, required: true },
            { key: 'exercise_plan', label: '运动计划', type: FieldType.TEXTAREA, required: true },
            { key: 'service_items', label: '服务项目', type: FieldType.TEXTAREA },
            { key: 'checkin_frequency', label: '打卡频率', type: FieldType.SELECT, options: ['每日', '每周3次', '每周5次'] },
            { key: 'price', label: '方案价格', type: FieldType.NUMBER }
        ],
        defaultData: {
            plan_duration: 180,
            target_weight_loss: 10,
            diet_plan: '定制营养餐,每日摄入1000-1300卡路里,高蛋白低脂肪',
            exercise_plan: '每周5次有氧+力量训练组合,每次60分钟',
            service_items: '体脂分析、营养咨询、私教指导、美容仪器辅助、每日跟踪',
            checkin_frequency: '每日',
            price: 8800
        }
    },
    {
        id: 'plan_skin_care_hydration',
        orgId: 'org_default',
        name: '补水保湿护理方案',
        category: TemplateCategory.PLAN,
        description: '针对干性缺水肌肤的补水保湿方案',
        schema: [
            { key: 'plan_duration', label: '方案周期(天)', type: FieldType.NUMBER, required: true },
            { key: 'service_frequency', label: '护理频次', type: FieldType.SELECT, options: ['每周1次', '每周2次', '每月4次', '每月6次'] },
            { key: 'service_items', label: '服务项目', type: FieldType.TEXTAREA, required: true },
            { key: 'home_care', label: '居家护理', type: FieldType.TEXTAREA },
            { key: 'price', label: '方案价格', type: FieldType.NUMBER }
        ],
        defaultData: {
            plan_duration: 30,
            service_frequency: '每周2次',
            service_items: '深层清洁、补水面膜、精华导入、保湿按摩',
            home_care: '早晚使用补水精华液,每周2次补水面膜',
            price: 2800
        }
    },
    {
        id: 'plan_anti_aging',
        orgId: 'org_default',
        name: '抗衰紧致方案',
        category: TemplateCategory.PLAN,
        description: '针对肌肤松弛老化的抗衰方案',
        schema: [
            { key: 'plan_duration', label: '方案周期(天)', type: FieldType.NUMBER, required: true },
            { key: 'service_frequency', label: '护理频次', type: FieldType.SELECT, options: ['每周1次', '每周2次', '每月4次', '每月6次'] },
            { key: 'service_items', label: '服务项目', type: FieldType.TEXTAREA, required: true },
            { key: 'home_care', label: '居家护理', type: FieldType.TEXTAREA },
            { key: 'price', label: '方案价格', type: FieldType.NUMBER }
        ],
        defaultData: {
            plan_duration: 90,
            service_frequency: '每周1次',
            service_items: '射频紧肤、超声刀提拉、胶原蛋白导入、抗衰按摩手法',
            home_care: '使用抗衰精华和面霜,配合提拉按摩手法',
            price: 12800
        }
    }
];

// 默认客户数据 - 包含完整演示数据
const DEFAULT_CUSTOMERS = [
    {
        id: 'cust_1',
        orgId: 'org_default',
        name: '陈爱丽',
        phone: '13800138000',
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        data: {
            'tpl_basic_info': {
                'gender': '女',
                'birthday': '1994-05-15',
                'age': 30,
                'wechat': 'chen_aili_beauty',
                'email': 'chen.aili@example.com',
                'address': '上海市浦东新区世纪大道88号',
                'occupation': '互联网产品经理',
                'income_level': '1-2万',
                'customer_source': '短视频平台',
                'referrer': '',
                'vip_level': '金卡会员',
                'registration_date': new Date(Date.now() - 86400000 * 60).toISOString().split('T')[0]
            },
            'tpl_basic_skin': {
                'skin_type': '混合性',
                'skin_condition': '痘痘',
                'concerns': 'T区出油严重,两颊干燥紧绷,下巴反复长痘,毛孔粗大,有痘印',
                'allergies': '对酒精和香精敏感',
                'allergy_ingredients': '酒精、香精、水杨酸',
                'skin_sensitivity': '轻度敏感',
                'pore_size': '粗大',
                'acne_history': '经常长痘'
            },
            'tpl_health_profile': {
                'height': 165,
                'weight': 68,
                'bmi': 25.0,
                'blood_pressure': '120/80',
                'blood_sugar': '正常',
                'medical_history': '无重大疾病史',
                'medications': '无',
                'surgery_history': '无',
                'menstrual_cycle': '28天,规律',
                'pregnancy_status': '未怀孕'
            },
            'tpl_lifestyle': {
                'sleep_hours': 6,
                'sleep_quality': '较差',
                'water_intake': 1200,
                'diet_preference': '不规律饮食',
                'exercise_frequency': '每周1-2次',
                'exercise_type': '瑜伽',
                'smoking': '不吸烟',
                'drinking': '社交饮酒',
                'stress_level': '较高',
                'work_nature': '久坐办公'
            },
            'tpl_beauty_goals': {
                'primary_goal': '减重塑形',
                'secondary_goals': '改善皮肤状态,祛痘淡化痘印,提升气色',
                'target_weight': 58,
                'timeline': '3个月内',
                'budget_range': '1-2万',
                'preferred_services': '体重管理、皮肤护理、抗压放松',
                'time_preference': '周末全天',
                'concerns_and_expectations': '希望在不影响工作的情况下健康减重,同时改善皮肤状态'
            }
        },
        // 身体组成分析数据
        bodyComposition: {
            weight: 68.0,
            bodyFat: 32.5,
            muscleMass: 42.8,
            bmi: 25.0,
            visceralFat: 8,
            bmr: 1320,
            bodyAge: 35,
            measuredAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        // AI诊断结果
        aiDiagnosis: {
            overallScore: 65,
            healthStatus: '亚健康',
            keyIssues: [
                '体脂率偏高(32.5%),建议范围20-25%',
                '内脏脂肪等级8,接近警戒线',
                '基础代谢率偏低,需要增加肌肉量',
                '体重指数BMI 25.0,属于超重范围'
            ],
            recommendations: [
                '建议进行3个月减重计划,目标减重8-10kg',
                '增加有氧运动,每周至少4次,每次40分钟以上',
                '配合力量训练提升基础代谢',
                '调整饮食结构,控制碳水化合物摄入',
                '保证充足睡眠,改善作息规律'
            ],
            riskLevel: 'medium',
            diagnosedAt: new Date(Date.now() - 86400000 * 1).toISOString()
        },
        salesHistory: [
            {
                id: 'sale_1',
                date: new Date(Date.now() - 86400000 * 25).toISOString(),
                amount: 3500,
                serviceName: '减重基础方案(90天)'
            },
            {
                id: 'sale_2',
                date: new Date(Date.now() - 86400000 * 10).toISOString(),
                amount: 1500,
                serviceName: '皮肤深层清洁护理'
            }
        ],
        // AI对话记录
        chatHistory: [
            {
                id: 'chat_1',
                role: 'user',
                content: '你好,我想咨询一下减重的问题',
                timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
            },
            {
                id: 'chat_2',
                role: 'assistant',
                content: '您好陈小姐!很高兴为您服务。我看到您的档案显示目前体重68kg,目标是减到58kg。根据您的身体数据,这是一个非常合理的目标。请问您之前有尝试过减重吗?',
                timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
            },
            {
                id: 'chat_3',
                role: 'user',
                content: '试过几次,但都没坚持下来。工作太忙了,经常加班到很晚,饮食也不规律',
                timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
            },
            {
                id: 'chat_4',
                role: 'assistant',
                content: '理解您的情况。工作压力大确实会影响减重效果。根据您的体脂分析报告,您的体脂率是32.5%,略高于正常范围。我建议您可以从这几个方面入手:\n\n1. 饮食调整:不需要节食,但要控制碳水摄入,增加优质蛋白\n2. 规律运动:每周至少3-4次有氧运动,每次30-40分钟\n3. 改善睡眠:尽量在11点前入睡,保证7小时睡眠\n4. 配合我们的减重方案:包含营养指导和定期跟踪\n\n您觉得这样的安排可行吗?',
                timestamp: new Date(Date.now() - 86400000 * 30).toISOString()
            },
            {
                id: 'chat_5',
                role: 'user',
                content: '听起来不错,但我担心坚持不下来。你们有什么方法帮助监督吗?',
                timestamp: new Date(Date.now() - 86400000 * 29).toISOString()
            },
            {
                id: 'chat_6',
                role: 'assistant',
                content: '当然有!我们的减重方案包含以下支持:\n\n1. 每日打卡系统:饮食打卡、运动打卡\n2. 专属顾问跟踪:每周至少2次沟通\n3. 定期体脂分析:每两周一次数据监测\n4. 小组互助:加入减重小组,互相鼓励\n5. AI智能提醒:根据您的作息提醒打卡\n\n另外,我们的方案是渐进式的,不会让您感到太大压力。前两周主要是适应期,养成习惯最重要。',
                timestamp: new Date(Date.now() - 86400000 * 29).toISOString()
            },
            {
                id: 'chat_7',
                role: 'user',
                content: '好的,那我想报名90天的基础方案。另外我的皮肤状态也不太好,经常长痘,能一起改善吗?',
                timestamp: new Date(Date.now() - 86400000 * 28).toISOString()
            },
            {
                id: 'chat_8',
                role: 'assistant',
                content: '完全可以!其实减重和皮肤改善是相辅相成的。我看到您的皮肤档案显示T区出油、容易长痘。这往往与以下因素有关:\n\n1. 饮食:高糖高油食物会加重出油和痘痘\n2. 作息:熬夜会导致内分泌失调\n3. 压力:工作压力会影响激素水平\n\n在减重过程中,饮食调整、规律作息、压力缓解,这些都会帮助改善皮肤。另外我们可以配合一些皮肤护理项目,比如深层清洁、消炎镇静等。\n\n建议您先从减重方案开始,一个月后我们根据皮肤改善情况,再制定针对性的皮肤护理方案,这样效果会更好。',
                timestamp: new Date(Date.now() - 86400000 * 28).toISOString()
            },
            {
                id: 'chat_9',
                role: 'user',
                content: '太好了!那我现在就报名,什么时候可以开始?',
                timestamp: new Date(Date.now() - 86400000 * 27).toISOString()
            },
            {
                id: 'chat_10',
                role: 'assistant',
                content: '太棒了陈小姐!欢迎加入我们的减重计划。我已经为您生成了订单,方案包含:\n\n- 90天减重管理服务\n- 初始体脂分析(已完成)\n- 个性化饮食方案\n- 运动指导计划\n- 每日打卡监督\n- 每周进度跟踪\n\n明天就可以开始!今晚我会把详细的饮食和运动计划发给您,请您提前准备一下。另外,明天上午方便的话,我们约个时间做一次详细的方案讲解,确保您完全理解。\n\n加油!相信90天后您会看到惊喜的变化!',
                timestamp: new Date(Date.now() - 86400000 * 27).toISOString()
            }
        ]
    },
    {
        id: 'cust_2',
        orgId: 'org_default',
        name: '王美琪',
        phone: '13800138001',
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        data: {
            'tpl_basic_info': {
                'gender': '女',
                'birthday': '1988-08-20',
                'age': 36,
                'wechat': 'wang_meiqi',
                'email': 'wang.meiqi@example.com',
                'address': '上海市徐汇区淮海中路168号',
                'occupation': '公司高管',
                'income_level': '2万以上',
                'customer_source': '老客转介绍',
                'referrer': '李女士',
                'vip_level': '铂金会员',
                'registration_date': new Date(Date.now() - 86400000 * 90).toISOString().split('T')[0]
            },
            'tpl_basic_skin': {
                'skin_type': '干性',
                'skin_condition': '松弛',
                'concerns': '法令纹明显,眼周细纹,面部松弛下垂,肤色暗沉',
                'allergies': '无',
                'allergy_ingredients': '',
                'skin_sensitivity': '不敏感',
                'pore_size': '正常',
                'acne_history': '从不长痘'
            },
            'tpl_health_profile': {
                'height': 168,
                'weight': 58,
                'bmi': 20.5,
                'blood_pressure': '115/75',
                'blood_sugar': '正常',
                'medical_history': '无',
                'medications': '维生素E、胶原蛋白',
                'surgery_history': '无',
                'menstrual_cycle': '不规律',
                'pregnancy_status': '未怀孕'
            },
            'tpl_lifestyle': {
                'sleep_hours': 7,
                'sleep_quality': '良好',
                'water_intake': 2000,
                'diet_preference': '均衡饮食',
                'exercise_frequency': '每周3-5次',
                'exercise_type': '瑜伽、普拉提',
                'smoking': '不吸烟',
                'drinking': '偶尔饮酒',
                'stress_level': '中等',
                'work_nature': '久坐办公'
            },
            'tpl_beauty_goals': {
                'primary_goal': '抗衰老',
                'secondary_goals': '紧致提升,淡化细纹,美白提亮',
                'target_weight': 58,
                'timeline': '6个月内',
                'budget_range': '2-5万',
                'preferred_services': '抗衰项目、高端护理、医美微整',
                'time_preference': '工作日下午',
                'concerns_and_expectations': '希望延缓衰老,保持年轻态,愿意尝试先进的抗衰技术'
            }
        },
        bodyComposition: {
            weight: 58.0,
            bodyFat: 24.5,
            muscleMass: 40.2,
            bmi: 20.5,
            visceralFat: 5,
            bmr: 1280,
            bodyAge: 33,
            measuredAt: new Date(Date.now() - 86400000 * 5).toISOString()
        },
        aiDiagnosis: {
            overallScore: 82,
            healthStatus: '良好',
            keyIssues: [
                '皮肤弹性下降,胶原蛋白流失',
                '面部轮廓松弛,需要提拉紧致',
                '细纹开始显现,特别是眼周和法令纹区域'
            ],
            recommendations: [
                '建议进行抗衰紧致方案,包含射频、超声刀等项目',
                '补充胶原蛋白,内外兼修',
                '坚持使用抗衰护肤品,配合按摩手法',
                '保持规律运动,促进血液循环',
                '注意防晒,减少紫外线伤害'
            ],
            riskLevel: 'low',
            diagnosedAt: new Date(Date.now() - 86400000 * 3).toISOString()
        },
        salesHistory: [
            {
                id: 'sale_3',
                date: new Date(Date.now() - 86400000 * 40).toISOString(),
                amount: 12800,
                serviceName: '抗衰紧致方案(90天)'
            },
            {
                id: 'sale_4',
                date: new Date(Date.now() - 86400000 * 15).toISOString(),
                amount: 3800,
                serviceName: '超声刀面部提升'
            },
            {
                id: 'sale_5',
                date: new Date(Date.now() - 86400000 * 5).toISOString(),
                amount: 2200,
                serviceName: '胶原蛋白导入护理'
            }
        ],
        chatHistory: [
            {
                id: 'chat_11',
                role: 'user',
                content: '我最近感觉皮肤松弛得厉害,特别是法令纹,有什么好的解决方案吗?',
                timestamp: new Date(Date.now() - 86400000 * 45).toISOString()
            },
            {
                id: 'chat_12',
                role: 'assistant',
                content: '王女士您好!我理解您的困扰。根据您的年龄和皮肤状况,出现法令纹和面部松弛是正常的衰老现象,但我们完全可以通过科学的方法来改善。\n\n我建议您考虑我们的抗衰紧致方案,主要包含:\n1. 射频紧肤:刺激胶原蛋白再生\n2. 超声刀提拉:深层提拉筋膜层\n3. 胶原蛋白导入:补充流失的胶原\n4. 专业抗衰按摩:促进吸收和循环\n\n这个组合方案效果显著,而且是非入侵性的,没有恢复期。',
                timestamp: new Date(Date.now() - 86400000 * 45).toISOString()
            },
            {
                id: 'chat_13',
                role: 'user',
                content: '听起来不错,但我担心会不会很痛?需要多长时间能看到效果?',
                timestamp: new Date(Date.now() - 86400000 * 44).toISOString()
            },
            {
                id: 'chat_14',
                role: 'assistant',
                content: '很好的问题!关于您的顾虑:\n\n疼痛感方面:\n- 射频紧肤:温热感,不会疼\n- 超声刀:略有刺痛感,但在可承受范围内\n- 其他项目:完全无痛\n\n效果时间:\n- 即时效果:做完就能看到皮肤紧致度提升\n- 持续改善:1-3个月效果逐渐显现\n- 最佳效果:3个月后达到最佳状态\n\n我们的方案周期是90天,期间会有多次护理,效果是渐进式的、自然的,不会让人觉得突兀。',
                timestamp: new Date(Date.now() - 86400000 * 44).toISOString()
            },
            {
                id: 'chat_15',
                role: 'user',
                content: '好的,我想先试试。价格大概多少?',
                timestamp: new Date(Date.now() - 86400000 * 43).toISOString()
            },
            {
                id: 'chat_16',
                role: 'assistant',
                content: '90天抗衰紧致方案的价格是12800元,包含:\n- 8次射频紧肤\n- 2次超声刀提拉\n- 6次胶原蛋白导入\n- 12次抗衰按摩护理\n- 定制家居护理产品\n- 全程专属顾问跟踪\n\n作为我们的铂金会员,您可以享受9折优惠,实际支付11520元。另外,如果您现在决定,我们还赠送价值2800元的补水保湿护理套餐。',
                timestamp: new Date(Date.now() - 86400000 * 43).toISOString()
            },
            {
                id: 'chat_17',
                role: 'user',
                content: '那我就报名吧。什么时候可以开始第一次护理?',
                timestamp: new Date(Date.now() - 86400000 * 42).toISOString()
            },
            {
                id: 'chat_18',
                role: 'assistant',
                content: '太好了!非常期待为您服务。我已经为您预约了后天下午3点的首次护理,届时我们会:\n\n1. 进行详细的皮肤检测和拍照建档\n2. 制定个性化护理计划\n3. 开始第一次射频紧肤+抗衰按摩\n4. 教您居家护理手法\n\n护理前请注意:\n- 做好基础清洁和防晒\n- 避免化浓妆\n- 如有不适请提前告知\n\n期待您的到来,相信90天后您会看到明显的改变!',
                timestamp: new Date(Date.now() - 86400000 * 42).toISOString()
            }
        ]
    },
    {
        id: 'cust_3',
        orgId: 'org_default',
        name: '李静怡',
        phone: '13800138002',
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        data: {
            'tpl_basic_info': {
                'gender': '女',
                'birthday': '1996-11-10',
                'age': 28,
                'wechat': 'li_jingyi_88',
                'email': 'li.jingyi@example.com',
                'address': '上海市黄浦区南京东路200号',
                'occupation': '时尚博主',
                'income_level': '1-2万',
                'customer_source': '公众号',
                'referrer': '',
                'vip_level': '银卡会员',
                'registration_date': new Date(Date.now() - 86400000 * 35).toISOString().split('T')[0]
            },
            'tpl_basic_skin': {
                'skin_type': '干性',
                'skin_condition': '暗沉',
                'concerns': '肤色暗沉发黄,缺乏光泽,眼周有色斑',
                'allergies': '对某些美白成分过敏',
                'allergy_ingredients': '熊果苷',
                'skin_sensitivity': '轻度敏感',
                'pore_size': '细腻',
                'acne_history': '偶尔长痘'
            },
            'tpl_health_profile': {
                'height': 170,
                'weight': 52,
                'bmi': 18.0,
                'blood_pressure': '110/70',
                'blood_sugar': '偏低',
                'medical_history': '轻度贫血',
                'medications': '补血口服液',
                'surgery_history': '无',
                'menstrual_cycle': '30天,经量偏少',
                'pregnancy_status': '未怀孕'
            },
            'tpl_lifestyle': {
                'sleep_hours': 5,
                'sleep_quality': '很差',
                'water_intake': 800,
                'diet_preference': '偏素食',
                'exercise_frequency': '偶尔',
                'exercise_type': '散步',
                'smoking': '不吸烟',
                'drinking': '不饮酒',
                'stress_level': '中等',
                'work_nature': '自由职业'
            },
            'tpl_beauty_goals': {
                'primary_goal': '美白提亮',
                'secondary_goals': '补水保湿,淡化色斑,改善气色',
                'target_weight': 52,
                'timeline': '3个月内',
                'budget_range': '5千-1万',
                'preferred_services': '美白护理、补水保湿、营养调理',
                'time_preference': '工作日上午',
                'concerns_and_expectations': '希望改善肤色暗沉,让皮肤更加透亮有光泽'
            }
        },
        bodyComposition: {
            weight: 52.0,
            bodyFat: 21.8,
            muscleMass: 37.5,
            bmi: 18.0,
            visceralFat: 3,
            bmr: 1180,
            bodyAge: 26,
            measuredAt: new Date(Date.now() - 86400000 * 8).toISOString()
        },
        aiDiagnosis: {
            overallScore: 70,
            healthStatus: '偏瘦',
            keyIssues: [
                'BMI 18.0,属于偏瘦范围',
                '肌肉量偏低,建议增加',
                '轻度贫血,影响气色',
                '睡眠质量差,每日仅5小时',
                '饮水量不足,建议增加到2000ml'
            ],
            recommendations: [
                '增加营养摄入,特别是优质蛋白和铁元素',
                '改善睡眠质量,尽量保证7-8小时',
                '增加饮水量,促进新陈代谢',
                '适度运动,增加肌肉量',
                '配合美白护理项目,内外兼修'
            ],
            riskLevel: 'low',
            diagnosedAt: new Date(Date.now() - 86400000 * 6).toISOString()
        },
        salesHistory: [
            {
                id: 'sale_6',
                date: new Date(Date.now() - 86400000 * 18).toISOString(),
                amount: 2800,
                serviceName: '补水保湿护理方案(30天)'
            },
            {
                id: 'sale_7',
                date: new Date(Date.now() - 86400000 * 8).toISOString(),
                amount: 1800,
                serviceName: '美白提亮护理'
            }
        ],
        chatHistory: [
            {
                id: 'chat_19',
                role: 'user',
                content: '我的皮肤最近特别暗沉,感觉很没有精神,有什么办法吗?',
                timestamp: new Date(Date.now() - 86400000 * 20).toISOString()
            },
            {
                id: 'chat_20',
                role: 'assistant',
                content: '李小姐您好!看到您的困扰了。皮肤暗沉通常有几个原因:\n1. 睡眠不足\n2. 血液循环不畅\n3. 皮肤缺水\n4. 角质层堆积\n5. 营养不良\n\n我看了您的健康档案,发现您每天睡眠只有5小时,而且有轻度贫血。这两个因素都会导致皮肤暗沉无光泽。建议您从内外两方面改善。',
                timestamp: new Date(Date.now() - 86400000 * 20).toISOString()
            },
            {
                id: 'chat_21',
                role: 'user',
                content: '确实,我经常熬夜,工作需要。有什么快速改善的方法吗?',
                timestamp: new Date(Date.now() - 86400000 * 19).toISOString()
            },
            {
                id: 'chat_22',
                role: 'assistant',
                content: '理解您的工作需要。虽然改善睡眠是根本,但我们也可以通过护理来缓解:\n\n快速改善方案:\n1. 补水保湿护理:深层补水,提升皮肤光泽\n2. 美白提亮护理:淡化暗沉,提亮肤色\n3. 促进循环:按摩手法,改善气色\n\n同时建议:\n- 增加饮水量(现在只有800ml,建议2000ml)\n- 补充铁元素,改善贫血\n- 尽量在12点前睡觉\n\n内外结合,效果会更好。',
                timestamp: new Date(Date.now() - 86400000 * 19).toISOString()
            },
            {
                id: 'chat_23',
                role: 'user',
                content: '好的,那我想试试补水保湿的护理,需要多久做一次?',
                timestamp: new Date(Date.now() - 86400000 * 18).toISOString()
            },
            {
                id: 'chat_24',
                role: 'assistant',
                content: '太好了!我建议您选择我们的30天补水保湿方案:\n\n方案内容:\n- 每周2次补水护理\n- 深层清洁+补水面膜\n- 精华导入+保湿按摩\n- 配套家居护理产品\n\n价格:2800元\n\n这个方案非常适合您现在的皮肤状态。30天后您会明显感觉到皮肤水润度提升,暗沉改善。如果效果好,我们可以再追加美白提亮的项目。',
                timestamp: new Date(Date.now() - 86400000 * 18).toISOString()
            },
            {
                id: 'chat_25',
                role: 'user',
                content: '好的,我报名!什么时候可以开始?',
                timestamp: new Date(Date.now() - 86400000 * 17).toISOString()
            },
            {
                id: 'chat_26',
                role: 'assistant',
                content: '完美!我已经为您安排了明天上午10点的首次护理。\n\n请您做好准备:\n1. 来店前做好基础清洁\n2. 避免化浓妆\n3. 如果方便,请素颜到店\n\n首次护理我们会:\n- 详细检测皮肤状态\n- 建立皮肤档案\n- 开始第一次深层补水\n- 教您居家护理方法\n\n期待明天见到您!相信30天后您的皮肤会焕然一新!',
                timestamp: new Date(Date.now() - 86400000 * 17).toISOString()
            }
        ]
    }
];

// 默认订单数据
const DEFAULT_ORDERS = [
    {
        id: 'order_1',
        orgId: 'org_default',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        orderNumber: 'ORD20241128001',
        items: [
            {
                planTemplateId: 'plan_weight_loss_basic',
                planTemplateName: '减重基础方案',
                quantity: 1,
                unitPrice: 3500,
                totalPrice: 3500,
                specs: '90天减重管理服务'
            }
        ],
        totalAmount: 3500,
        discountAmount: 0,
        finalAmount: 3500,
        status: OrderStatus.IN_PROGRESS,
        paymentMethod: '微信支付',
        paymentTime: new Date(Date.now() - 86400000 * 25).toISOString(),
        notes: '客户目标减重10kg,需要严格监督',
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
    },
    {
        id: 'order_2',
        orgId: 'org_default',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        orderNumber: 'ORD20241118001',
        items: [
            {
                planTemplateId: 'plan_skin_care_hydration',
                planTemplateName: '皮肤深层清洁护理',
                quantity: 1,
                unitPrice: 1500,
                totalPrice: 1500,
                specs: '单次服务'
            }
        ],
        totalAmount: 1500,
        discountAmount: 0,
        finalAmount: 1500,
        status: OrderStatus.COMPLETED,
        paymentMethod: '支付宝',
        paymentTime: new Date(Date.now() - 86400000 * 10).toISOString(),
        completedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        notes: '客户反馈效果很好',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        createdBy: 'admin'
    },
    {
        id: 'order_3',
        orgId: 'org_default',
        customerId: 'cust_2',
        customerName: '王美琪',
        orderNumber: 'ORD20241018001',
        items: [
            {
                planTemplateId: 'plan_anti_aging',
                planTemplateName: '抗衰紧致方案',
                quantity: 1,
                unitPrice: 12800,
                totalPrice: 12800,
                specs: '90天抗衰管理'
            }
        ],
        totalAmount: 12800,
        discountAmount: 1280,
        finalAmount: 11520,
        status: OrderStatus.IN_PROGRESS,
        paymentMethod: '微信支付',
        paymentTime: new Date(Date.now() - 86400000 * 40).toISOString(),
        notes: '铂金会员9折优惠',
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
    },
    {
        id: 'order_4',
        orgId: 'org_default',
        customerId: 'cust_3',
        customerName: '李静怡',
        orderNumber: 'ORD20241110001',
        items: [
            {
                planTemplateId: 'plan_skin_care_hydration',
                planTemplateName: '补水保湿护理方案',
                quantity: 1,
                unitPrice: 2800,
                totalPrice: 2800,
                specs: '30天补水方案'
            }
        ],
        totalAmount: 2800,
        discountAmount: 0,
        finalAmount: 2800,
        status: OrderStatus.IN_PROGRESS,
        paymentMethod: '微信支付',
        paymentTime: new Date(Date.now() - 86400000 * 18).toISOString(),
        notes: '客户皮肤干燥,需要加强补水',
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
    }
];

// 默认任务数据
const DEFAULT_TASKS = [
    // 陈爱丽的任务(减重方案)
    {
        id: 'task_1',
        orgId: 'org_default',
        orderId: 'order_1',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        type: 'meal',
        title: '饮食打卡 - 今日',
        description: '记录三餐饮食,拍照上传',
        status: TaskStatus.PENDING,
        frequency: 'daily',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '20:00',
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_2',
        orgId: 'org_default',
        orderId: 'order_1',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        type: 'exercise',
        title: '运动打卡 - 今日',
        description: '完成40分钟有氧运动',
        status: TaskStatus.PENDING,
        frequency: 'daily',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '18:00',
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_3',
        orgId: 'org_default',
        orderId: 'order_1',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        type: 'weight',
        title: '体重记录 - 本周',
        description: '测量体重、体脂率、肌肉量',
        status: TaskStatus.PENDING,
        frequency: 'weekly',
        scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        scheduledTime: '07:00',
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_4',
        orgId: 'org_default',
        orderId: 'order_1',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        type: 'meal',
        title: '饮食打卡 - 昨日',
        description: '记录三餐饮食,拍照上传',
        status: TaskStatus.COMPLETED,
        frequency: 'daily',
        scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        scheduledTime: '20:00',
        completedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 + 3600000).toISOString()
    },
    {
        id: 'task_5',
        orgId: 'org_default',
        orderId: 'order_1',
        customerId: 'cust_1',
        customerName: '陈爱丽',
        type: 'exercise',
        title: '运动打卡 - 昨日',
        description: '完成40分钟有氧运动',
        status: TaskStatus.COMPLETED,
        frequency: 'daily',
        scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        scheduledTime: '18:00',
        completedAt: new Date(Date.now() - 86400000 + 7200000).toISOString(),
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 + 7200000).toISOString()
    },
    // 王美琪的任务(抗衰方案)
    {
        id: 'task_6',
        orgId: 'org_default',
        orderId: 'order_3',
        customerId: 'cust_2',
        customerName: '王美琪',
        type: 'skincare',
        title: '护肤打卡 - 今日',
        description: '早晚使用抗衰精华和面霜,配合提拉按摩',
        status: TaskStatus.PENDING,
        frequency: 'daily',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '21:00',
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_7',
        orgId: 'org_default',
        orderId: 'order_3',
        customerId: 'cust_2',
        customerName: '王美琪',
        type: 'appointment',
        title: '到店护理 - 本周',
        description: '射频紧肤+抗衰按摩',
        status: TaskStatus.PENDING,
        frequency: 'weekly',
        scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        scheduledTime: '15:00',
        reminderEnabled: true,
        location: '良辰古一真上海店',
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_8',
        orgId: 'org_default',
        orderId: 'order_3',
        customerId: 'cust_2',
        customerName: '王美琪',
        type: 'skincare',
        title: '护肤打卡 - 昨日',
        description: '早晚使用抗衰精华和面霜,配合提拉按摩',
        status: TaskStatus.COMPLETED,
        frequency: 'daily',
        scheduledDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        scheduledTime: '21:00',
        completedAt: new Date(Date.now() - 86400000 + 3600000).toISOString(),
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 + 3600000).toISOString()
    },
    // 李静怡的任务(补水方案)
    {
        id: 'task_9',
        orgId: 'org_default',
        orderId: 'order_4',
        customerId: 'cust_3',
        customerName: '李静怡',
        type: 'skincare',
        title: '补水打卡 - 今日',
        description: '使用补水精华液,每周2次补水面膜',
        status: TaskStatus.PENDING,
        frequency: 'daily',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '22:00',
        reminderEnabled: true,
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'task_10',
        orgId: 'org_default',
        orderId: 'order_4',
        customerId: 'cust_3',
        customerName: '李静怡',
        type: 'appointment',
        title: '到店护理 - 本周',
        description: '深层补水护理',
        status: TaskStatus.PENDING,
        frequency: 'weekly',
        scheduledDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        scheduledTime: '10:00',
        reminderEnabled: true,
        location: '良辰古一真上海店',
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        updatedAt: new Date().toISOString()
    }
];

// ==================== 数据库服务对象 ====================

const db = {

    // ==================== 组织管理 ====================

    /**
     * 获取所有组织
     */
    getOrganizations() {
        const orgs = StorageManager.get(STORAGE_KEYS.ORGANIZATIONS, []);
        if (orgs.length === 0) {
            StorageManager.set(STORAGE_KEYS.ORGANIZATIONS, SEED_ORGS);
            return SEED_ORGS;
        }
        return orgs;
    },

    /**
     * 获取当前组织ID
     */
    getCurrentOrgId() {
        const storedId = StorageManager.get(STORAGE_KEYS.CURRENT_ORG_ID);
        if (storedId) return storedId;

        // 回退到第一个组织
        const orgs = this.getOrganizations();
        if (orgs.length > 0) {
            const defaultId = orgs[0].id;
            StorageManager.set(STORAGE_KEYS.CURRENT_ORG_ID, defaultId);
            return defaultId;
        }
        return '';
    },

    /**
     * 获取当前组织
     */
    getCurrentOrg() {
        const id = this.getCurrentOrgId();
        const orgs = this.getOrganizations();
        return orgs.find(o => o.id === id);
    },

    /**
     * 设置当前组织ID
     */
    setCurrentOrgId(id) {
        StorageManager.set(STORAGE_KEYS.CURRENT_ORG_ID, id);
        window.location.reload();
    },

    /**
     * 保存组织
     */
    saveOrganization(org) {
        const orgs = this.getOrganizations();
        const index = orgs.findIndex(o => o.id === org.id);
        if (index >= 0) {
            orgs[index] = org;
        } else {
            orgs.push(org);
        }
        StorageManager.set(STORAGE_KEYS.ORGANIZATIONS, orgs);
    },

    /**
     * 创建组织
     */
    createOrganization(orgData) {
        const newOrg = {
            id: `org_${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...orgData
        };
        this.saveOrganization(newOrg);
        return newOrg;
    },

    /**
     * 删除组织
     */
    deleteOrganization(id) {
        // 删除组织
        let orgs = StorageManager.get(STORAGE_KEYS.ORGANIZATIONS, []);
        orgs = orgs.filter(o => o.id !== id);
        StorageManager.set(STORAGE_KEYS.ORGANIZATIONS, orgs);

        // 删除关联的客户
        let customers = StorageManager.get(STORAGE_KEYS.CUSTOMERS, []);
        customers = customers.filter(c => c.orgId !== id);
        StorageManager.set(STORAGE_KEYS.CUSTOMERS, customers);

        // 删除关联的模板
        let templates = StorageManager.get(STORAGE_KEYS.TEMPLATES, []);
        templates = templates.filter(t => t.orgId !== id);
        StorageManager.set(STORAGE_KEYS.TEMPLATES, templates);

        // 删除关联的案例
        let cases = StorageManager.get(STORAGE_KEYS.CASE_STUDIES, []);
        cases = cases.filter(c => c.orgId !== id);
        StorageManager.set(STORAGE_KEYS.CASE_STUDIES, cases);

        // 删除关联的理念
        let philosophies = StorageManager.get(STORAGE_KEYS.PHILOSOPHIES, []);
        philosophies = philosophies.filter(p => p.orgId !== id);
        StorageManager.set(STORAGE_KEYS.PHILOSOPHIES, philosophies);

        // 处理当前组织ID切换
        if (this.getCurrentOrgId() === id) {
            if (orgs.length > 0) {
                this.setCurrentOrgId(orgs[0].id);
            } else {
                StorageManager.remove(STORAGE_KEYS.CURRENT_ORG_ID);
                window.location.reload();
            }
        }
    },

    // ==================== 模板管理 ====================

    /**
     * 获取模板列表(租户隔离)
     */
    getTemplates() {
        const allTemplates = StorageManager.get(STORAGE_KEYS.TEMPLATES, []);
        const currentOrgId = this.getCurrentOrgId();

        // 初始化默认模板
        if (allTemplates.length === 0) {
            StorageManager.set(STORAGE_KEYS.TEMPLATES, DEFAULT_TEMPLATES);
            return DEFAULT_TEMPLATES.filter(t => t.orgId === currentOrgId);
        }

        // 过滤当前租户的模板
        return allTemplates.filter(t => t.orgId === currentOrgId);
    },

    /**
     * 根据ID获取模板
     */
    getTemplateById(id) {
        const templates = this.getTemplates();
        return templates.find(t => t.id === id);
    },

    /**
     * 根据分类获取模板
     */
    getTemplatesByCategory(category) {
        const templates = this.getTemplates();
        return templates.filter(t => t.category === category);
    },

    /**
     * 保存模板
     */
    saveTemplate(template) {
        const currentOrgId = this.getCurrentOrgId();
        const allTemplates = StorageManager.get(STORAGE_KEYS.TEMPLATES, []);

        // 确保模板属于当前组织
        template.orgId = currentOrgId;

        const existingIndex = allTemplates.findIndex(t => t.id === template.id);
        if (existingIndex >= 0) {
            allTemplates[existingIndex] = template;
        } else {
            allTemplates.push(template);
        }
        StorageManager.set(STORAGE_KEYS.TEMPLATES, allTemplates);
    },

    /**
     * 删除模板
     */
    deleteTemplate(id) {
        let allTemplates = StorageManager.get(STORAGE_KEYS.TEMPLATES, []);
        allTemplates = allTemplates.filter(t => t.id !== id);
        StorageManager.set(STORAGE_KEYS.TEMPLATES, allTemplates);
    },

    // ==================== 客户管理 ====================

    /**
     * 获取客户列表(租户隔离)
     */
    getCustomers() {
        const allCustomers = StorageManager.get(STORAGE_KEYS.CUSTOMERS, []);
        const currentOrgId = this.getCurrentOrgId();

        // 初始化默认客户
        if (allCustomers.length === 0) {
            StorageManager.set(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
            // 同时初始化订单和任务
            StorageManager.set(STORAGE_KEYS.ORDERS, DEFAULT_ORDERS);
            StorageManager.set(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
            return DEFAULT_CUSTOMERS.filter(c => c.orgId === currentOrgId);
        }

        // 过滤当前租户的客户
        return allCustomers.filter(c => c.orgId === currentOrgId);
    },

    /**
     * 根据ID获取客户
     */
    getCustomerById(id) {
        const customers = this.getCustomers();
        return customers.find(c => c.id === id);
    },

    /**
     * 搜索客户
     */
    searchCustomers(keyword) {
        const customers = this.getCustomers();
        if (!keyword) return customers;

        const lowerKeyword = keyword.toLowerCase();
        return customers.filter(c =>
            c.name.toLowerCase().includes(lowerKeyword) ||
            c.phone.includes(keyword)
        );
    },

    /**
     * 保存客户
     */
    saveCustomer(customer) {
        const currentOrgId = this.getCurrentOrgId();
        const allCustomers = StorageManager.get(STORAGE_KEYS.CUSTOMERS, []);

        // 确保客户属于当前组织
        customer.orgId = currentOrgId;

        const existingIndex = allCustomers.findIndex(c => c.id === customer.id);
        if (existingIndex >= 0) {
            allCustomers[existingIndex] = customer;
        } else {
            allCustomers.push(customer);
        }
        StorageManager.set(STORAGE_KEYS.CUSTOMERS, allCustomers);
    },

    /**
     * 删除客户
     */
    deleteCustomer(id) {
        let allCustomers = StorageManager.get(STORAGE_KEYS.CUSTOMERS, []);
        allCustomers = allCustomers.filter(c => c.id !== id);
        StorageManager.set(STORAGE_KEYS.CUSTOMERS, allCustomers);
    },

    /**
     * 添加销售记录
     */
    addSale(customerId, sale) {
        const customer = this.getCustomerById(customerId);
        if (customer) {
            if (!customer.salesHistory) {
                customer.salesHistory = [];
            }
            customer.salesHistory.push(sale);
            this.saveCustomer(customer);
        }
    },

    // ==================== 订单管理 ====================

    /**
     * 获取订单列表
     */
    getOrders() {
        const allOrders = StorageManager.get(STORAGE_KEYS.ORDERS, []);
        return allOrders.filter(o => o.orgId === this.getCurrentOrgId());
    },

    /**
     * 根据ID获取订单
     */
    getOrderById(id) {
        const orders = this.getOrders();
        return orders.find(o => o.id === id);
    },

    /**
     * 根据客户ID获取订单
     */
    getOrdersByCustomerId(customerId) {
        const orders = this.getOrders();
        return orders.filter(o => o.customerId === customerId);
    },

    /**
     * 保存订单
     */
    saveOrder(order) {
        const currentOrgId = this.getCurrentOrgId();
        const allOrders = StorageManager.get(STORAGE_KEYS.ORDERS, []);

        // 确保订单属于当前组织
        order.orgId = currentOrgId;

        const existingIndex = allOrders.findIndex(o => o.id === order.id);
        if (existingIndex >= 0) {
            allOrders[existingIndex] = order;
        } else {
            allOrders.push(order);
        }
        StorageManager.set(STORAGE_KEYS.ORDERS, allOrders);
    },

    /**
     * 删除订单
     */
    deleteOrder(id) {
        let allOrders = StorageManager.get(STORAGE_KEYS.ORDERS, []);
        allOrders = allOrders.filter(o => o.id !== id);
        StorageManager.set(STORAGE_KEYS.ORDERS, allOrders);
    },

    // ==================== 任务管理 ====================

    /**
     * 获取任务列表
     */
    getTasks() {
        const allTasks = StorageManager.get(STORAGE_KEYS.TASKS, []);
        return allTasks.filter(t => t.orgId === this.getCurrentOrgId());
    },

    /**
     * 根据ID获取任务
     */
    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id);
    },

    /**
     * 根据订单ID获取任务
     */
    getTasksByOrderId(orderId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.orderId === orderId);
    },

    /**
     * 根据客户ID获取任务
     */
    getTasksByCustomerId(customerId) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.customerId === customerId);
    },

    /**
     * 根据日期范围获取任务
     */
    getTasksByDateRange(startDate, endDate) {
        const tasks = this.getTasks();
        return tasks.filter(t => t.scheduledDate >= startDate && t.scheduledDate <= endDate);
    },

    /**
     * 保存任务
     */
    saveTask(task) {
        const currentOrgId = this.getCurrentOrgId();
        const allTasks = StorageManager.get(STORAGE_KEYS.TASKS, []);

        // 确保任务属于当前组织
        task.orgId = currentOrgId;

        const existingIndex = allTasks.findIndex(t => t.id === task.id);
        if (existingIndex >= 0) {
            allTasks[existingIndex] = task;
        } else {
            allTasks.push(task);
        }
        StorageManager.set(STORAGE_KEYS.TASKS, allTasks);
    },

    /**
     * 删除任务
     */
    deleteTask(id) {
        let allTasks = StorageManager.get(STORAGE_KEYS.TASKS, []);
        allTasks = allTasks.filter(t => t.id !== id);
        StorageManager.set(STORAGE_KEYS.TASKS, allTasks);
    },

    // ==================== 案例管理 ====================

    /**
     * 获取案例列表
     */
    getCaseStudies() {
        const allCases = StorageManager.get(STORAGE_KEYS.CASE_STUDIES, []);
        return allCases.filter(c => c.orgId === this.getCurrentOrgId());
    },

    /**
     * 根据ID获取案例
     */
    getCaseStudyById(id) {
        const cases = this.getCaseStudies();
        return cases.find(c => c.id === id);
    },

    /**
     * 保存案例
     */
    saveCaseStudy(caseStudy) {
        const currentOrgId = this.getCurrentOrgId();
        const allCases = StorageManager.get(STORAGE_KEYS.CASE_STUDIES, []);

        // 确保案例属于当前组织
        caseStudy.orgId = currentOrgId;

        const existingIndex = allCases.findIndex(c => c.id === caseStudy.id);
        if (existingIndex >= 0) {
            allCases[existingIndex] = caseStudy;
        } else {
            allCases.push(caseStudy);
        }
        StorageManager.set(STORAGE_KEYS.CASE_STUDIES, allCases);
    },

    /**
     * 删除案例
     */
    deleteCaseStudy(id) {
        let allCases = StorageManager.get(STORAGE_KEYS.CASE_STUDIES, []);
        allCases = allCases.filter(c => c.id !== id);
        StorageManager.set(STORAGE_KEYS.CASE_STUDIES, allCases);
    },

    // ==================== 理念管理 ====================

    /**
     * 获取理念列表
     */
    getPhilosophies() {
        const allData = StorageManager.get(STORAGE_KEYS.PHILOSOPHIES, []);
        return allData.filter(p => p.orgId === this.getCurrentOrgId());
    },

    /**
     * 根据ID获取理念
     */
    getPhilosophyById(id) {
        const items = this.getPhilosophies();
        return items.find(p => p.id === id);
    },

    /**
     * 保存理念
     */
    savePhilosophy(item) {
        const currentOrgId = this.getCurrentOrgId();
        const allData = StorageManager.get(STORAGE_KEYS.PHILOSOPHIES, []);

        // 确保理念属于当前组织
        item.orgId = currentOrgId;

        const existingIndex = allData.findIndex(p => p.id === item.id);
        if (existingIndex >= 0) {
            allData[existingIndex] = item;
        } else {
            allData.push(item);
        }
        StorageManager.set(STORAGE_KEYS.PHILOSOPHIES, allData);
    },

    /**
     * 删除理念
     */
    deletePhilosophy(id) {
        let allData = StorageManager.get(STORAGE_KEYS.PHILOSOPHIES, []);
        allData = allData.filter(p => p.id !== id);
        StorageManager.set(STORAGE_KEYS.PHILOSOPHIES, allData);
    },

    // ==================== 加盟商管理 ====================

    /**
     * 获取加盟商列表
     */
    getFranchisees() {
        return StorageManager.get(STORAGE_KEYS.FRANCHISEES, []);
    },

    /**
     * 根据ID获取加盟商
     */
    getFranchiseeById(id) {
        const franchisees = this.getFranchisees();
        return franchisees.find(f => f.id === id);
    },

    /**
     * 保存加盟商
     */
    saveFranchisee(franchisee) {
        const allFranchisees = this.getFranchisees();
        const existingIndex = allFranchisees.findIndex(f => f.id === franchisee.id);

        if (existingIndex >= 0) {
            allFranchisees[existingIndex] = franchisee;
        } else {
            allFranchisees.push(franchisee);
        }

        StorageManager.set(STORAGE_KEYS.FRANCHISEES, allFranchisees);
    },

    /**
     * 删除加盟商
     */
    deleteFranchisee(id) {
        let allFranchisees = this.getFranchisees();
        allFranchisees = allFranchisees.filter(f => f.id !== id);
        StorageManager.set(STORAGE_KEYS.FRANCHISEES, allFranchisees);
    },

    /**
     * 生成加盟商演示数据
     */
    generateFranchiseeDemoData() {
        const demoFranchisees = [
            {
                id: `franchisee_demo_1_${Date.now()}`,
                franchiseeName: '北京·悦己美学加盟店',
                legalPerson: '张明',
                contactPerson: '张明',
                phone: '13800001111',
                email: 'beijing@example.com',
                address: '北京市朝阳区三里屯SOHO 2号楼',
                city: '北京',
                province: '北京市',
                storeArea: 280,
                employeeCount: 12,
                status: 'active',
                contract: {
                    contractNumber: 'FRC-2023-001',
                    signedDate: '2023-01-15',
                    startDate: '2023-02-01',
                    endDate: '2028-01-31',
                    franchiseFee: 500000,
                    royaltyRate: 8,
                    depositAmount: 100000
                },
                performance: [
                    { month: '2025-01', revenue: 450000, customerCount: 85, orderCount: 120, royaltyPaid: 36000 },
                    { month: '2024-12', revenue: 520000, customerCount: 92, orderCount: 135, royaltyPaid: 41600 },
                    { month: '2024-11', revenue: 480000, customerCount: 88, orderCount: 128, royaltyPaid: 38400 },
                    { month: '2024-10', revenue: 465000, customerCount: 82, orderCount: 115, royaltyPaid: 37200 },
                    { month: '2024-09', revenue: 490000, customerCount: 90, orderCount: 130, royaltyPaid: 39200 },
                    { month: '2024-08', revenue: 510000, customerCount: 95, orderCount: 138, royaltyPaid: 40800 }
                ],
                orgId: 'org_branch_bj',
                notes: '表现优秀,客户满意度高',
                createdAt: '2023-01-15T00:00:00.000Z',
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            },
            {
                id: `franchisee_demo_2_${Date.now() + 1}`,
                franchiseeName: '上海·美颜坊加盟店',
                legalPerson: '李华',
                contactPerson: '李华',
                phone: '13800002222',
                email: 'shanghai@example.com',
                address: '上海市浦东新区陆家嘴金融中心',
                city: '上海',
                province: '上海市',
                storeArea: 320,
                employeeCount: 15,
                status: 'active',
                contract: {
                    contractNumber: 'FRC-2023-002',
                    signedDate: '2023-03-20',
                    startDate: '2023-04-01',
                    endDate: '2028-03-31',
                    franchiseFee: 600000,
                    royaltyRate: 8,
                    depositAmount: 120000
                },
                performance: [
                    { month: '2025-01', revenue: 680000, customerCount: 125, orderCount: 180, royaltyPaid: 54400 },
                    { month: '2024-12', revenue: 720000, customerCount: 135, orderCount: 195, royaltyPaid: 57600 },
                    { month: '2024-11', revenue: 650000, customerCount: 118, orderCount: 168, royaltyPaid: 52000 },
                    { month: '2024-10', revenue: 690000, customerCount: 128, orderCount: 175, royaltyPaid: 55200 },
                    { month: '2024-09', revenue: 710000, customerCount: 132, orderCount: 188, royaltyPaid: 56800 },
                    { month: '2024-08', revenue: 670000, customerCount: 122, orderCount: 172, royaltyPaid: 53600 }
                ],
                orgId: `org_shanghai_${Date.now()}`,
                notes: '业绩突出,管理规范',
                createdAt: '2023-03-20T00:00:00.000Z',
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            },
            {
                id: `franchisee_demo_3_${Date.now() + 2}`,
                franchiseeName: '深圳·韵美SPA加盟店',
                legalPerson: '王芳',
                contactPerson: '王芳',
                phone: '13800003333',
                email: 'shenzhen@example.com',
                address: '深圳市福田区CBD中心区',
                city: '深圳',
                province: '广东省',
                storeArea: 350,
                employeeCount: 18,
                status: 'active',
                contract: {
                    contractNumber: 'FRC-2023-003',
                    signedDate: '2023-05-10',
                    startDate: '2023-06-01',
                    endDate: '2028-05-31',
                    franchiseFee: 650000,
                    royaltyRate: 8,
                    depositAmount: 130000
                },
                performance: [
                    { month: '2025-01', revenue: 780000, customerCount: 145, orderCount: 210, royaltyPaid: 62400 },
                    { month: '2024-12', revenue: 820000, customerCount: 155, orderCount: 225, royaltyPaid: 65600 },
                    { month: '2024-11', revenue: 750000, customerCount: 138, orderCount: 198, royaltyPaid: 60000 },
                    { month: '2024-10', revenue: 790000, customerCount: 148, orderCount: 215, royaltyPaid: 63200 },
                    { month: '2024-09', revenue: 810000, customerCount: 152, orderCount: 220, royaltyPaid: 64800 },
                    { month: '2024-08', revenue: 770000, customerCount: 142, orderCount: 205, royaltyPaid: 61600 }
                ],
                orgId: `org_shenzhen_${Date.now()}`,
                notes: '高端客户群体,业绩稳定增长',
                createdAt: '2023-05-10T00:00:00.000Z',
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            },
            {
                id: `franchisee_demo_4_${Date.now() + 3}`,
                franchiseeName: '成都·古韵美业加盟店',
                legalPerson: '赵丽',
                contactPerson: '赵丽',
                phone: '13800004444',
                address: '成都市锦江区春熙路',
                city: '成都',
                province: '四川省',
                storeArea: 220,
                employeeCount: 10,
                status: 'pending',
                contract: {
                    contractNumber: 'FRC-2024-004',
                    signedDate: '2024-11-20',
                    startDate: '2024-12-01',
                    endDate: '2029-11-30',
                    franchiseFee: 450000,
                    royaltyRate: 8,
                    depositAmount: 90000
                },
                performance: [
                    { month: '2025-01', revenue: 180000, customerCount: 42, orderCount: 55, royaltyPaid: 14400 },
                    { month: '2024-12', revenue: 150000, customerCount: 35, orderCount: 48, royaltyPaid: 12000 }
                ],
                orgId: `org_chengdu_${Date.now()}`,
                notes: '新签约加盟商,筹备中',
                createdAt: '2024-11-20T00:00:00.000Z',
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            },
            {
                id: `franchisee_demo_5_${Date.now() + 4}`,
                franchiseeName: '杭州·西湖美颜加盟店',
                legalPerson: '刘静',
                contactPerson: '刘静',
                phone: '13800005555',
                email: 'hangzhou@example.com',
                address: '杭州市西湖区文三路',
                city: '杭州',
                province: '浙江省',
                storeArea: 260,
                employeeCount: 13,
                status: 'suspended',
                contract: {
                    contractNumber: 'FRC-2023-005',
                    signedDate: '2023-07-15',
                    startDate: '2023-08-01',
                    endDate: '2028-07-31',
                    franchiseFee: 520000,
                    royaltyRate: 8,
                    depositAmount: 105000
                },
                performance: [
                    { month: '2025-01', revenue: 280000, customerCount: 58, orderCount: 75, royaltyPaid: 22400 },
                    { month: '2024-12', revenue: 320000, customerCount: 68, orderCount: 88, royaltyPaid: 25600 },
                    { month: '2024-11', revenue: 380000, customerCount: 75, orderCount: 102, royaltyPaid: 30400 },
                    { month: '2024-10', revenue: 410000, customerCount: 82, orderCount: 110, royaltyPaid: 32800 },
                    { month: '2024-09', revenue: 430000, customerCount: 86, orderCount: 118, royaltyPaid: 34400 },
                    { month: '2024-08', revenue: 450000, customerCount: 90, orderCount: 125, royaltyPaid: 36000 }
                ],
                orgId: `org_hangzhou_${Date.now()}`,
                notes: '因人员变动暂停营业,正在整改中',
                createdAt: '2023-07-15T00:00:00.000Z',
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            }
        ];

        demoFranchisees.forEach(franchisee => this.saveFranchisee(franchisee));

        console.log(`成功生成加盟商演示数据:${demoFranchisees.length} 个加盟商`);
        return { franchisees: demoFranchisees.length };
    },

    // ==================== 数据导入导出 ====================

    /**
     * 导出数据
     */
    exportData() {
        return JSON.stringify({
            organization: this.getCurrentOrg(),
            templates: this.getTemplates(),
            customers: this.getCustomers(),
            orders: this.getOrders(),
            tasks: this.getTasks(),
            caseStudies: this.getCaseStudies(),
            philosophies: this.getPhilosophies(),
            exportDate: new Date().toISOString()
        }, null, 2);
    },

    /**
     * 导入数据
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            const currentOrgId = this.getCurrentOrgId();

            // 导入模板
            if (data.templates && Array.isArray(data.templates)) {
                data.templates.forEach(template => {
                    template.orgId = currentOrgId;
                    template.id = `tpl_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    this.saveTemplate(template);
                });
            }

            // 导入客户
            if (data.customers && Array.isArray(data.customers)) {
                data.customers.forEach(customer => {
                    customer.orgId = currentOrgId;
                    customer.id = `cust_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    this.saveCustomer(customer);
                });
            }

            // 导入订单
            if (data.orders && Array.isArray(data.orders)) {
                data.orders.forEach(order => {
                    order.orgId = currentOrgId;
                    order.id = `order_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    this.saveOrder(order);
                });
            }

            // 导入任务
            if (data.tasks && Array.isArray(data.tasks)) {
                data.tasks.forEach(task => {
                    task.orgId = currentOrgId;
                    task.id = `task_imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    this.saveTask(task);
                });
            }

            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    },

    /**
     * 清空当前组织的所有数据
     */
    clearCurrentOrgData() {
        const currentOrgId = this.getCurrentOrgId();

        // 清空客户
        let allCustomers = StorageManager.get(STORAGE_KEYS.CUSTOMERS, []);
        allCustomers = allCustomers.filter(c => c.orgId !== currentOrgId);
        StorageManager.set(STORAGE_KEYS.CUSTOMERS, allCustomers);

        // 清空订单
        let allOrders = StorageManager.get(STORAGE_KEYS.ORDERS, []);
        allOrders = allOrders.filter(o => o.orgId !== currentOrgId);
        StorageManager.set(STORAGE_KEYS.ORDERS, allOrders);

        // 清空任务
        let allTasks = StorageManager.get(STORAGE_KEYS.TASKS, []);
        allTasks = allTasks.filter(t => t.orgId !== currentOrgId);
        StorageManager.set(STORAGE_KEYS.TASKS, allTasks);

        // 清空案例
        let allCases = StorageManager.get(STORAGE_KEYS.CASE_STUDIES, []);
        allCases = allCases.filter(c => c.orgId !== currentOrgId);
        StorageManager.set(STORAGE_KEYS.CASE_STUDIES, allCases);

        // 清空理念
        let allPhilosophies = StorageManager.get(STORAGE_KEYS.PHILOSOPHIES, []);
        allPhilosophies = allPhilosophies.filter(p => p.orgId !== currentOrgId);
        StorageManager.set(STORAGE_KEYS.PHILOSOPHIES, allPhilosophies);
    },

    // ==================== 演示数据生成 ====================

    /**
     * 生成演示客户数据
     */
    generateDemoCustomers(count = 5) {
        const currentOrgId = this.getCurrentOrgId();
        const names = ['张小姐', '王女士', '李小姐', '赵女士', '刘小姐', '陈女士', '杨小姐', '周女士'];
        const sources = ['自然到店', '朋友介绍', '线上广告', '短视频平台', '公众号', '线下活动'];

        for (let i = 0; i < count; i++) {
            const customer = {
                id: `cust_demo_${Date.now()}_${i}`,
                orgId: currentOrgId,
                name: names[Math.floor(Math.random() * names.length)],
                phone: `138${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
                createdAt: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
                data: {
                    'tpl_basic_info': {
                        'gender': '女',
                        'age': Math.floor(Math.random() * 30) + 20,
                        'customer_source': sources[Math.floor(Math.random() * sources.length)],
                        'vip_level': ['普通会员', '银卡会员', '金卡会员'][Math.floor(Math.random() * 3)]
                    }
                },
                salesHistory: [],
                chatHistory: []
            };

            this.saveCustomer(customer);
        }

        console.log(`成功生成 ${count} 个演示客户`);
    },

    /**
     * 生成完整演示数据(订单+任务)
     */
    generateFullDemoData() {
        const customers = this.getCustomers();
        if (customers.length === 0) {
            console.error('请先创建客户数据');
            return { success: false, message: '没有客户数据' };
        }

        const currentOrgId = this.getCurrentOrgId();
        let orderCount = 0;
        let taskCount = 0;

        // 为前3个客户生成订单和任务
        const demoCustomers = customers.slice(0, Math.min(3, customers.length));

        demoCustomers.forEach((customer, index) => {
            // 创建订单
            const order = {
                id: `order_demo_${Date.now()}_${index}`,
                orgId: currentOrgId,
                customerId: customer.id,
                customerName: customer.name,
                orderNumber: `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                items: [
                    {
                        planTemplateId: 'plan_weight_loss_basic',
                        planTemplateName: '减重基础方案',
                        quantity: 1,
                        unitPrice: 3500,
                        totalPrice: 3500
                    }
                ],
                totalAmount: 3500,
                discountAmount: 0,
                finalAmount: 3500,
                status: OrderStatus.IN_PROGRESS,
                paymentMethod: '微信支付',
                paymentTime: new Date().toISOString(),
                notes: `演示订单 - ${customer.name}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin'
            };

            this.saveOrder(order);
            orderCount++;

            // 为订单创建任务
            const today = new Date();
            for (let day = 0; day < 7; day++) {
                const taskDate = new Date(today);
                taskDate.setDate(taskDate.getDate() + day);

                // 每天3个任务: 饮食、运动、体重
                const tasks = [
                    {
                        id: `task_meal_${order.id}_${day}`,
                        orgId: currentOrgId,
                        orderId: order.id,
                        customerId: customer.id,
                        customerName: customer.name,
                        type: 'meal',
                        title: `饮食打卡 - 第${day + 1}天`,
                        description: '记录三餐饮食',
                        status: day === 0 ? TaskStatus.IN_PROGRESS : TaskStatus.PENDING,
                        frequency: 'daily',
                        scheduledDate: taskDate.toISOString().split('T')[0],
                        scheduledTime: '20:00',
                        reminderEnabled: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    {
                        id: `task_exercise_${order.id}_${day}`,
                        orgId: currentOrgId,
                        orderId: order.id,
                        customerId: customer.id,
                        customerName: customer.name,
                        type: 'exercise',
                        title: `运动打卡 - 第${day + 1}天`,
                        description: '完成有氧运动30分钟',
                        status: TaskStatus.PENDING,
                        frequency: 'daily',
                        scheduledDate: taskDate.toISOString().split('T')[0],
                        scheduledTime: '18:00',
                        reminderEnabled: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];

                // 每周一次体重记录
                if (day % 7 === 0) {
                    tasks.push({
                        id: `task_weight_${order.id}_${day}`,
                        orgId: currentOrgId,
                        orderId: order.id,
                        customerId: customer.id,
                        customerName: customer.name,
                        type: 'weight',
                        title: `体重记录 - 第${day + 1}天`,
                        description: '测量体重和体脂率',
                        status: TaskStatus.PENDING,
                        frequency: 'weekly',
                        scheduledDate: taskDate.toISOString().split('T')[0],
                        scheduledTime: '07:00',
                        reminderEnabled: true,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    });
                }

                tasks.forEach(task => {
                    this.saveTask(task);
                    taskCount++;
                });
            }
        });

        console.log(`成功生成演示数据: ${orderCount} 个订单, ${taskCount} 个任务`);
        return {
            success: true,
            orders: orderCount,
            tasks: taskCount
        };
    }
};

// ==================== 导出到全局 ====================

window.db = db;
window.FieldType = FieldType;
window.TemplateCategory = TemplateCategory;
window.OrderStatus = OrderStatus;
window.TaskStatus = TaskStatus;

console.log('数据服务模块已加载');
