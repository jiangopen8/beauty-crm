-- ============================================
-- 客户资料模板表设计方案
-- 用途：灵活配置不同机构的客户信息采集字段
-- ============================================

-- 方案说明：
-- 1. 支持自定义客户信息字段
-- 2. 通过JSON存储字段定义，实现灵活扩展
-- 3. 支持全局模板和机构专属模板
-- 4. 可配置必填项、字段类型、验证规则等

DROP TABLE IF EXISTS `customer_profile_templates`;
CREATE TABLE `customer_profile_templates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
    `template_code` VARCHAR(50) NOT NULL COMMENT '模板编码',
    `template_name` VARCHAR(100) NOT NULL COMMENT '模板名称',
    `description` TEXT DEFAULT NULL COMMENT '模板描述',

    -- 所属范围
    `org_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID（NULL表示全局模板）',
    `scope` ENUM('global', 'org', 'private') NOT NULL DEFAULT 'org' COMMENT '共享范围',

    -- 适用场景
    `apply_scene` ENUM('all', 'new_customer', 'vip_customer', 'online_register', 'other') NOT NULL DEFAULT 'all' COMMENT '适用场景',

    -- 字段配置（核心JSON字段）
    `fields` JSON NOT NULL COMMENT '字段定义（JSON数组）',
    /*
    字段定义示例：
    [
        {
            "field_key": "skin_type",
            "field_name": "肤质类型",
            "field_type": "select",  // text, textarea, number, select, radio, checkbox, date, file
            "required": true,
            "options": ["干性", "油性", "混合性", "敏感性", "中性"],
            "default_value": "",
            "placeholder": "请选择肤质类型",
            "validation": {
                "min": null,
                "max": null,
                "pattern": null
            },
            "display_order": 1,
            "group": "皮肤信息",
            "help_text": "帮助您制定更精准的护理方案"
        },
        {
            "field_key": "allergies",
            "field_name": "过敏史",
            "field_type": "textarea",
            "required": false,
            "options": [],
            "default_value": "",
            "placeholder": "请详细描述您的过敏情况",
            "validation": {
                "maxLength": 500
            },
            "display_order": 2,
            "group": "健康信息",
            "help_text": "包括药物过敏、食物过敏、化妆品过敏等"
        },
        {
            "field_key": "preferred_time",
            "field_name": "偏好服务时间",
            "field_type": "checkbox",
            "required": false,
            "options": ["工作日上午", "工作日下午", "工作日晚上", "周末全天"],
            "default_value": [],
            "display_order": 3,
            "group": "偏好设置"
        }
    ]
    */

    -- 分组配置
    `field_groups` JSON DEFAULT NULL COMMENT '字段分组配置',
    /*
    分组配置示例：
    [
        {"group_name": "基础信息", "display_order": 1},
        {"group_name": "皮肤信息", "display_order": 2},
        {"group_name": "健康信息", "display_order": 3},
        {"group_name": "偏好设置", "display_order": 4}
    ]
    */

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
    INDEX `idx_status` (`status`),
    INDEX `idx_apply_scene` (`apply_scene`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户资料模板表';

-- ============================================
-- 初始化默认模板
-- ============================================

-- 1. 全局默认模板 - 基础版
INSERT INTO `customer_profile_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `apply_scene`,
    `fields`,
    `field_groups`,
    `is_default`,
    `status`
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
            'field_key', 'medical_history',
            'field_name', '既往病史',
            'field_type', 'textarea',
            'required', false,
            'default_value', '',
            'placeholder', '请填写重要病史（如高血压、糖尿病等）',
            'display_order', 4,
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
            'display_order', 5,
            'group', '偏好设置'
        ),
        JSON_OBJECT(
            'field_key', 'occupation',
            'field_name', '职业',
            'field_type', 'text',
            'required', false,
            'default_value', '',
            'placeholder', '请填写职业',
            'display_order', 6,
            'group', '基础信息'
        )
    ),
    JSON_ARRAY(
        JSON_OBJECT('group_name', '基础信息', 'display_order', 1),
        JSON_OBJECT('group_name', '皮肤信息', 'display_order', 2),
        JSON_OBJECT('group_name', '健康信息', 'display_order', 3),
        JSON_OBJECT('group_name', '偏好设置', 'display_order', 4)
    ),
    1,  -- is_default
    'active'
);

-- 2. 高端店模板 - 专业版
INSERT INTO `customer_profile_templates` (
    `template_code`,
    `template_name`,
    `description`,
    `org_id`,
    `scope`,
    `apply_scene`,
    `fields`,
    `field_groups`,
    `is_default`,
    `status`
) VALUES (
    'PREMIUM_PROFESSIONAL',
    '客户资料模板（专业版）',
    '适用于高端美业门店，包含更详细的皮肤分析字段',
    NULL,
    'global',
    'vip_customer',
    JSON_ARRAY(
        JSON_OBJECT(
            'field_key', 'skin_type',
            'field_name', '肤质类型',
            'field_type', 'select',
            'required', true,
            'options', JSON_ARRAY('干性', '油性', '混合性', '敏感性', '中性'),
            'display_order', 1,
            'group', '皮肤诊断'
        ),
        JSON_OBJECT(
            'field_key', 'skin_problems',
            'field_name', '主要皮肤问题',
            'field_type', 'checkbox',
            'required', true,
            'options', JSON_ARRAY('痘痘', '斑点', '皱纹', '松弛', '毛孔粗大', '暗沉', '红血丝', '黑眼圈', '眼袋'),
            'default_value', JSON_ARRAY(),
            'display_order', 2,
            'group', '皮肤诊断'
        ),
        JSON_OBJECT(
            'field_key', 'skin_ph',
            'field_name', '皮肤pH值',
            'field_type', 'number',
            'required', false,
            'placeholder', '4.5-6.5',
            'display_order', 3,
            'group', '皮肤诊断',
            'validation', JSON_OBJECT('min', 0, 'max', 14, 'step', 0.1)
        ),
        JSON_OBJECT(
            'field_key', 'moisture_level',
            'field_name', '皮肤含水量（%）',
            'field_type', 'number',
            'required', false,
            'placeholder', '0-100',
            'display_order', 4,
            'group', '皮肤诊断',
            'validation', JSON_OBJECT('min', 0, 'max', 100)
        ),
        JSON_OBJECT(
            'field_key', 'oil_level',
            'field_name', '皮肤含油量（%）',
            'field_type', 'number',
            'required', false,
            'placeholder', '0-100',
            'display_order', 5,
            'group', '皮肤诊断',
            'validation', JSON_OBJECT('min', 0, 'max', 100)
        ),
        JSON_OBJECT(
            'field_key', 'lifestyle',
            'field_name', '生活习惯',
            'field_type', 'checkbox',
            'required', false,
            'options', JSON_ARRAY('经常熬夜', '长期对电脑', '户外工作', '经常化妆', '定期运动', '饮食规律'),
            'default_value', JSON_ARRAY(),
            'display_order', 6,
            'group', '生活方式'
        ),
        JSON_OBJECT(
            'field_key', 'current_skincare',
            'field_name', '当前使用的护肤品牌',
            'field_type', 'textarea',
            'required', false,
            'placeholder', '请列举正在使用的护肤品牌和产品',
            'display_order', 7,
            'group', '护肤习惯',
            'validation', JSON_OBJECT('maxLength', 500)
        )
    ),
    JSON_ARRAY(
        JSON_OBJECT('group_name', '皮肤诊断', 'display_order', 1),
        JSON_OBJECT('group_name', '生活方式', 'display_order', 2),
        JSON_OBJECT('group_name', '护肤习惯', 'display_order', 3),
        JSON_OBJECT('group_name', '健康信息', 'display_order', 4)
    ),
    0,  -- is_default
    'active'
);

-- ============================================
-- 使用说明
-- ============================================

/*
使用方式：

1. 在 customers 表中添加字段关联模板：
   ALTER TABLE customers ADD COLUMN `profile_template_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '使用的资料模板ID';
   ALTER TABLE customers ADD COLUMN `profile_data` JSON DEFAULT NULL COMMENT '自定义字段数据';

2. profile_data 存储示例：
   {
       "skin_type": "混合性",
       "skin_problems": ["毛孔粗大", "暗沉"],
       "allergies": "对酒精过敏",
       "preferred_time": ["工作日晚上", "周末全天"],
       "occupation": "白领",
       "skin_ph": 5.5,
       "moisture_level": 45
   }

3. 前端渲染：
   - 根据 profile_template_id 获取模板的 fields 配置
   - 动态渲染表单字段
   - 提交时将数据存入 profile_data JSON字段

4. 灵活扩展：
   - 机构管理员可以创建自己的专属模板
   - 可以基于全局模板复制后修改
   - 支持模板版本管理
*/
