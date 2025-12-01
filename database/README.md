# 数据库初始化指南

## 📋 概述

本目录包含美业客户洞察CRM系统的数据库初始化脚本和配置文件。

## 📁 文件说明

```
database/
├── init.sql              # 数据库初始化SQL脚本
├── db.config.example.js  # 数据库配置示例文件
└── README.md            # 本文件
```

## 🚀 快速开始

### 1. 准备工作

#### 1.1 阿里云RDS MySQL 8.0 配置

1. 登录阿里云控制台
2. 创建RDS MySQL 8.0实例
3. 配置白名单（添加应用服务器IP）
4. 创建数据库账号
5. 记录以下连接信息：
   - 主机地址（Host）
   - 端口（Port，默认3306）
   - 用户名（Username）
   - 密码（Password）

### 2. 执行初始化脚本

#### 方式一：通过MySQL客户端

```bash
# 1. 连接到阿里云RDS
mysql -h your-rds-host.mysql.rds.aliyuncs.com -P 3306 -u username -p

# 2. 执行初始化脚本
source /path/to/init.sql

# 或者直接执行
mysql -h your-rds-host.mysql.rds.aliyuncs.com -P 3306 -u username -p < init.sql
```

#### 方式二：通过Navicat/DataGrip等工具

1. 连接到阿里云RDS
2. 打开 `init.sql` 文件
3. 执行整个脚本

### 3. 验证安装

```sql
-- 1. 查看数据库
SHOW DATABASES;

-- 2. 使用数据库
USE beauty_crm;

-- 3. 查看所有表
SHOW TABLES;

-- 4. 验证初始数据
SELECT * FROM organizations;
SELECT * FROM users;
SELECT * FROM roles;
SELECT * FROM services;
```

## 📊 数据库结构

### 核心表（15张）

| 序号 | 表名 | 中文名 | 说明 |
|-----|------|--------|------|
| 1 | organizations | 机构表 | 存储总部、加盟商、门店信息 |
| 2 | users | 用户表 | 系统用户账号 |
| 3 | roles | 角色表 | 角色定义 |
| 4 | user_roles | 用户角色关联表 | 多对多关系 |
| 5 | permissions | 权限表 | 菜单、按钮、API权限 |
| 6 | role_permissions | 角色权限关联表 | 多对多关系 |
| 7 | customers | 客户表 | 客户基本信息 |
| 8 | customer_diagnoses | 客户诊断表 | 皮肤/毛发诊断记录 |
| 9 | customer_cases | 客户案例表 | 成功案例展示 |
| 10 | services | 服务项目表 | 服务项目定义 |
| 11 | orders | 订单表 | 订单主表 |
| 12 | order_items | 订单明细表 | 订单项目明细 |
| 13 | tasks | 任务表 | 待办任务 |
| 14 | solution_templates | 方案模板表 | 护理方案模板 |
| 15 | operation_logs | 操作日志表 | 系统操作审计 |

### ER关系图

```
organizations (1) ──< (N) organizations (自关联)
organizations (1) ──< (N) users
organizations (1) ──< (N) customers
organizations (1) ──< (N) orders

users (N) ──< (M) roles
roles (N) ──< (M) permissions

customers (1) ──< (N) customer_diagnoses
customers (1) ──< (N) customer_cases
customers (1) ──< (N) orders
customers (1) ──< (N) tasks

orders (1) ──< (N) order_items
services (1) ──< (N) order_items
```

## 🔐 初始账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| admin | admin123 | 超级管理员 | **请立即修改密码！** |

### 修改密码

```sql
-- 使用bcrypt加密新密码后更新
UPDATE users
SET password_hash = '$2b$10$新的密码哈希值'
WHERE username = 'admin';
```

## 📝 初始数据

### 默认角色（7个）

| 角色编码 | 角色名称 | 数据权限 |
|---------|---------|---------|
| super_admin | 超级管理员 | all |
| platform_admin | 平台管理员 | all |
| franchisee_admin | 加盟商管理员 | org |
| store_manager | 门店店长 | store |
| counselor | 美容顾问 | self |
| beautician | 美容师 | self |
| finance | 财务人员 | org |

### 默认权限（8个菜单）

- 数据看板
- 客户管理
- 订单管理
- 任务管理
- 客户案例
- 方案模板
- 加盟商管理
- 系统设置

### 默认服务项目（6个）

1. 深层补水护理 - ¥299
2. 美白淡斑套餐 - ¥599
3. 抗衰紧致疗程 - ¥899
4. 头皮深层护理 - ¥199
5. 染烫修复套餐 - ¥399
6. 全身SPA护理 - ¥699

### 默认方案模板（4个）

1. 深度补水保湿方案
2. 美白淡斑焕肤方案
3. 抗衰紧致提升方案
4. 头皮养护方案

## 🔧 配置应用连接

### Node.js示例（使用mysql2）

```javascript
// db.config.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'your-rds-host.mysql.rds.aliyuncs.com',
    port: 3306,
    user: 'your_username',
    password: 'your_password',
    database: 'beauty_crm',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

module.exports = pool;
```

### 测试连接

```javascript
// test-connection.js
const pool = require('./db.config');

async function testConnection() {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS result');
        console.log('✅ 数据库连接成功！');
        console.log('测试查询结果:', rows[0].result);
    } catch (error) {
        console.error('❌ 数据库连接失败:', error.message);
    }
}

testConnection();
```

## 📈 性能优化建议

### 1. 索引优化

```sql
-- 已创建的关键索引
-- customers: idx_phone, idx_org_id, idx_store_id, idx_member_level
-- orders: idx_customer_id, idx_order_status, idx_service_date
-- tasks: idx_assigned_to, idx_status, idx_due_date

-- 根据实际查询情况添加复合索引
-- 例如：客户按机构和状态查询
CREATE INDEX idx_customer_org_status ON customers(org_id, status, created_at);
```

### 2. 分区表（大数据量时）

```sql
-- 订单表按年份分区（超过100万条记录时考虑）
ALTER TABLE orders PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### 3. 读写分离

```javascript
// 主库连接（写操作）
const masterPool = mysql.createPool({
    host: 'master-host.mysql.rds.aliyuncs.com',
    // ...
});

// 从库连接（读操作）
const slavePool = mysql.createPool({
    host: 'slave-host.mysql.rds.aliyuncs.com',
    // ...
});
```

## 🔄 数据备份

### 自动备份（阿里云RDS）

1. 登录阿里云RDS控制台
2. 选择实例 → 备份恢复
3. 设置自动备份策略：
   - 备份周期：每天
   - 备份时间：凌晨2-3点
   - 保留天数：30天

### 手动备份

```bash
# 导出整个数据库
mysqldump -h your-rds-host.mysql.rds.aliyuncs.com \
          -u username -p \
          beauty_crm > backup_$(date +%Y%m%d).sql

# 仅导出表结构
mysqldump -h your-rds-host.mysql.rds.aliyuncs.com \
          -u username -p \
          --no-data beauty_crm > schema_only.sql

# 仅导出数据
mysqldump -h your-rds-host.mysql.rds.aliyuncs.com \
          -u username -p \
          --no-create-info beauty_crm > data_only.sql
```

## 🛡️ 安全建议

### 1. 账号权限

```sql
-- 创建只读账号（用于报表查询）
CREATE USER 'readonly'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT ON beauty_crm.* TO 'readonly'@'%';
FLUSH PRIVILEGES;

-- 创建应用账号（读写权限，不含DROP）
CREATE USER 'app_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON beauty_crm.* TO 'app_user'@'%';
FLUSH PRIVILEGES;
```

### 2. 敏感数据加密

```sql
-- 手机号、身份证号需要在应用层使用AES加密后再存储
-- 不要直接存储明文敏感信息
```

### 3. 参数化查询

```javascript
// ✅ 正确 - 使用参数化查询
const [rows] = await pool.execute(
    'SELECT * FROM customers WHERE phone = ? AND org_id = ?',
    [phone, orgId]
);

// ❌ 错误 - SQL拼接（有注入风险）
const sql = `SELECT * FROM customers WHERE phone = '${phone}'`;
```

## 📞 常见问题

### Q1: 连接超时

**原因**: 白名单未配置
**解决**: 在阿里云RDS控制台添加应用服务器IP到白名单

### Q2: 字符集问题

**原因**: 客户端字符集不一致
**解决**:
```sql
-- 查看字符集
SHOW VARIABLES LIKE 'character%';

-- 设置连接字符集
SET NAMES utf8mb4;
```

### Q3: 时区问题

**解决**:
```sql
-- 查看时区
SELECT @@global.time_zone, @@session.time_zone;

-- 设置时区为东八区
SET time_zone = '+8:00';
```

### Q4: 慢查询优化

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- 查看慢查询
SHOW VARIABLES LIKE 'slow_query%';
```

## 📚 参考资料

- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [阿里云RDS使用指南](https://help.aliyun.com/product/26090.html)
- [数据库设计规范](https://github.com/topics/database-design)

## 🔗 相关文档

- `../需求分析.md` - 系统需求分析
- `../系统设计.md` - 系统设计文档

---

**更新时间**: 2025-12-01
**维护人员**: 系统管理员
