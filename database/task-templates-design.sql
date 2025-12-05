-- ============================================
-- 任务模板表设计方案
-- 用途：标准化常见业务任务流程，提高工作效率
-- ============================================

-- 方案说明：
-- 1. 支持定义标准化的任务流程模板
-- 2. 包含任务步骤、检查项、时间规划等
-- 3. 支持全局模板和机构专属模板
-- 4. 可配置任务类型、优先级、责任人角色等

DROP TABLE IF EXISTS `task_templates`;
CREATE TABLE `task_templates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
    `template_code` VARCHAR(50) NOT NULL COMMENT '模板编码',
    `template_name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `description` TEXT DEFAULT NULL COMMENT '模板描述',

    -- 所属范围
    `org_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID（NULL表示全局模板）',
    `scope` ENUM('global', 'org', 'private') NOT NULL DEFAULT 'org' COMMENT '共享范围',

    -- 任务分类
    `category` ENUM('customer_follow_up', 'service_process', 'quality_check', 'inventory', 'training', 'other') NOT NULL DEFAULT 'other' COMMENT '任务分类',

    -- 任务基本信息
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium' COMMENT '默认优先级',
    `estimated_duration` INT UNSIGNED DEFAULT NULL COMMENT '预计时长（分钟）',
    `assigned_role` VARCHAR(50) DEFAULT NULL COMMENT '默认指派角色',

    -- 任务步骤配置（核心JSON字段）
    `steps` JSON NOT NULL COMMENT '任务步骤定义（JSON数组）',
    /*
    步骤定义示例：
    [
        {
            "step_order": 1,
            "step_name": "客户信息确认",
            "step_type": "checklist",  // action, checklist, approval, document
            "required": true,
            "description": "核对客户基础信息和预约详情",
            "checklist_items": [
                "确认客户姓名和联系方式",
                "核对预约时间和项目",
                "查看客户历史记录"
            ],
            "estimated_minutes": 5,
            "notes": ""
        },
        {
            "step_order": 2,
            "step_name": "服务准备",
            "step_type": "action",
            "required": true,
            "description": "准备服务所需的物品和环境",
            "checklist_items": [
                "清洁服务区域",
                "准备产品和工具",
                "调试设备"
            ],
            "estimated_minutes": 10,
            "notes": "注意检查产品保质期"
        }
    ]
    */

    -- 提醒配置
    `reminder_config` JSON DEFAULT NULL COMMENT '提醒配置',
    /*
    提醒配置示例：
    {
        "enable_reminder": true,
        "reminder_before_minutes": 30,
        "reminder_message": "您有一个待处理的任务即将到期"
    }
    */

    -- 标签和关键词
    `tags` JSON DEFAULT NULL COMMENT '标签（用于搜索和分类）',

    -- 版本管理
    `version` VARCHAR(20) DEFAULT '1.0' COMMENT '模板版本号',
    `is_default` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否默认模板',

    -- 使用统计
    `usage_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '使用次数',

    -- 状态
    `status` ENUM('active', 'inactive', 'draft') NOT NULL DEFAULT 'active' COMMENT '状态',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    UNIQUE KEY `uk_org_code` (`org_id`, `template_code`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_scope` (`scope`),
    INDEX `idx_category` (`category`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表';

-- ============================================
-- 初始化默认模板
-- ============================================

-- 1. 客户跟进任务模板
INSERT INTO `task_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `category`,
    `priority`,
    `estimated_duration`,
    `assigned_role`,
    `steps`,
    `reminder_config`,
    `tags`,
    `is_default`,
    `status`
) VALUES (
    'CUSTOMER_FOLLOW_UP',
    '客户跟进标准流程',
    '用于定期跟进客户，了解满意度和需求',
    NULL,
    'global',
    'customer_follow_up',
    'medium',
    20,
    '客户顾问',
    JSON_ARRAY(
        JSON_OBJECT(
            'step_order', 1,
            'step_name', '查看客户档案',
            'step_type', 'action',
            'required', true,
            'description', '了解客户基本信息和历史记录',
            'checklist_items', JSON_ARRAY(
                '查看客户基本信息',
                '查看消费记录',
                '查看上次服务反馈'
            ),
            'estimated_minutes', 5
        ),
        JSON_OBJECT(
            'step_order', 2,
            'step_name', '电话/微信联系',
            'step_type', 'action',
            'required', true,
            'description', '主动联系客户进行沟通',
            'checklist_items', JSON_ARRAY(
                '询问最近皮肤状况',
                '了解产品使用情况',
                '收集意见和建议'
            ),
            'estimated_minutes', 10
        ),
        JSON_OBJECT(
            'step_order', 3,
            'step_name', '记录跟进结果',
            'step_type', 'checklist',
            'required', true,
            'description', '详细记录本次跟进的内容和结果',
            'checklist_items', JSON_ARRAY(
                '更新客户状态',
                '记录沟通内容',
                '设置下次跟进时间',
                '标注特殊需求'
            ),
            'estimated_minutes', 5
        )
    ),
    JSON_OBJECT(
        'enable_reminder', true,
        'reminder_before_minutes', 30,
        'reminder_message', '您有一个客户跟进任务需要处理'
    ),
    JSON_ARRAY('客户服务', '跟进', '回访'),
    1,
    'active'
);

-- 2. 新客接待流程模板
INSERT INTO `task_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `category`,
    `priority`,
    `estimated_duration`,
    `assigned_role`,
    `steps`,
    `tags`,
    `is_default`,
    `status`
) VALUES (
    'NEW_CUSTOMER_RECEPTION',
    '新客到店接待流程',
    '新客户首次到店的标准接待流程',
    NULL,
    'global',
    'service_process',
    'high',
    45,
    '前台接待',
    JSON_ARRAY(
        JSON_OBJECT(
            'step_order', 1,
            'step_name', '热情迎接',
            'step_type', 'checklist',
            'required', true,
            'description', '提供专业友好的第一印象',
            'checklist_items', JSON_ARRAY(
                '微笑问候并自我介绍',
                '引导客户入座',
                '提供茶水或饮料',
                '介绍店内环境'
            ),
            'estimated_minutes', 5
        ),
        JSON_OBJECT(
            'step_order', 2,
            'step_name', '信息登记',
            'step_type', 'action',
            'required', true,
            'description', '完成客户基础信息采集',
            'checklist_items', JSON_ARRAY(
                '填写客户基本资料',
                '拍摄皮肤照片存档',
                '填写客户资料模板',
                '说明会员权益'
            ),
            'estimated_minutes', 15
        ),
        JSON_OBJECT(
            'step_order', 3,
            'step_name', '皮肤诊断',
            'step_type', 'action',
            'required', true,
            'description', '专业美容师进行皮肤分析',
            'checklist_items', JSON_ARRAY(
                '使用仪器检测皮肤',
                '询问皮肤问题和需求',
                '分析皮肤状况',
                '建议护理方案'
            ),
            'estimated_minutes', 15
        ),
        JSON_OBJECT(
            'step_order', 4,
            'step_name', '方案介绍',
            'step_type', 'action',
            'required', true,
            'description', '详细介绍推荐的护理方案',
            'checklist_items', JSON_ARRAY(
                '展示方案内容和效果',
                '说明产品和疗程',
                '介绍价格和优惠',
                '解答客户疑问'
            ),
            'estimated_minutes', 10
        )
    ),
    JSON_ARRAY('新客', '接待', '服务流程'),
    0,
    'active'
);

-- 3. 服务质量检查模板
INSERT INTO `task_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `category`,
    `priority`,
    `estimated_duration`,
    `assigned_role`,
    `steps`,
    `tags`,
    `is_default`,
    `status`
) VALUES (
    'SERVICE_QUALITY_CHECK',
    '服务质量日常检查',
    '每日服务质量标准检查清单',
    NULL,
    'global',
    'quality_check',
    'medium',
    30,
    '店长',
    JSON_ARRAY(
        JSON_OBJECT(
            'step_order', 1,
            'step_name', '环境卫生检查',
            'step_type', 'checklist',
            'required', true,
            'description', '检查店内各区域卫生状况',
            'checklist_items', JSON_ARRAY(
                '前台接待区整洁',
                '服务间清洁消毒',
                '产品陈列整齐',
                '洗手间干净无异味',
                '公共区域地面清洁'
            ),
            'estimated_minutes', 10
        ),
        JSON_OBJECT(
            'step_order', 2,
            'step_name', '设备物料检查',
            'step_type', 'checklist',
            'required', true,
            'description', '确保设备正常和物料充足',
            'checklist_items', JSON_ARRAY(
                '美容仪器运行正常',
                '一次性用品充足',
                '产品库存充足',
                '毛巾床单干净',
                '消毒用品齐全'
            ),
            'estimated_minutes', 10
        ),
        JSON_OBJECT(
            'step_order', 3,
            'step_name', '服务规范检查',
            'step_type', 'checklist',
            'required', true,
            'description', '检查员工服务标准执行情况',
            'checklist_items', JSON_ARRAY(
                '员工仪容仪表',
                '服务态度友好',
                '操作流程规范',
                '客户资料完整',
                '预约管理有序'
            ),
            'estimated_minutes', 10
        )
    ),
    JSON_ARRAY('质检', '日常管理', '标准'),
    0,
    'active'
);

-- 4. 库存盘点模板
INSERT INTO `task_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `category`,
    `priority`,
    `estimated_duration`,
    `assigned_role`,
    `steps`,
    `tags`,
    `is_default`,
    `status`
) VALUES (
    'INVENTORY_CHECK',
    '产品库存月度盘点',
    '每月进行一次全面的产品库存盘点',
    NULL,
    'global',
    'inventory',
    'high',
    60,
    '库管',
    JSON_ARRAY(
        JSON_OBJECT(
            'step_order', 1,
            'step_name', '盘点准备',
            'step_type', 'checklist',
            'required', true,
            'description', '准备盘点所需的工具和表格',
            'checklist_items', JSON_ARRAY(
                '打印库存明细表',
                '准备盘点工具',
                '暂停出入库操作',
                '通知相关人员'
            ),
            'estimated_minutes', 10
        ),
        JSON_OBJECT(
            'step_order', 2,
            'step_name', '实物盘点',
            'step_type', 'action',
            'required', true,
            'description', '逐项清点实际库存数量',
            'checklist_items', JSON_ARRAY(
                '按分类盘点护肤品',
                '盘点美容仪器',
                '盘点一次性耗材',
                '检查产品保质期',
                '记录盘点结果'
            ),
            'estimated_minutes', 40
        ),
        JSON_OBJECT(
            'step_order', 3,
            'step_name', '差异处理',
            'step_type', 'action',
            'required', true,
            'description', '核对并处理盘点差异',
            'checklist_items', JSON_ARRAY(
                '对比账面和实物',
                '查找差异原因',
                '填写盘盈盘亏单',
                '更新库存系统',
                '提交审批'
            ),
            'estimated_minutes', 10
        )
    ),
    JSON_ARRAY('库存', '盘点', '月度'),
    0,
    'active'
);

-- 5. 员工培训模板
INSERT INTO `task_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `category`,
    `priority`,
    `estimated_duration`,
    `assigned_role`,
    `steps`,
    `tags`,
    `is_default`,
    `status`
) VALUES (
    'EMPLOYEE_TRAINING',
    '新员工入职培训',
    '新员工入职第一周的培训计划',
    NULL,
    'global',
    'training',
    'high',
    480,
    '培训主管',
    JSON_ARRAY(
        JSON_OBJECT(
            'step_order', 1,
            'step_name', '企业文化培训',
            'step_type', 'action',
            'required', true,
            'description', '介绍公司历史、文化和价值观',
            'checklist_items', JSON_ARRAY(
                '公司发展历程',
                '企业文化和价值观',
                '组织架构介绍',
                '规章制度讲解'
            ),
            'estimated_minutes', 120
        ),
        JSON_OBJECT(
            'step_order', 2,
            'step_name', '专业技能培训',
            'step_type', 'action',
            'required', true,
            'description', '美容专业知识和技能培训',
            'checklist_items', JSON_ARRAY(
                '皮肤学基础知识',
                '产品知识培训',
                '服务流程学习',
                '仪器操作培训',
                '实操练习'
            ),
            'estimated_minutes', 240
        ),
        JSON_OBJECT(
            'step_order', 3,
            'step_name', '客户服务培训',
            'step_type', 'action',
            'required', true,
            'description', '客户服务技巧和沟通技能',
            'checklist_items', JSON_ARRAY(
                '服务礼仪培训',
                '沟通技巧训练',
                '投诉处理方法',
                '销售技巧培训'
            ),
            'estimated_minutes', 120
        )
    ),
    JSON_ARRAY('培训', '新员工', '入职'),
    0,
    'active'
);

-- ============================================
-- 使用说明
-- ============================================

/*
使用方式：

1. 在 tasks 表中关联模板：
   ALTER TABLE tasks ADD COLUMN `template_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用的任务模板ID';

2. 创建任务时可以基于模板：
   - 用户选择一个模板
   - 系统根据模板的 steps 自动生成任务步骤
   - 用户可以在此基础上修改

3. 模板管理：
   - 机构管理员可以创建专属模板
   - 可以基于全局模板复制后修改
   - 支持模板版本管理

4. 统计分析：
   - 记录每个模板的使用次数
   - 分析哪些模板最受欢迎
   - 优化和改进模板内容
*/
