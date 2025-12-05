-- 修复 customer_cases 表的 customer_id 字段
-- 将 customer_id 从 NOT NULL 改为允许 NULL
-- 这样可以支持不关联具体客户的独立案例

-- 执行前请确保：
-- 1. 已备份数据库
-- 2. 服务器已停止或处于维护模式

USE beautydb;

-- 修改 customer_id 字段为允许 NULL
ALTER TABLE `customer_cases`
MODIFY COLUMN `customer_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '客户ID（可选）';

-- 验证修改结果
DESC customer_cases;

-- 测试：插入一条没有 customer_id 的记录
-- INSERT INTO customer_cases (org_id, case_title, case_type, created_by)
-- VALUES (1, '测试案例', 'skin_care', 1);

SELECT '✅ customer_cases 表修改完成！customer_id 现在可以为 NULL' AS message;
