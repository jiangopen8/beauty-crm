# 美业客户洞察CRM系统 - 项目文档

## 📚 文档导航

本项目包含完整的需求分析、系统设计和数据库设计文档。

### 核心文档

| 文档名称 | 路径 | 说明 | 最后更新 |
|---------|------|------|---------|
| **需求分析文档** | [需求分析.md](./需求分析.md) | 完整的业务需求、功能需求、非功能性需求分析 | 2025-12-01 |
| **系统设计文档** | [系统设计.md](./系统设计.md) | 系统架构、数据库设计、接口设计、安全设计 | 2025-12-01 |
| **数据库表结构说明** | [数据库表结构说明.md](./数据库表结构说明.md) | 17张表的详细结构、字段说明、索引、外键 | 2025-12-04 |
| **ER图设计文档** | [ER图设计.md](./ER图设计.md) | 数据库ER图、实体关系、索引设计 | 2025-12-01 |
| **数据库文档** | [../database/README.md](../database/README.md) | 数据库初始化指南、配置说明 | 2025-12-01 |
| **代码文档映射** | [CODE_DOC_MAPPING.md](./CODE_DOC_MAPPING.md) | 代码文件与文档章节的映射关系 | 2025-12-04 |
| **文档维护指南** | [MAINTAIN.md](./MAINTAIN.md) | 文档更新流程、编写规范、工具使用 | 2025-12-01 |
| **部署文档** | [../DEPLOYMENT.md](../DEPLOYMENT.md) | 生产环境部署指南、服务器配置 | 2025-12-04 |

---

## 🎯 快速导航

### 按角色查阅

#### 产品经理/业务人员
- 📋 [项目概述](./需求分析.md#一项目概述)
- 🔄 [业务流程](./需求分析.md#21-核心业务流程)
- ✨ [功能需求](./需求分析.md#22-功能需求)
- 🏢 [多机构架构](./需求分析.md#23-多机构架构需求)

#### 技术负责人/架构师
- 🏗️ [系统架构](./系统设计.md#一系统架构设计)
- 💾 [数据库设计](./系统设计.md#二数据库设计)
- 🔌 [接口设计](./系统设计.md#三接口设计)
- 🔐 [安全设计](./系统设计.md#五安全设计)
- ⚡ [性能优化](./系统设计.md#六性能优化)

#### 开发工程师
- 📊 [数据库表结构详解](./数据库表结构说明.md) ⭐ 新增
- 📊 [数据库表结构概览](./系统设计.md#22-核心表结构设计)
- 🔗 [API接口规范](./系统设计.md#31-restful-api-规范)
- 🛡️ [权限设计](./系统设计.md#四权限设计)
- 📝 [开发规范](./系统设计.md#八附录)
- 🗺️ [代码文档映射](./CODE_DOC_MAPPING.md)

#### 文档维护者
- 📝 [文档维护指南](./MAINTAIN.md)
- 🔄 [文档同步工具](../scripts/sync-docs.js)
- ⚙️ [同步配置](../.claude/doc-sync-config.json)

#### 运维/DBA
- 🗄️ [数据库初始化](../database/README.md)
- 📋 [数据库表结构说明](./数据库表结构说明.md) ⭐ 新增
- 🚀 [部署架构](./系统设计.md#七部署架构)
- 💾 [备份策略](./需求分析.md#43-数据备份策略)

---

## 📖 文档概览

### 1. 需求分析文档

**核心内容**：
- ✅ 项目背景与目标
- ✅ 目标用户分析（5类角色）
- ✅ 核心业务流程（3大流程）
- ✅ 功能需求详解（7大模块）
- ✅ 多机构架构设计
- ✅ 非功能性需求（性能、安全、可用性）
- ✅ 数据需求与备份策略
- ✅ 接口需求与API设计原则
- ✅ 项目约束与风险分析
- ✅ 版本规划（V1.0→V2.0→V3.0）

**适用人群**：产品经理、业务人员、项目经理、客户

**文档大小**：约15KB，440行

---

### 2. 系统设计文档

**核心内容**：
- ✅ 系统总体架构（6层架构图）
- ✅ 技术选型建议（3套方案对比）
- ✅ 完整数据库设计（15张表）
  - 组织机构表
  - 用户权限表（RBAC）
  - 客户管理表
  - 订单管理表
  - 任务管理表
  - 方案模板表
  - 系统日志表
- ✅ RESTful API接口设计
- ✅ 权限设计（7种角色+数据权限）
- ✅ 安全设计（认证、加密、防注入）
- ✅ 性能优化策略
- ✅ 部署架构与配置

**适用人群**：技术负责人、架构师、开发工程师、DBA

**文档大小**：约49KB，包含完整SQL设计

---

### 3. 数据库文档

**核心内容**：
- ✅ 数据库初始化指南
- ✅ 表结构详细说明
- ✅ ER关系图
- ✅ 初始数据说明
- ✅ 性能优化建议
- ✅ 备份恢复方案
- ✅ 常见问题解答

**适用人群**：DBA、后端开发工程师

**位置**：`../database/`

---

## 🎨 系统功能模块

### 核心模块（10个）

| 模块 | 状态 | 优先级 | 数据表 | 页面文件 |
|-----|------|-------|--------|---------|
| 📊 **数据看板** | ✅ 已实现 | P0 | - | index.html |
| 👥 **客户管理** | ✅ 已实现 | P0 | customers, customer_diagnoses, customer_cases | customers.html, customer-detail.html |
| 📦 **订单管理** | ✅ 已实现 | P0 | orders, order_items, services | orders.html, order-detail.html |
| ✅ **任务管理** | ✅ 已实现 | P0 | tasks | tasks.html |
| 📝 **客户案例** | ✅ 已实现 | P0 | customer_cases | cases.html |
| 📋 **方案模板** | ✅ 已实现 | P1 | solution_templates | templates.html |
| 📄 **客户模板** | ✅ 已实现 | P1 | customer_profile_templates | customer-profile-templates.html |
| 📑 **任务模板** | ✅ 已实现 | P1 | task_templates | task-templates.html |
| 🏢 **组织管理** | ✅ 已实现 | P1 | organizations | organizations.html, franchisees.html |
| 👤 **用户角色** | ✅ 已实现 | P1 | users, roles, permissions, user_roles, role_permissions | users.html, roles.html |
| ⚙️ **系统设置** | ✅ 已实现 | P1 | - | settings.html |

---

## 💾 数据库设计

### 核心表（17张）

<details>
<summary>点击展开查看表清单</summary>

1. **organizations** - 机构表（总部/加盟商/门店）
2. **users** - 用户表
3. **roles** - 角色表
4. **user_roles** - 用户角色关联表
5. **permissions** - 权限表
6. **role_permissions** - 角色权限关联表
7. **customers** - 客户表
8. **customer_diagnoses** - 客户诊断表
9. **customer_cases** - 客户案例表
10. **customer_profile_templates** - 客户资料模板表 ⭐ 新增
11. **services** - 服务项目表
12. **orders** - 订单表
13. **order_items** - 订单明细表
14. **tasks** - 任务表
15. **task_templates** - 任务模板表 ⭐ 新增
16. **solution_templates** - 方案模板表
17. **operation_logs** - 操作日志表

</details>

### 数据库特性

- ✅ MySQL 8.0
- ✅ 字符集：utf8mb4（支持emoji）
- ✅ 引擎：InnoDB（支持事务）
- ✅ 软删除机制
- ✅ 审计字段（created_at, updated_at, created_by）
- ✅ 多租户隔离（org_id字段）
- ✅ JSON字段支持（标签、扩展数据）

---

## 🔐 权限体系

### 预设角色（7个）

| 角色 | 数据权限范围 | 典型场景 |
|-----|------------|---------|
| 超级管理员 | all - 全部数据 | 系统维护、数据导出 |
| 平台管理员 | all - 全部数据 | 加盟商管理、全局配置 |
| 加盟商管理员 | org - 本机构数据 | 管理多个门店 |
| 门店店长 | store - 本门店数据 | 单店运营 |
| 美容顾问 | self - 自己的客户 | 客户服务 |
| 美容师 | self - 分配的订单 | 服务执行 |
| 财务人员 | org - 本机构财务 | 对账结算 |

---

## 🏗️ 技术架构

### 推荐技术栈

**后端**：
- Node.js 18+ + Express
- MySQL2（数据库驱动）
- JWT（Token认证）
- bcrypt（密码加密）

**前端**：
- HTML5 + CSS3 + JavaScript ES6+
- Tailwind CSS（已集成）
- Lucide Icons（已集成）
- 原生Canvas图表（已实现）

**数据库**：
- MySQL 8.0（阿里云RDS）
- Redis 6.0+（缓存/会话）

**存储**：
- 阿里云OSS（图片/文件）

**部署**：
- 阿里云ECS + RDS + OSS
- Nginx（负载均衡）
- PM2（进程管理）

---

## 📈 数据规模估算

### 3年规划

| 数据类型 | 年增长量 | 3年总量 |
|---------|---------|--------|
| 加盟商 | 50家/年 | 150家 |
| 门店 | 200家/年 | 600家 |
| 员工账号 | 1000个/年 | 3000个 |
| 客户 | 50000个/年 | 150000个 |
| 订单 | 500000笔/年 | 1500000笔 |
| 任务 | 200000条/年 | 600000条 |

---

## 🔌 API接口

### 已实现的API端点（10个模块）

所有API接口基于RESTful规范设计，默认端口为 `3000`。

#### 1. 组织管理 `/api/organizations`
- `GET /api/organizations` - 获取组织列表
- `GET /api/organizations/:id` - 获取组织详情
- `POST /api/organizations` - 创建组织
- `PUT /api/organizations/:id` - 更新组织
- `DELETE /api/organizations/:id` - 删除组织

#### 2. 用户管理 `/api/users`
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户
- `PUT /api/users/:id/password` - 修改用户密码

#### 3. 角色管理 `/api/roles`
- `GET /api/roles` - 获取角色列表
- `GET /api/roles/:id` - 获取角色详情
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色

#### 4. 加盟商管理 `/api/franchisees`
- `GET /api/franchisees` - 获取加盟商列表
- `GET /api/franchisees/:id` - 获取加盟商详情
- `POST /api/franchisees` - 创建加盟商
- `PUT /api/franchisees/:id` - 更新加盟商
- `DELETE /api/franchisees/:id` - 删除加盟商

#### 5. 客户案例 `/api/cases`
- `GET /api/cases` - 获取案例列表
- `GET /api/cases/:id` - 获取案例详情
- `POST /api/cases` - 创建案例
- `PUT /api/cases/:id` - 更新案例
- `DELETE /api/cases/:id` - 删除案例

#### 6. 订单管理 `/api/orders`
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id` - 更新订单
- `DELETE /api/orders/:id` - 删除订单

#### 7. 方案模板 `/api/solution-templates`
- `GET /api/solution-templates` - 获取方案模板列表
- `GET /api/solution-templates/:id` - 获取模板详情
- `POST /api/solution-templates` - 创建模板
- `PUT /api/solution-templates/:id` - 更新模板
- `DELETE /api/solution-templates/:id` - 删除模板

#### 8. 客户模板 `/api/customer-profile-templates`
- `GET /api/customer-profile-templates` - 获取客户模板列表
- `GET /api/customer-profile-templates/:id` - 获取模板详情
- `POST /api/customer-profile-templates` - 创建模板
- `PUT /api/customer-profile-templates/:id` - 更新模板
- `DELETE /api/customer-profile-templates/:id` - 删除模板

#### 9. 任务模板 `/api/task-templates`
- `GET /api/task-templates` - 获取任务模板列表
- `GET /api/task-templates/:id` - 获取模板详情
- `POST /api/task-templates` - 创建模板
- `PUT /api/task-templates/:id` - 更新模板
- `DELETE /api/task-templates/:id` - 删除模板

#### 10. AI接口 `/api/ai`
- `POST /api/ai/analyze` - AI分析接口
- `POST /api/ai/recommend` - AI推荐接口

### API通用规范

**请求头**：
```
Content-Type: application/json
Authorization: Bearer {token}
```

**响应格式**：
```json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "操作成功"
}
```

**分页参数**：
- `page` - 页码（默认1）
- `pageSize` - 每页数量（默认20）
- `search` - 搜索关键词
- `org_id` - 组织ID（数据隔离）

---

## 🚀 部署状态

### 生产环境 ✅

**服务器信息**：
- 地址：http://8.210.246.101:5002
- 部署时间：2025-12-04
- 服务状态：运行中

**服务配置**：
- **前端**：Nginx（端口5002）
- **后端API**：Node.js + Express（端口3000）
- **进程管理**：PM2（beauty-crm-backend）
- **数据库**：MySQL 8.0（阿里云RDS）
- **数据库名**：beautydb
- **当前组织数**：3个

**部署方式**：
```bash
# 使用部署脚本
./deploy.sh

# 或手动部署
npm run deploy
```

详细部署文档请参考：[DEPLOYMENT.md](../DEPLOYMENT.md)

---

## 📈 开发计划

### MVP版本（V1.0）- ✅ 已完成

**核心功能**：
- [x] 需求分析完成
- [x] 系统设计完成
- [x] 数据库设计完成
- [x] 后端API开发（10个模块）
- [x] 前端功能开发（25个页面）
- [x] 生产环境部署
- [x] 数据看板
- [x] 客户管理
- [x] 订单管理
- [x] 任务管理
- [x] 客户案例
- [x] 方案模板
- [x] 客户模板
- [x] 任务模板
- [x] 组织管理
- [x] 用户角色管理
- [x] 系统设置

**部署状态**：✅ 已部署到生产环境（http://8.210.246.101:5002）

### 增强版本（V2.0）- 6个月

- [ ] 会员卡/套餐系统
- [ ] 营销活动管理
- [ ] 财务结算模块
- [ ] 移动端App
- [ ] BI数据分析

### 完整版本（V3.0）- 12个月

- [ ] AI智能诊断
- [ ] 供应链管理
- [ ] 微信小程序
- [ ] 开放平台API

---

## 📝 文档更新记录

| 日期 | 版本 | 更新内容 | 更新人 |
|-----|------|---------|--------|
| 2025-12-01 | v1.0 | 初始版本：需求分析、系统设计、数据库设计 | Claude |
| 2025-12-04 | v2.0 | 更新项目状态：添加新模块、API文档、部署状态 | Claude Code |

**主要更新**（v2.0）：
- ✅ 更新模块数量：7个 → 10个
- ✅ 更新HTML页面：13个 → 25个
- ✅ 更新数据库表：15张 → 17张
- ✅ 新增API文档：10个模块、50+个接口
- ✅ 新增部署状态：生产环境运行信息
- ✅ 更新开发计划：MVP已完成并部署
- ✅ 新增模块：客户模板、任务模板、用户角色管理

---

## 🔗 相关资源

### 项目文件

```
美业客户后台/
├── docs/                          # 📚 文档目录
│   ├── README.md                  # 本文件
│   ├── 需求分析.md                # 需求分析文档
│   ├── 系统设计.md                # 系统设计文档
│   ├── 数据库表结构说明.md        # 数据库详细说明
│   ├── CODE_DOC_MAPPING.md        # 代码文档映射
│   └── 工作日志-*.md              # 工作日志
├── database/                      # 💾 数据库目录
│   ├── init.sql                   # 数据库初始化脚本
│   ├── customer-profile-templates-design.sql  # 客户模板表设计
│   ├── task-templates-design.sql  # 任务模板表设计
│   ├── orders-design.sql          # 订单表设计
│   ├── db.config.example.js       # 数据库配置示例
│   └── *.js                       # 数据库管理脚本
├── api/                           # 🔌 后端API目录
│   ├── server.js                  # 服务器启动文件
│   ├── app.js                     # Express应用配置
│   ├── routes/                    # API路由目录
│   │   ├── organizations.js       # 组织管理API
│   │   ├── users.js               # 用户管理API
│   │   ├── roles.js               # 角色管理API
│   │   ├── franchisees.js         # 加盟商API
│   │   ├── cases.js               # 客户案例API
│   │   ├── orders.js              # 订单管理API
│   │   ├── solution-templates.js  # 方案模板API
│   │   ├── customer-profile-templates.js  # 客户模板API
│   │   ├── task-templates.js      # 任务模板API
│   │   └── ai.js                  # AI接口
│   └── models/                    # 数据模型目录
├── css/                           # 🎨 样式文件
│   ├── styles.css
│   └── mobile-optimizations.css
├── js/                            # 📜 JavaScript文件
│   ├── utils.js
│   ├── db.js
│   ├── api.js                     # API调用封装
│   └── mobile-gestures.js
├── *.html                         # 📄 前端页面（25个）
│   ├── index.html                 # 数据看板
│   ├── customers.html             # 客户管理
│   ├── customer-detail.html       # 客户详情
│   ├── orders.html                # 订单管理
│   ├── order-detail.html          # 订单详情
│   ├── tasks.html                 # 任务管理
│   ├── cases.html                 # 客户案例
│   ├── templates.html             # 方案模板
│   ├── customer-profile-templates.html  # 客户模板 ⭐
│   ├── task-templates.html        # 任务模板 ⭐
│   ├── organizations.html         # 组织管理 ⭐
│   ├── franchisees.html           # 加盟管理
│   ├── users.html                 # 用户管理 ⭐
│   ├── roles.html                 # 角色管理 ⭐
│   ├── settings.html              # 系统设置
│   └── test-*.html                # 测试页面
├── deploy.sh                      # 🚀 部署脚本
├── ecosystem.config.js            # PM2配置文件
├── DEPLOYMENT.md                  # 部署文档
└── package.json                   # 项目配置
```

### 外部参考

- [MySQL 8.0 官方文档](https://dev.mysql.com/doc/refman/8.0/en/)
- [RESTful API设计指南](https://restfulapi.net/)
- [WCAG 2.1 无障碍标准](https://www.w3.org/WAI/WCAG21/quickref/)
- [阿里云RDS使用指南](https://help.aliyun.com/product/26090.html)

---

## ⚠️ 重要提示

### 安全注意事项

1. **立即修改默认密码**：数据库初始化后的admin账号密码为 `admin123`，务必立即修改！
2. **敏感数据加密**：手机号、身份证号使用AES加密存储
3. **SQL注入防护**：务必使用参数化查询，禁止SQL拼接
4. **XSS防护**：输出数据时进行HTML转义

### 数据库配置

1. 复制 `database/db.config.example.js` 为 `db.config.js`
2. 填写阿里云RDS连接信息
3. 执行 `database/init.sql` 初始化数据库
4. 测试数据库连接

### 前端说明

- 前端已完成移动端优化（95分水平）
- 支持响应式布局
- 所有HTML页面已引入 `mobile-optimizations.css`
- 触摸手势功能可选集成

---

## 📞 支持与反馈

如有问题或建议，请联系项目负责人。

---

**文档版本**：v2.0
**最后更新**：2025-12-04
**维护团队**：美业CRM开发团队
**生产环境**：http://8.210.246.101:5002
