-- ============================================
-- 美业客户洞察CRM系统 - 数据库初始化脚本
-- 数据库: MySQL 8.0
-- 字符集: utf8mb4
-- 创建时间: 2025-12-01
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `beauty_crm`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `beauty_crm`;

-- ============================================
-- 1. 组织机构相关表
-- ============================================

-- 1.1 机构表
DROP TABLE IF EXISTS `organizations`;
CREATE TABLE `organizations` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '机构ID',
    `org_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '机构编码',
    `org_name` VARCHAR(100) NOT NULL COMMENT '机构名称',
    `org_type` ENUM('platform', 'franchisee', 'store') NOT NULL COMMENT '机构类型：platform-总部, franchisee-加盟商, store-门店',
    `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '上级机构ID',
    `level` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '层级：1-总部, 2-加盟商, 3-门店',

    -- 加盟商特有字段
    `franchisee_level` ENUM('flagship', 'standard', 'community') DEFAULT NULL COMMENT '加盟商等级：flagship-旗舰店, standard-标准店, community-社区店',
    `contract_no` VARCHAR(50) DEFAULT NULL COMMENT '合同编号',
    `contract_start_date` DATE DEFAULT NULL COMMENT '合同开始日期',
    `contract_end_date` DATE DEFAULT NULL COMMENT '合同结束日期',
    `revenue_share_rate` DECIMAL(5,2) DEFAULT 0.00 COMMENT '分成比例(%)',

    -- 联系信息
    `contact_person` VARCHAR(50) DEFAULT NULL COMMENT '联系人',
    `contact_phone` VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
    `contact_email` VARCHAR(100) DEFAULT NULL COMMENT '联系邮箱',

    -- 地址信息
    `province` VARCHAR(50) DEFAULT NULL COMMENT '省',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '市',
    `district` VARCHAR(50) DEFAULT NULL COMMENT '区',
    `address` VARCHAR(200) DEFAULT NULL COMMENT '详细地址',
    `longitude` DECIMAL(10, 6) DEFAULT NULL COMMENT '经度',
    `latitude` DECIMAL(10, 6) DEFAULT NULL COMMENT '纬度',

    -- 状态
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, suspended-暂停',

    -- 其他
    `logo_url` VARCHAR(255) DEFAULT NULL COMMENT 'Logo URL',
    `description` TEXT DEFAULT NULL COMMENT '机构描述',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `updated_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除：0-否, 1-是',

    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_org_type` (`org_type`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='机构表';

-- ============================================
-- 2. 用户权限相关表
-- ============================================

-- 2.1 用户表
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    `username` VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    `password_hash` VARCHAR(255) NOT NULL COMMENT '密码哈希',
    `real_name` VARCHAR(50) NOT NULL COMMENT '真实姓名',

    -- 所属机构
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    -- 联系方式
    `phone` VARCHAR(20) DEFAULT NULL COMMENT '手机号',
    `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',

    -- 个人信息
    `gender` ENUM('male', 'female', 'other') DEFAULT NULL COMMENT '性别',
    `avatar_url` VARCHAR(255) DEFAULT NULL COMMENT '头像URL',
    `position` VARCHAR(50) DEFAULT NULL COMMENT '职位',

    -- 状态
    `status` ENUM('active', 'inactive', 'locked') NOT NULL DEFAULT 'active' COMMENT '状态：active-正常, inactive-停用, locked-锁定',

    -- 登录信息
    `last_login_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间',
    `last_login_ip` VARCHAR(50) DEFAULT NULL COMMENT '最后登录IP',
    `login_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '登录次数',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `created_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '创建人ID',
    `updated_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '更新人ID',
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否删除',

    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_phone` (`phone`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),

    FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 2.2 角色表
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '角色ID',
    `role_code` VARCHAR(50) NOT NULL UNIQUE COMMENT '角色编码',
    `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
    `description` VARCHAR(200) DEFAULT NULL COMMENT '角色描述',

    -- 角色级别（控制数据权限范围）
    `data_scope` ENUM('all', 'org', 'store', 'self') NOT NULL DEFAULT 'self' COMMENT '数据权限范围：all-全部, org-本机构, store-本门店, self-仅自己',

    -- 状态
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active' COMMENT '状态',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 2.3 用户角色关联表
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id` BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,

    UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
    INDEX `idx_role_id` (`role_id`),

    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';

-- 2.4 权限表
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '权限ID',
    `permission_code` VARCHAR(100) NOT NULL UNIQUE COMMENT '权限编码',
    `permission_name` VARCHAR(100) NOT NULL COMMENT '权限名称',
    `resource_type` ENUM('menu', 'button', 'api') NOT NULL COMMENT '资源类型',
    `parent_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '父权限ID',

    -- 菜单相关
    `route_path` VARCHAR(200) DEFAULT NULL COMMENT '路由路径',
    `icon` VARCHAR(50) DEFAULT NULL COMMENT '图标',
    `sort_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',

    -- 状态
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_parent_id` (`parent_id`),
    INDEX `idx_resource_type` (`resource_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 2.5 角色权限关联表
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `role_id` BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    `permission_id` BIGINT UNSIGNED NOT NULL COMMENT '权限ID',

    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,

    UNIQUE KEY `uk_role_permission` (`role_id`, `permission_id`),
    INDEX `idx_permission_id` (`permission_id`),

    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';

-- ============================================
-- 3. 客户管理相关表
-- ============================================

-- 3.1 客户表
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '客户ID',
    `customer_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '客户编号',

    -- 基本信息
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `gender` ENUM('male', 'female') DEFAULT NULL COMMENT '性别',
    `birth_date` DATE DEFAULT NULL COMMENT '出生日期',
    `phone` VARCHAR(20) NOT NULL COMMENT '手机号',
    `id_card` VARCHAR(255) DEFAULT NULL COMMENT '身份证号（加密）',

    -- 地址信息
    `province` VARCHAR(50) DEFAULT NULL COMMENT '省',
    `city` VARCHAR(50) DEFAULT NULL COMMENT '市',
    `district` VARCHAR(50) DEFAULT NULL COMMENT '区',
    `address` VARCHAR(200) DEFAULT NULL COMMENT '详细地址',

    -- 所属关系
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',
    `store_id` BIGINT UNSIGNED NOT NULL COMMENT '所属门店ID',
    `counselor_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '专属顾问ID',

    -- 来源
    `source_channel` ENUM('walk_in', 'referral', 'online', 'event', 'other') DEFAULT 'walk_in' COMMENT '来源渠道',
    `referrer_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '推荐人ID',

    -- 会员信息
    `member_level` ENUM('normal', 'silver', 'gold', 'platinum', 'diamond') NOT NULL DEFAULT 'normal' COMMENT '会员等级',
    `member_points` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '会员积分',

    -- 标签（JSON存储）
    `tags` JSON DEFAULT NULL COMMENT '客户标签',

    -- 统计信息
    `total_consumption` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '累计消费金额',
    `total_orders` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '累计订单数',
    `last_visit_at` TIMESTAMP NULL DEFAULT NULL COMMENT '最后到店时间',

    -- 备注
    `remark` TEXT DEFAULT NULL COMMENT '备注',

    -- 状态
    `status` ENUM('active', 'inactive', 'blacklist') NOT NULL DEFAULT 'active' COMMENT '状态',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_phone` (`phone`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_store_id` (`store_id`),
    INDEX `idx_counselor_id` (`counselor_id`),
    INDEX `idx_member_level` (`member_level`),
    INDEX `idx_status` (`status`),
    INDEX `idx_created_at` (`created_at`),

    FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`store_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`counselor_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户表';

-- 3.2 客户诊断表
DROP TABLE IF EXISTS `customer_diagnoses`;
CREATE TABLE `customer_diagnoses` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '诊断ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    `diagnose_date` DATE NOT NULL COMMENT '诊断日期',
    `diagnosed_by` BIGINT UNSIGNED NOT NULL COMMENT '诊断人ID',

    -- 皮肤诊断
    `skin_type` ENUM('dry', 'oily', 'combination', 'sensitive', 'normal') DEFAULT NULL COMMENT '肤质类型',
    `skin_problems` JSON DEFAULT NULL COMMENT '皮肤问题（JSON数组）',
    `skin_sensitivity` JSON DEFAULT NULL COMMENT '敏感源（JSON数组）',

    -- 毛发诊断
    `hair_type` ENUM('dry', 'oily', 'normal', 'damaged') DEFAULT NULL COMMENT '发质类型',
    `hair_problems` JSON DEFAULT NULL COMMENT '毛发问题（JSON数组）',
    `scalp_condition` VARCHAR(100) DEFAULT NULL COMMENT '头皮状况',

    -- 诊断数据（可扩展字段）
    `diagnose_data` JSON DEFAULT NULL COMMENT '详细诊断数据',

    -- 照片
    `photos` JSON DEFAULT NULL COMMENT '诊断照片URLs（JSON数组）',

    -- 建议
    `suggestions` TEXT DEFAULT NULL COMMENT '诊断建议',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_diagnose_date` (`diagnose_date`),

    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`diagnosed_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户诊断表';

-- 3.3 客户案例表
DROP TABLE IF EXISTS `customer_cases`;
CREATE TABLE `customer_cases` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '案例ID',
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    `case_title` VARCHAR(200) NOT NULL COMMENT '案例标题',
    `case_type` ENUM('skin_care', 'hair_care', 'body_care', 'other') NOT NULL COMMENT '案例类型',

    -- 服务信息
    `service_period` VARCHAR(50) DEFAULT NULL COMMENT '服务周期（如：3个月）',
    `service_frequency` VARCHAR(50) DEFAULT NULL COMMENT '服务频次（如：每周2次）',

    -- 问题描述
    `initial_problems` TEXT DEFAULT NULL COMMENT '初始问题描述',

    -- 方案说明
    `treatment_plan` TEXT DEFAULT NULL COMMENT '治疗方案',
    `products_used` JSON DEFAULT NULL COMMENT '使用产品（JSON数组）',

    -- 效果说明
    `results` TEXT DEFAULT NULL COMMENT '效果说明',

    -- 照片对比
    `before_photos` JSON DEFAULT NULL COMMENT '前照片URLs（JSON数组）',
    `after_photos` JSON DEFAULT NULL COMMENT '后照片URLs（JSON数组）',

    -- 客户评价
    `customer_feedback` TEXT DEFAULT NULL COMMENT '客户评价',
    `satisfaction_score` TINYINT UNSIGNED DEFAULT NULL COMMENT '满意度评分（1-5）',

    -- 展示控制
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否精选',
    `is_public` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否公开展示',
    `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '展示顺序',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_case_type` (`case_type`),
    INDEX `idx_is_featured` (`is_featured`),
    INDEX `idx_is_public` (`is_public`),

    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户案例表';

-- ============================================
-- 4. 服务项目相关表
-- ============================================

-- 4.1 服务项目表
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '服务项目ID',
    `service_code` VARCHAR(50) NOT NULL COMMENT '项目编码',
    `service_name` VARCHAR(100) NOT NULL COMMENT '项目名称',

    -- 分类
    `category` ENUM('skin_care', 'hair_care', 'body_care', 'spa', 'other') NOT NULL COMMENT '服务类别',
    `subcategory` VARCHAR(50) DEFAULT NULL COMMENT '子类别',

    -- 所属机构（null表示全局可用）
    `org_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID（NULL表示总部创建）',

    -- 价格
    `standard_price` DECIMAL(10, 2) NOT NULL COMMENT '标准价格',
    `vip_price` DECIMAL(10, 2) DEFAULT NULL COMMENT 'VIP价格',

    -- 服务时长
    `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 60 COMMENT '服务时长（分钟）',

    -- 描述
    `description` TEXT DEFAULT NULL COMMENT '项目描述',
    `benefits` TEXT DEFAULT NULL COMMENT '功效说明',

    -- 适用范围
    `suitable_for` JSON DEFAULT NULL COMMENT '适用人群（JSON）',

    -- 展示
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    `is_featured` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否推荐',
    `display_order` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '排序',

    -- 状态
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    UNIQUE KEY `uk_org_code` (`org_id`, `service_code`),
    INDEX `idx_category` (`category`),
    INDEX `idx_status` (`status`),
    INDEX `idx_org_id` (`org_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务项目表';

-- ============================================
-- 5. 订单管理相关表
-- ============================================

-- 5.1 订单表
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
    `order_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '订单编号',

    -- 客户信息
    `customer_id` BIGINT UNSIGNED NOT NULL COMMENT '客户ID',
    `customer_name` VARCHAR(50) NOT NULL COMMENT '客户姓名（冗余）',
    `customer_phone` VARCHAR(20) NOT NULL COMMENT '客户电话（冗余）',

    -- 所属关系
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',
    `store_id` BIGINT UNSIGNED NOT NULL COMMENT '所属门店ID',

    -- 服务人员
    `counselor_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '顾问ID',
    `beautician_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '美容师ID',

    -- 订单金额
    `original_amount` DECIMAL(10, 2) NOT NULL COMMENT '原始金额',
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '优惠金额',
    `final_amount` DECIMAL(10, 2) NOT NULL COMMENT '实付金额',

    -- 支付信息
    `payment_method` ENUM('cash', 'wechat', 'alipay', 'card', 'membercard', 'other') DEFAULT NULL COMMENT '支付方式',
    `payment_status` ENUM('unpaid', 'partial', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid' COMMENT '支付状态',
    `paid_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '已付金额',
    `paid_at` TIMESTAMP NULL DEFAULT NULL COMMENT '支付时间',

    -- 订单状态
    `order_status` ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunding', 'refunded') NOT NULL DEFAULT 'pending' COMMENT '订单状态',

    -- 服务时间
    `service_date` DATE DEFAULT NULL COMMENT '服务日期',
    `service_start_time` TIME DEFAULT NULL COMMENT '服务开始时间',
    `service_end_time` TIME DEFAULT NULL COMMENT '服务结束时间',

    -- 备注
    `remark` TEXT DEFAULT NULL COMMENT '订单备注',
    `cancel_reason` TEXT DEFAULT NULL COMMENT '取消原因',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_order_no` (`order_no`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_store_id` (`store_id`),
    INDEX `idx_order_status` (`order_status`),
    INDEX `idx_payment_status` (`payment_status`),
    INDEX `idx_service_date` (`service_date`),
    INDEX `idx_created_at` (`created_at`),

    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`org_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT,
    FOREIGN KEY (`store_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 5.2 订单明细表
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '明细ID',
    `order_id` BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    -- 项目信息
    `service_id` BIGINT UNSIGNED NOT NULL COMMENT '服务项目ID',
    `service_name` VARCHAR(100) NOT NULL COMMENT '服务项目名称',
    `service_category` VARCHAR(50) DEFAULT NULL COMMENT '服务类别',

    -- 价格信息
    `unit_price` DECIMAL(10, 2) NOT NULL COMMENT '单价',
    `quantity` INT UNSIGNED NOT NULL DEFAULT 1 COMMENT '数量',
    `discount_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00 COMMENT '折扣率(%)',
    `subtotal` DECIMAL(10, 2) NOT NULL COMMENT '小计',

    -- 执行人员
    `beautician_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '执行美容师ID',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `idx_order_id` (`order_id`),
    INDEX `idx_service_id` (`service_id`),

    FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细表';

-- ============================================
-- 6. 任务管理相关表
-- ============================================

-- 6.1 任务表
DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '任务ID',
    `task_no` VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号',

    -- 任务信息
    `title` VARCHAR(200) NOT NULL COMMENT '任务标题',
    `description` TEXT DEFAULT NULL COMMENT '任务描述',
    `task_type` ENUM('follow_up', 'birthday', 'feedback', 'complaint', 'custom') NOT NULL COMMENT '任务类型',
    `priority` ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium' COMMENT '优先级',

    -- 关联
    `customer_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联客户ID',
    `order_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '关联订单ID',
    `org_id` BIGINT UNSIGNED NOT NULL COMMENT '所属机构ID',

    -- 分配
    `assigned_to` BIGINT UNSIGNED NOT NULL COMMENT '执行人ID',
    `assigned_by` BIGINT UNSIGNED DEFAULT NULL COMMENT '分配人ID',

    -- 时间
    `due_date` DATE DEFAULT NULL COMMENT '截止日期',
    `reminder_time` TIMESTAMP NULL DEFAULT NULL COMMENT '提醒时间',
    `completed_at` TIMESTAMP NULL DEFAULT NULL COMMENT '完成时间',

    -- 状态
    `status` ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue') NOT NULL DEFAULT 'pending' COMMENT '任务状态',

    -- 完成信息
    `completion_note` TEXT DEFAULT NULL COMMENT '完成说明',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    INDEX `idx_task_no` (`task_no`),
    INDEX `idx_customer_id` (`customer_id`),
    INDEX `idx_assigned_to` (`assigned_to`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_task_type` (`task_type`),
    INDEX `idx_due_date` (`due_date`),

    FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL,
    FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ============================================
-- 7. 方案模板相关表
-- ============================================

-- 7.1 方案模板表
DROP TABLE IF EXISTS `solution_templates`;
CREATE TABLE `solution_templates` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '模板ID',
    `template_code` VARCHAR(50) NOT NULL COMMENT '模板编码',
    `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',

    -- 分类
    `category` ENUM('hydration', 'whitening', 'anti_aging', 'repair', 'hair_care', 'other') NOT NULL COMMENT '方案类别',

    -- 所属（NULL表示总部创建的全局模板）
    `org_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID',
    `scope` ENUM('global', 'org', 'private') NOT NULL DEFAULT 'org' COMMENT '共享范围',

    -- 适用条件
    `suitable_skin_types` JSON DEFAULT NULL COMMENT '适用肤质（JSON数组）',
    `suitable_problems` JSON DEFAULT NULL COMMENT '适用问题（JSON数组）',
    `target_group` VARCHAR(100) DEFAULT NULL COMMENT '目标人群',

    -- 方案内容
    `course_duration` VARCHAR(50) DEFAULT NULL COMMENT '疗程时长',
    `treatment_frequency` VARCHAR(50) DEFAULT NULL COMMENT '治疗频次',
    `steps` JSON DEFAULT NULL COMMENT '步骤说明（JSON数组）',
    `products` JSON DEFAULT NULL COMMENT '推荐产品（JSON数组）',
    `services` JSON DEFAULT NULL COMMENT '包含服务（JSON数组）',

    -- 效果说明
    `expected_effects` TEXT DEFAULT NULL COMMENT '预期效果',
    `precautions` TEXT DEFAULT NULL COMMENT '注意事项',

    -- 价格
    `estimated_price_min` DECIMAL(10, 2) DEFAULT NULL COMMENT '预估价格下限',
    `estimated_price_max` DECIMAL(10, 2) DEFAULT NULL COMMENT '预估价格上限',

    -- 展示
    `cover_image` VARCHAR(255) DEFAULT NULL COMMENT '封面图',
    `case_photos` JSON DEFAULT NULL COMMENT '案例照片（JSON数组）',

    -- 统计
    `usage_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '使用次数',

    -- 状态
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',

    -- 审计字段
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `created_by` BIGINT UNSIGNED DEFAULT NULL,
    `updated_by` BIGINT UNSIGNED DEFAULT NULL,
    `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,

    UNIQUE KEY `uk_org_code` (`org_id`, `template_code`),
    INDEX `idx_category` (`category`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_scope` (`scope`),
    INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='方案模板表';

-- ============================================
-- 8. 系统日志表
-- ============================================

-- 8.1 操作日志表
DROP TABLE IF EXISTS `operation_logs`;
CREATE TABLE `operation_logs` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',

    -- 操作人
    `user_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '操作人ID',
    `username` VARCHAR(50) DEFAULT NULL COMMENT '操作人用户名',
    `org_id` BIGINT UNSIGNED DEFAULT NULL COMMENT '所属机构ID',

    -- 操作信息
    `module` VARCHAR(50) NOT NULL COMMENT '模块名称',
    `action` VARCHAR(50) NOT NULL COMMENT '操作类型（create/update/delete/view）',
    `description` VARCHAR(500) DEFAULT NULL COMMENT '操作描述',

    -- 请求信息
    `request_method` VARCHAR(10) DEFAULT NULL COMMENT '请求方法',
    `request_url` VARCHAR(500) DEFAULT NULL COMMENT '请求URL',
    `request_params` JSON DEFAULT NULL COMMENT '请求参数',

    -- 响应信息
    `response_status` INT DEFAULT NULL COMMENT '响应状态码',
    `response_time` INT UNSIGNED DEFAULT NULL COMMENT '响应耗时（ms）',

    -- 环境信息
    `ip_address` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
    `user_agent` VARCHAR(500) DEFAULT NULL COMMENT '用户代理',

    -- 时间
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    INDEX `idx_user_id` (`user_id`),
    INDEX `idx_org_id` (`org_id`),
    INDEX `idx_module` (`module`),
    INDEX `idx_action` (`action`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 初始化数据
-- ============================================

-- 1. 创建总部机构
INSERT INTO `organizations` (`org_code`, `org_name`, `org_type`, `level`, `status`, `created_at`)
VALUES ('ORG000001', '美业CRM总部', 'platform', 1, 'active', NOW());

-- 2. 创建默认角色
INSERT INTO `roles` (`role_code`, `role_name`, `description`, `data_scope`, `status`) VALUES
('super_admin', '超级管理员', '系统最高权限', 'all', 'active'),
('platform_admin', '平台管理员', '总部管理员', 'all', 'active'),
('franchisee_admin', '加盟商管理员', '加盟商管理员', 'org', 'active'),
('store_manager', '门店店长', '门店管理员', 'store', 'active'),
('counselor', '美容顾问', '客户顾问', 'self', 'active'),
('beautician', '美容师', '服务执行人员', 'self', 'active'),
('finance', '财务人员', '财务管理', 'org', 'active');

-- 3. 创建默认管理员账号（密码：admin123，需要使用bcrypt加密）
-- 注意：实际使用时需要用bcrypt生成密码哈希
INSERT INTO `users` (`username`, `password_hash`, `real_name`, `org_id`, `position`, `status`)
VALUES ('admin', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 1, '超级管理员', 'active');

-- 4. 为管理员分配角色
INSERT INTO `user_roles` (`user_id`, `role_id`) VALUES (1, 1);

-- 5. 创建默认权限（菜单权限）
INSERT INTO `permissions` (`permission_code`, `permission_name`, `resource_type`, `route_path`, `icon`, `sort_order`, `status`) VALUES
('dashboard', '数据看板', 'menu', '/index.html', 'home', 1, 'active'),
('customers', '客户管理', 'menu', '/customers.html', 'users', 2, 'active'),
('orders', '订单管理', 'menu', '/orders.html', 'shopping-cart', 3, 'active'),
('tasks', '任务管理', 'menu', '/tasks.html', 'clipboard-list', 4, 'active'),
('cases', '客户案例', 'menu', '/cases.html', 'image', 5, 'active'),
('templates', '方案模板', 'menu', '/templates.html', 'layers', 6, 'active'),
('franchisees', '加盟商管理', 'menu', '/franchisees.html', 'building', 7, 'active'),
('settings', '系统设置', 'menu', '/settings.html', 'settings', 8, 'active');

-- 6. 为超级管理员分配所有权限
INSERT INTO `role_permissions` (`role_id`, `permission_id`)
SELECT 1, id FROM `permissions` WHERE `status` = 'active';

-- 7. 创建默认服务项目
INSERT INTO `services` (`service_code`, `service_name`, `category`, `org_id`, `standard_price`, `duration_minutes`, `status`) VALUES
('SV001', '深层补水护理', 'skin_care', NULL, 299.00, 60, 'active'),
('SV002', '美白淡斑套餐', 'skin_care', NULL, 599.00, 90, 'active'),
('SV003', '抗衰紧致疗程', 'skin_care', NULL, 899.00, 120, 'active'),
('SV004', '头皮深层护理', 'hair_care', NULL, 199.00, 60, 'active'),
('SV005', '染烫修复套餐', 'hair_care', NULL, 399.00, 90, 'active'),
('SV006', '全身SPA护理', 'spa', NULL, 699.00, 120, 'active');

-- 8. 创建默认方案模板
INSERT INTO `solution_templates` (`template_code`, `template_name`, `category`, `org_id`, `scope`, `course_duration`, `treatment_frequency`, `expected_effects`, `status`) VALUES
('TPL001', '深度补水保湿方案', 'hydration', NULL, 'global', '1个月', '每周2次', '改善肌肤干燥，提升水润度，恢复肌肤弹性', 'active'),
('TPL002', '美白淡斑焕肤方案', 'whitening', NULL, 'global', '3个月', '每周1次', '淡化色斑，提亮肤色，均匀肤质', 'active'),
('TPL003', '抗衰紧致提升方案', 'anti_aging', NULL, 'global', '3个月', '每周2次', '紧致肌肤，淡化细纹，提升轮廓', 'active'),
('TPL004', '头皮养护方案', 'hair_care', NULL, 'global', '2个月', '每周1次', '改善头皮健康，促进头发生长，预防脱发', 'active');

-- ============================================
-- 完成提示
-- ============================================

SELECT '========================================' AS '';
SELECT '数据库初始化完成！' AS '提示';
SELECT '========================================' AS '';
SELECT '数据库名称: beauty_crm' AS '信息';
SELECT '默认管理员账号: admin' AS '信息';
SELECT '默认管理员密码: admin123' AS '信息';
SELECT '========================================' AS '';
SELECT '请及时修改默认密码！' AS '安全提示';
SELECT '========================================' AS '';
