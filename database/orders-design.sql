-- =============================================
-- 订单管理表设计
-- 创建时间: 2025-12-03
-- =============================================

-- 订单表
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `org_id` int DEFAULT NULL COMMENT '所属机构ID',
  `customer_id` int NOT NULL COMMENT '客户ID',
  `customer_name` varchar(100) NOT NULL COMMENT '客户姓名',
  `customer_phone` varchar(20) DEFAULT NULL COMMENT '客户电话',

  -- 服务信息
  `service_name` varchar(200) NOT NULL COMMENT '服务项目名称',
  `service_description` text COMMENT '服务描述',
  `service_category` varchar(50) DEFAULT NULL COMMENT '服务分类(facial/body/spa等)',

  -- 金额信息
  `unit_price` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '单价',
  `quantity` int NOT NULL DEFAULT '1' COMMENT '数量',
  `subtotal` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '小计',
  `discount_amount` decimal(10,2) DEFAULT '0.00' COMMENT '优惠金额',
  `total_amount` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单总金额',
  `paid_amount` decimal(10,2) DEFAULT '0.00' COMMENT '已支付金额',

  -- 订单状态
  `status` enum('draft','pending','paid','processing','completed','cancelled','refunded') NOT NULL DEFAULT 'draft' COMMENT '订单状态',
  `payment_method` varchar(50) DEFAULT NULL COMMENT '支付方式(cash/wechat/alipay/card)',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',

  -- 服务时间
  `appointment_time` datetime DEFAULT NULL COMMENT '预约服务时间',
  `service_start_time` datetime DEFAULT NULL COMMENT '服务开始时间',
  `service_end_time` datetime DEFAULT NULL COMMENT '服务结束时间',

  -- 人员信息
  `sales_person` varchar(100) DEFAULT NULL COMMENT '销售人员',
  `service_person` varchar(100) DEFAULT NULL COMMENT '服务人员',

  -- 其他信息
  `notes` text COMMENT '订单备注',
  `cancel_reason` varchar(500) DEFAULT NULL COMMENT '取消原因',
  `refund_reason` varchar(500) DEFAULT NULL COMMENT '退款原因',
  `refund_amount` decimal(10,2) DEFAULT '0.00' COMMENT '退款金额',

  -- 系统字段
  `created_by` int DEFAULT NULL COMMENT '创建人ID',
  `updated_by` int DEFAULT NULL COMMENT '更新人ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `is_deleted` tinyint(1) DEFAULT '0' COMMENT '是否已删除(0:否,1:是)',

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_org_id` (`org_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_appointment_time` (`appointment_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 插入演示数据
INSERT INTO `orders`
(`order_no`, `org_id`, `customer_id`, `customer_name`, `customer_phone`,
 `service_name`, `service_description`, `service_category`,
 `unit_price`, `quantity`, `subtotal`, `discount_amount`, `total_amount`, `paid_amount`,
 `status`, `payment_method`, `payment_time`,
 `appointment_time`, `sales_person`, `service_person`, `notes`)
VALUES
-- 已完成订单
('ORD20251203001', 1, 1, '张小姐', '13800138001',
 '面部深层清洁护理', '包含深层清洁、补水保湿、面部按摩等项目', 'facial',
 680.00, 1, 680.00, 80.00, 600.00, 600.00,
 'completed', 'wechat', '2025-12-01 10:30:00',
 '2025-12-01 14:00:00', '李美容师', '王护理师', '客户皮肤状态良好'),

('ORD20251203002', 1, 2, '王女士', '13800138002',
 '全身SPA护理', '包含全身按摩、精油护理、热石理疗', 'spa',
 1280.00, 1, 1280.00, 0.00, 1280.00, 1280.00,
 'completed', 'alipay', '2025-12-02 09:15:00',
 '2025-12-02 15:00:00', '李美容师', '赵技师', 'VIP客户,服务满意'),

-- 进行中订单
('ORD20251203003', 1, 3, '李小姐', '13800138003',
 '瘦身塑形套餐', '包含仪器塑形、手法按摩、运动指导', 'body',
 3680.00, 5, 18400.00, 2400.00, 16000.00, 16000.00,
 'processing', 'card', '2025-12-03 10:00:00',
 '2025-12-04 10:00:00', '李美容师', '孙教练', '已完成2次,共5次疗程'),

('ORD20251203004', 1, 1, '张小姐', '13800138001',
 '肩颈理疗按摩', '专业肩颈按摩,缓解疲劳', 'massage',
 380.00, 3, 1140.00, 140.00, 1000.00, 1000.00,
 'processing', 'wechat', '2025-12-02 16:00:00',
 '2025-12-05 18:00:00', '李美容师', '周技师', '套餐已完成1次'),

-- 已支付待服务
('ORD20251203005', 1, 4, '赵女士', '13800138004',
 '美白焕肤护理', '美白精华导入、焕肤面膜、补水护理', 'facial',
 880.00, 1, 880.00, 0.00, 880.00, 880.00,
 'paid', 'wechat', '2025-12-03 11:20:00',
 '2025-12-04 14:00:00', '李美容师', '王护理师', '新客户首次体验'),

('ORD20251203006', 1, 5, '刘小姐', '13800138005',
 '眼部护理套餐', '眼部精华、眼膜、眼部按摩', 'facial',
 580.00, 2, 1160.00, 60.00, 1100.00, 1100.00,
 'paid', 'alipay', '2025-12-03 10:45:00',
 '2025-12-05 10:00:00', '李美容师', '王护理师', '会员客户'),

-- 待支付订单
('ORD20251203007', 1, 6, '陈女士', '13800138006',
 '抗衰老护理疗程', '抗衰老精华、胶原蛋白导入、提拉紧致', 'facial',
 1580.00, 3, 4740.00, 240.00, 4500.00, 0.00,
 'pending', NULL, NULL,
 '2025-12-06 15:00:00', '李美容师', NULL, '待客户确认支付'),

('ORD20251203008', 1, 2, '王女士', '13800138002',
 '足部SPA护理', '足部深层清洁、按摩、保养', 'spa',
 280.00, 1, 280.00, 0.00, 280.00, 0.00,
 'pending', NULL, NULL,
 '2025-12-04 16:00:00', '李美容师', NULL, '线上预约待付款'),

-- 草稿订单
('ORD20251203009', 1, 7, '周女士', '13800138007',
 '美甲美睫套餐', '美甲、睫毛嫁接、眉毛护理', 'beauty',
 680.00, 1, 680.00, 0.00, 680.00, 0.00,
 'draft', NULL, NULL,
 NULL, '李美容师', NULL, '客户咨询中,待确认'),

('ORD20251203010', 1, 3, '李小姐', '13800138003',
 '头部理疗按摩', '头部穴位按摩、舒缓放松', 'massage',
 180.00, 1, 180.00, 0.00, 180.00, 0.00,
 'draft', NULL, NULL,
 NULL, '李美容师', NULL, '草稿待完善'),

-- 已取消订单
('ORD20251203011', 1, 8, '吴女士', '13800138008',
 '身体护理套餐', '全身去角质、保湿护理', 'body',
 780.00, 1, 780.00, 0.00, 780.00, 0.00,
 'cancelled', NULL, NULL,
 '2025-12-03 14:00:00', '李美容师', NULL, '客户时间冲突取消');
