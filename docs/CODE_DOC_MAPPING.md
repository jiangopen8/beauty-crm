# 代码-文档映射表

## 📋 文档信息

| 项目名称 | 美业客户洞察CRM系统 |
|---------|-------------------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-12-01 |
| 用途 | 建立代码文件与文档章节的映射关系 |

---

## 一、HTML页面映射

### 1.1 核心业务页面

| HTML文件 | 功能名称 | 功能描述 | 对应文档章节 | 数据表 | 状态 |
|---------|---------|---------|-------------|--------|------|
| **index.html** | 数据看板 | 展示核心经营指标、趋势图表、业绩对比 | 需求分析.md#2.2.6 | orders, customers, tasks | ✅ 已完成 |
| **customers.html** | 客户列表 | 客户信息管理、搜索筛选、标签管理 | 需求分析.md#2.2.1 | customers | ✅ 已完成 |
| **customer-detail.html** | 客户详情 | 客户完整信息、诊断记录、服务历史 | 需求分析.md#2.2.1 | customers, customer_diagnoses, customer_cases | ✅ 已完成 |
| **orders.html** | 订单列表 | 订单管理、状态筛选、统计分析 | 需求分析.md#2.2.2 | orders, order_items | ✅ 已完成 |
| **order-detail.html** | 订单详情 | 订单完整信息、服务项目、支付记录 | 需求分析.md#2.2.2 | orders, order_items, services | ✅ 已完成 |
| **tasks.html** | 任务管理 | 任务列表、分配、状态跟踪、提醒 | 需求分析.md#2.2.3 | tasks | ✅ 已完成 |
| **templates.html** | 方案模板 | 护理方案模板库、分类管理、使用统计 | 需求分析.md#2.2.4 | solution_templates | ✅ 已完成 |
| **cases.html** | 客户案例 | 成功案例展示、前后对比、效果说明 | 需求分析.md#2.2.1 | customer_cases | ✅ 已完成 |
| **franchisees.html** | 加盟商管理 | 加盟商信息、业绩统计、合同管理 | 需求分析.md#2.2.5 | organizations | ✅ 已完成 |
| **settings.html** | 系统设置 | 用户管理、角色权限、品牌设置 | 需求分析.md#2.2.7 | users, roles, permissions | ✅ 已完成 |

### 1.2 辅助页面

| HTML文件 | 功能名称 | 功能描述 | 用途 | 状态 |
|---------|---------|---------|------|------|
| **data-validation.html** | 数据验证 | IndexedDB数据验证和调试 | 开发调试 | ✅ 已完成 |
| **clear-data.html** | 数据清理 | 清除本地IndexedDB数据 | 开发调试 | ✅ 已完成 |
| **mobile-gestures-demo.html** | 手势演示 | 移动端触摸手势功能演示 | 功能演示 | ✅ 已完成 |
| **test-detail.html** | 详情测试 | 详情页面布局测试 | 开发测试 | ✅ 已完成 |
| **test-data-check.html** | 数据检查 | IndexedDB数据检查工具 | 开发测试 | ✅ 已完成 |

---

## 二、JavaScript模块映射

### 2.1 核心工具库

| JS文件 | 模块名称 | 主要功能 | 对应文档章节 | 依赖 |
|-------|---------|---------|-------------|------|
| **js/utils.js** | 工具函数库 | 日期格式化、数据验证、防抖节流、导出功能 | 系统设计.md#6.3 | 无 |
| **js/db.js** | 数据库操作 | IndexedDB封装、数据CRUD、查询接口 | 系统设计.md#二 | 无 |
| **js/mobile-gestures.js** | 移动端手势 | 触摸手势识别、滑动操作、手势事件 | 需求分析.md#3.3 | 无 |

### 2.2 功能模块（页面内嵌）

| 页面 | 模块功能 | 技术要点 |
|-----|---------|---------|
| **index.html** | 图表渲染（Canvas原生）、实时数据更新 | Canvas API、统计算法 |
| **customers.html** | 客户列表渲染、搜索筛选、分页 | IndexedDB查询、前端分页 |
| **customer-detail.html** | 客户信息编辑、诊断记录管理 | 表单验证、数据联动 |
| **orders.html** | 订单列表、状态管理、导出 | 状态机、Excel导出 |
| **tasks.html** | 任务分配、提醒设置 | 日期计算、本地通知 |

---

## 三、数据库表映射

### 3.1 组织机构相关

| 表名 | 中文名称 | 对应文档章节 | 关联页面 | 关键字段 |
|-----|---------|-------------|---------|---------|
| **organizations** | 机构表 | 系统设计.md#2.2.1 | franchisees.html | org_code, org_type, parent_id |
| **users** | 用户表 | 系统设计.md#2.2.2 | settings.html | username, org_id, password_hash |
| **roles** | 角色表 | 系统设计.md#2.2.2 | settings.html | role_code, data_scope |
| **user_roles** | 用户角色关联表 | 系统设计.md#2.2.2 | settings.html | user_id, role_id |
| **permissions** | 权限表 | 系统设计.md#2.2.2 | settings.html | permission_code, resource_type |
| **role_permissions** | 角色权限关联表 | 系统设计.md#2.2.2 | settings.html | role_id, permission_id |

### 3.2 客户管理相关

| 表名 | 中文名称 | 对应文档章节 | 关联页面 | 关键字段 |
|-----|---------|-------------|---------|---------|
| **customers** | 客户表 | 系统设计.md#2.2.3 | customers.html, customer-detail.html | customer_no, phone, member_level |
| **customer_diagnoses** | 客户诊断表 | 系统设计.md#2.2.3 | customer-detail.html | customer_id, skin_type, diagnose_date |
| **customer_cases** | 客户案例表 | 系统设计.md#2.2.3 | cases.html, customer-detail.html | customer_id, case_type, is_featured |

### 3.3 订单管理相关

| 表名 | 中文名称 | 对应文档章节 | 关联页面 | 关键字段 |
|-----|---------|-------------|---------|---------|
| **orders** | 订单表 | 系统设计.md#2.2.4 | orders.html, order-detail.html | order_no, customer_id, order_status |
| **order_items** | 订单明细表 | 系统设计.md#2.2.4 | order-detail.html | order_id, service_id, quantity |
| **services** | 服务项目表 | 系统设计.md#2.2.4 | order-detail.html, templates.html | service_code, category, standard_price |

### 3.4 任务与模板

| 表名 | 中文名称 | 对应文档章节 | 关联页面 | 关键字段 |
|-----|---------|-------------|---------|---------|
| **tasks** | 任务表 | 系统设计.md#2.2.5 | tasks.html | task_no, assigned_to, status |
| **solution_templates** | 方案模板表 | 系统设计.md#2.2.6 | templates.html | template_code, category, scope |

### 3.5 系统日志

| 表名 | 中文名称 | 对应文档章节 | 关联页面 | 关键字段 |
|-----|---------|-------------|---------|---------|
| **operation_logs** | 操作日志表 | 系统设计.md#2.2.7 | - | user_id, module, action |

---

## 四、API接口映射（规划）

### 4.1 认证接口

| 接口路径 | HTTP方法 | 功能 | 对应文档章节 | 关联表 |
|---------|---------|------|-------------|--------|
| `/api/v1/auth/login` | POST | 用户登录 | 系统设计.md#3.2.1 | users |
| `/api/v1/auth/logout` | POST | 用户登出 | 系统设计.md#3.2.1 | - |
| `/api/v1/auth/refresh` | POST | 刷新Token | 系统设计.md#3.2.1 | - |

### 4.2 客户管理接口

| 接口路径 | HTTP方法 | 功能 | 对应文档章节 | 关联表 |
|---------|---------|------|-------------|--------|
| `/api/v1/customers` | GET | 获取客户列表 | 系统设计.md#3.2.2 | customers |
| `/api/v1/customers` | POST | 创建客户 | 系统设计.md#3.2.2 | customers |
| `/api/v1/customers/:id` | GET | 获取客户详情 | 系统设计.md#3.2.2 | customers, customer_diagnoses |
| `/api/v1/customers/:id` | PUT | 更新客户 | 系统设计.md#3.2.2 | customers |
| `/api/v1/customers/:id` | DELETE | 删除客户 | 系统设计.md#3.2.2 | customers |
| `/api/v1/customers/:id/diagnoses` | GET | 获取诊断记录 | 系统设计.md#3.2.2 | customer_diagnoses |
| `/api/v1/customers/:id/cases` | GET | 获取客户案例 | 系统设计.md#3.2.2 | customer_cases |

### 4.3 订单管理接口

| 接口路径 | HTTP方法 | 功能 | 对应文档章节 | 关联表 |
|---------|---------|------|-------------|--------|
| `/api/v1/orders` | GET | 获取订单列表 | 系统设计.md#3.2.3 | orders |
| `/api/v1/orders` | POST | 创建订单 | 系统设计.md#3.2.3 | orders, order_items |
| `/api/v1/orders/:id` | GET | 获取订单详情 | 系统设计.md#3.2.3 | orders, order_items |
| `/api/v1/orders/:id/status` | PUT | 更新订单状态 | 系统设计.md#3.2.3 | orders |

### 4.4 数据统计接口

| 接口路径 | HTTP方法 | 功能 | 对应文档章节 | 关联表 |
|---------|---------|------|-------------|--------|
| `/api/v1/dashboard/overview` | GET | 获取首页看板数据 | 系统设计.md#3.2.4 | orders, customers, tasks |
| `/api/v1/statistics/performance` | GET | 获取业绩统计 | 系统设计.md#3.2.4 | orders |

---

## 五、CSS样式映射

### 5.1 样式文件

| CSS文件 | 功能 | 关联页面 | 特性 |
|--------|------|---------|------|
| **css/styles.css** | 全局样式 | 所有页面 | 基础布局、通用组件 |
| **css/mobile-optimizations.css** | 移动端优化 | 所有页面 | 响应式布局、触摸优化 |

### 5.2 使用的CSS框架

| 框架/库 | 版本 | 引入方式 | 用途 |
|--------|------|---------|------|
| **Tailwind CSS** | 3.3+ | CDN | 原子化CSS工具类 |
| **Lucide Icons** | latest | CDN | 图标库 |

---

## 六、功能-文档交叉索引

### 6.1 按功能查找文档

#### 客户管理

- **需求说明**：需求分析.md#2.2.1
- **界面实现**：customers.html, customer-detail.html
- **数据库设计**：系统设计.md#2.2.3
- **ER图**：ER图设计.md（customers, customer_diagnoses, customer_cases）
- **API接口**：系统设计.md#3.2.2

#### 订单管理

- **需求说明**：需求分析.md#2.2.2
- **界面实现**：orders.html, order-detail.html
- **数据库设计**：系统设计.md#2.2.4
- **ER图**：ER图设计.md（orders, order_items, services）
- **API接口**：系统设计.md#3.2.3

#### 任务管理

- **需求说明**：需求分析.md#2.2.3
- **界面实现**：tasks.html
- **数据库设计**：系统设计.md#2.2.5
- **ER图**：ER图设计.md（tasks）

#### 加盟商管理

- **需求说明**：需求分析.md#2.2.5
- **界面实现**：franchisees.html
- **数据库设计**：系统设计.md#2.2.1
- **ER图**：ER图设计.md（organizations）

#### 权限管理

- **需求说明**：需求分析.md#2.2.7
- **界面实现**：settings.html
- **权限设计**：系统设计.md#四
- **数据库设计**：系统设计.md#2.2.2
- **ER图**：ER图设计.md（users, roles, permissions）

### 6.2 按文档查找代码

#### 需求分析.md

| 章节 | 对应代码文件 |
|-----|------------|
| 2.2.1 客户管理 | customers.html, customer-detail.html, cases.html |
| 2.2.2 订单管理 | orders.html, order-detail.html |
| 2.2.3 任务管理 | tasks.html |
| 2.2.4 方案模板 | templates.html |
| 2.2.5 加盟商管理 | franchisees.html |
| 2.2.6 数据看板 | index.html |
| 2.2.7 系统设置 | settings.html |

#### 系统设计.md

| 章节 | 对应代码文件 |
|-----|------------|
| 2.2.1 organizations表 | database/init.sql, franchisees.html |
| 2.2.2 users/roles/permissions表 | database/init.sql, settings.html |
| 2.2.3 customers表 | database/init.sql, customers.html |
| 2.2.4 orders表 | database/init.sql, orders.html |
| 2.2.5 tasks表 | database/init.sql, tasks.html |
| 3.2 API接口设计 | （后端代码，待开发） |
| 6.3 性能优化 | js/utils.js（防抖节流） |

#### ER图设计.md

| ER图实体 | 对应SQL表 | 对应页面 |
|---------|----------|---------|
| organizations | database/init.sql | franchisees.html |
| users | database/init.sql | settings.html |
| customers | database/init.sql | customers.html |
| orders | database/init.sql | orders.html |
| tasks | database/init.sql | tasks.html |

---

## 七、开发流程映射

### 7.1 新增功能的代码-文档同步流程

```mermaid
graph TD
    A[需求确定] --> B[更新需求分析.md]
    B --> C[设计数据库表]
    C --> D[更新系统设计.md]
    D --> E[更新ER图设计.md]
    E --> F[开发HTML页面]
    F --> G[开发JS逻辑]
    G --> H[更新CODE_DOC_MAPPING.md]
    H --> I[测试验证]
    I --> J[更新README.md状态]
    J --> K[提交代码和文档]
```

### 7.2 修改功能的同步流程

```mermaid
graph TD
    A[修改需求/Bug] --> B{影响范围}
    B -->|前端页面| C[修改HTML/CSS/JS]
    B -->|数据库| D[修改init.sql]
    B -->|API接口| E[修改后端代码]
    C --> F[更新相关文档]
    D --> F
    E --> F
    F --> G[运行sync-docs.js check]
    G --> H[提交变更]
```

---

## 八、文档维护清单

### 8.1 新增HTML页面时

- [ ] 更新本文档"HTML页面映射"章节
- [ ] 更新需求分析.md中的功能清单
- [ ] 更新README.md（如需要）
- [ ] 运行 `node scripts/sync-docs.js check`

### 8.2 新增数据表时

- [ ] 更新系统设计.md中的表结构设计
- [ ] 更新ER图设计.md中的ER图
- [ ] 更新本文档"数据库表映射"章节
- [ ] 更新README.md中的核心表清单

### 8.3 新增API接口时

- [ ] 更新系统设计.md中的接口设计章节
- [ ] 更新本文档"API接口映射"章节
- [ ] 编写接口使用示例

### 8.4 功能完成时

- [ ] 更新需求分析.md中的功能状态
- [ ] 更新README.md中的开发计划
- [ ] 更新本文档中的状态标识

---

## 九、快速查找指南

### 9.1 我想找...

**客户管理相关的所有资料**
- 需求：需求分析.md#2.2.1
- 页面：customers.html, customer-detail.html, cases.html
- 数据表：customers, customer_diagnoses, customer_cases
- 文档章节：系统设计.md#2.2.3

**订单相关的数据库设计**
- SQL脚本：database/init.sql（搜索 "CREATE TABLE orders"）
- 设计文档：系统设计.md#2.2.4
- ER图：ER图设计.md

**权限控制的实现方案**
- 设计文档：系统设计.md#四
- 数据表：roles, permissions, user_roles, role_permissions
- 页面：settings.html

**移动端优化的说明**
- 需求：需求分析.md#3.3
- CSS：css/mobile-optimizations.css
- JS：js/mobile-gestures.js
- 演示：mobile-gestures-demo.html

### 9.2 常用搜索关键词

| 关键词 | 对应资源 |
|-------|---------|
| "客户" | customers.html, customers表, 需求分析.md#2.2.1 |
| "订单" | orders.html, orders表, 需求分析.md#2.2.2 |
| "任务" | tasks.html, tasks表, 需求分析.md#2.2.3 |
| "加盟商" | franchisees.html, organizations表 |
| "权限" | settings.html, roles/permissions表, 系统设计.md#四 |
| "RBAC" | 系统设计.md#4.1, ER图设计.md#2 |
| "多租户" | 系统设计.md#2.1, 需求分析.md#2.3 |

---

## 十、更新日志

| 日期 | 版本 | 更新内容 | 更新人 |
|-----|------|---------|--------|
| 2025-12-01 | v1.0 | 初始版本：建立完整的代码-文档映射关系 | Claude |

---

**文档版本**：v1.0
**最后更新**：2025-12-01
**维护团队**：美业CRM开发团队

**说明**：本文档会随着项目开发持续更新，请保持与代码同步。
