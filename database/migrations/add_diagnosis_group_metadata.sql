-- 诊断组元数据字段迁移
-- 为 customer_diagnosis_groups 表添加 group_name 和 group_description 字段
-- 作者: Claude Code
-- 日期: 2025-12-16

-- 添加诊断组名称字段（可选）
ALTER TABLE customer_diagnosis_groups
ADD COLUMN IF NOT EXISTS group_name VARCHAR(255) DEFAULT NULL COMMENT '诊断组名称';

-- 添加诊断组描述字段（可选）
ALTER TABLE customer_diagnosis_groups
ADD COLUMN IF NOT EXISTS group_description TEXT DEFAULT NULL COMMENT '诊断组描述';

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_group_name ON customer_diagnosis_groups(group_name);

-- 验证迁移
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'customer_diagnosis_groups'
  AND COLUMN_NAME IN ('group_name', 'group_description');
