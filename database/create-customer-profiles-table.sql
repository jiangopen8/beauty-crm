-- 客户详细资料表
-- 用于存储基于模板的客户详细信息
-- 关联 customer_profile_templates 表，实现动态字段存储

CREATE TABLE IF NOT EXISTS customer_profiles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '资料ID',

    -- 关联信息
    customer_id BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    template_id BIGINT UNSIGNED NOT NULL COMMENT '使用的模板ID',
    org_id BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    -- 详细资料（JSON格式存储）
    profile_data JSON NOT NULL COMMENT '详细资料数据（根据模板字段定义存储）',
    /*
    profile_data 结构示例：
    {
        "skin_type": "干性",
        "skin_problems": ["痘痘", "色斑"],
        "allergies": "花粉过敏",
        "preferences": ["美白", "补水"],
        "custom_field_1": "value1",
        ...
    }
    */

    -- 模板版本（用于跟踪模板变更）
    template_version VARCHAR(20) DEFAULT '1.0' COMMENT '模板版本号',

    -- 状态
    status ENUM('active', 'inactive', 'archived') NOT NULL DEFAULT 'active' COMMENT '状态',

    -- 备注
    remark TEXT DEFAULT NULL COMMENT '备注说明',

    -- 审计字段
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    updated_by BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    is_deleted TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否, 1-是',

    -- 索引
    UNIQUE KEY uk_customer_template (customer_id, template_id, is_deleted) COMMENT '客户+模板唯一索引',
    INDEX idx_customer_id (customer_id),
    INDEX idx_template_id (template_id),
    INDEX idx_org_id (org_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),

    -- 外键约束
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES customer_profile_templates(id) ON DELETE RESTRICT,
    FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE RESTRICT

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户详细资料表（基于模板）';

-- 插入示例数据说明
/*
假设我们有一个模板ID为1，包含以下字段：
- skin_type (肤质类型): select
- skin_problems (皮肤问题): checkbox
- allergies (过敏源): text
- preferences (护理偏好): checkbox

那么插入数据时：
INSERT INTO customer_profiles (customer_id, template_id, org_id, profile_data, created_by)
VALUES (
    123,  -- 客户ID
    1,    -- 模板ID
    1,    -- 机构ID
    JSON_OBJECT(
        'skin_type', '干性',
        'skin_problems', JSON_ARRAY('痘痘', '色斑'),
        'allergies', '花粉过敏',
        'preferences', JSON_ARRAY('美白', '补水')
    ),
    1     -- 创建人ID
);

查询时可以使用JSON函数：
SELECT
    c.name AS customer_name,
    cp.profile_data->>'$.skin_type' AS skin_type,
    cp.profile_data->>'$.allergies' AS allergies
FROM customer_profiles cp
JOIN customers c ON cp.customer_id = c.id
WHERE cp.customer_id = 123;
*/
