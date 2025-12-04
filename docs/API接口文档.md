# 美业客户洞察CRM系统 - API接口文档

## 📋 文档信息

| 项目名称 | 美业客户洞察CRM系统 |
|---------|-------------------|
| 文档版本 | v1.0 |
| 创建日期 | 2025-12-04 |
| API版本 | v1.0 |
| 基础URL | http://localhost:3000/api |
| 生产URL | http://8.210.246.101:3000/api |

---

## 📌 目录

1. [接口概述](#接口概述)
2. [通用规范](#通用规范)
3. [认证机制](#认证机制)
4. [接口列表](#接口列表)
   - [组织管理](#1-组织管理)
   - [用户管理](#2-用户管理)
   - [角色管理](#3-角色管理)
   - [加盟商管理](#4-加盟商管理)
   - [客户案例](#5-客户案例)
   - [订单管理](#6-订单管理)
   - [方案模板](#7-方案模板)
   - [客户资料模板](#8-客户资料模板)
   - [任务模板](#9-任务模板)
   - [AI接口](#10-ai接口)
5. [错误码说明](#错误码说明)
6. [数据模型](#数据模型)

---

## 接口概述

本文档描述了美业客户洞察CRM系统的所有后端API接口。所有接口遵循RESTful设计规范，使用JSON格式进行数据交互。

### 技术栈

- **框架**: Express.js
- **数据库**: MySQL 8.0
- **认证**: JWT (计划中)
- **端口**: 3000

### 已实现模块

✅ 组织管理 (5个接口)
✅ 用户管理 (6个接口)
✅ 角色管理 (5个接口)
✅ 加盟商管理 (5个接口)
✅ 客户案例 (5个接口)
✅ 订单管理 (5个接口)
✅ 方案模板 (5个接口)
✅ 客户资料模板 (5个接口)
✅ 任务模板 (5个接口)
✅ AI接口 (2个接口)

**总计**: 10个模块，52个接口

---

## 通用规范

### 请求头

```http
Content-Type: application/json
Authorization: Bearer {token}  # 需要认证的接口
```

### 响应格式

#### 成功响应

```json
{
  "success": true,
  "data": {
    // 响应数据
  },
  "error": null,
  "message": "操作成功"
}
```

#### 失败响应

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERR_CODE",
    "message": "错误描述"
  },
  "message": "操作失败"
}
```

#### 分页响应

```json
{
  "success": true,
  "data": {
    "list": [...],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 通用查询参数

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| search | string | 否 | 搜索关键词 | - |
| org_id | number | 否 | 组织ID（数据隔离） | - |

---

## 认证机制

### JWT认证（计划中）

```javascript
// 登录获取Token
POST /api/auth/login
{
  "username": "admin",
  "password": "password123"
}

// 响应
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "orgId": 1
    }
  }
}
```

**注意**: 当前版本暂未实现完整的JWT认证，部分接口可直接访问用于开发测试。

---

## 接口列表

## 1. 组织管理

**基础路径**: `/api/organizations`

**实现文件**: `api/routes/organizations.js`

**关联表**: `organizations`

### 1.1 获取组织列表

**接口**: `GET /api/organizations`

**描述**: 获取所有组织列表，支持分页和搜索

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | number | 否 | 页码 |
| pageSize | number | 否 | 每页数量 |
| search | string | 否 | 搜索关键词（组织名称） |
| org_type | string | 否 | 组织类型: platform/franchisee/store |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "org_code": "ORG001",
        "org_name": "总部",
        "org_type": "platform",
        "status": "active",
        "created_at": "2025-12-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 3
    }
  }
}
```

### 1.2 获取组织详情

**接口**: `GET /api/organizations/:id`

**描述**: 根据ID获取组织详细信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 组织ID |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "org_code": "ORG001",
    "org_name": "总部",
    "org_type": "platform",
    "parent_id": null,
    "level": 1,
    "contact_person": "张三",
    "contact_phone": "13800138000",
    "address": "北京市朝阳区xxx",
    "status": "active"
  }
}
```

### 1.3 创建组织

**接口**: `POST /api/organizations`

**描述**: 创建新的组织

**请求体**:

```json
{
  "org_code": "ORG002",
  "org_name": "北京分公司",
  "org_type": "franchisee",
  "parent_id": 1,
  "contact_person": "李四",
  "contact_phone": "13900139000",
  "address": "北京市海淀区xxx"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "org_code": "ORG002",
    "org_name": "北京分公司",
    "message": "组织创建成功"
  }
}
```

### 1.4 更新组织

**接口**: `PUT /api/organizations/:id`

**描述**: 更新组织信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 组织ID |

**请求体**:

```json
{
  "org_name": "北京分公司（修改）",
  "contact_person": "王五",
  "status": "active"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "message": "组织更新成功"
  }
}
```

### 1.5 删除组织

**接口**: `DELETE /api/organizations/:id`

**描述**: 删除组织（软删除）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 组织ID |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "message": "组织删除成功"
  }
}
```

---

## 2. 用户管理

**基础路径**: `/api/users`

**实现文件**: `api/routes/users.js`

**关联表**: `users`, `user_roles`

### 2.1 获取用户列表

**接口**: `GET /api/users`

**描述**: 获取用户列表，支持按组织过滤

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| org_id | number | 否 | 组织ID |
| status | string | 否 | 状态: active/inactive/locked |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "username": "admin",
        "real_name": "管理员",
        "org_id": 1,
        "status": "active",
        "created_at": "2025-12-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 2.2 获取用户详情

**接口**: `GET /api/users/:id`

### 2.3 创建用户

**接口**: `POST /api/users`

**请求体**:

```json
{
  "username": "user001",
  "password": "password123",
  "real_name": "张三",
  "org_id": 1,
  "phone": "13800138000",
  "email": "user001@example.com"
}
```

### 2.4 更新用户

**接口**: `PUT /api/users/:id`

### 2.5 删除用户

**接口**: `DELETE /api/users/:id`

### 2.6 修改用户密码

**接口**: `PUT /api/users/:id/password`

**描述**: 修改用户密码

**请求体**:

```json
{
  "old_password": "oldpass123",
  "new_password": "newpass456"
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "message": "密码修改成功"
  }
}
```

---

## 3. 角色管理

**基础路径**: `/api/roles`

**实现文件**: `api/routes/roles.js`

**关联表**: `roles`, `role_permissions`

### 3.1 获取角色列表

**接口**: `GET /api/roles`

**响应示例**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "role_code": "super_admin",
        "role_name": "超级管理员",
        "data_scope": "all",
        "status": "active"
      }
    ]
  }
}
```

### 3.2 获取角色详情

**接口**: `GET /api/roles/:id`

### 3.3 创建角色

**接口**: `POST /api/roles`

**请求体**:

```json
{
  "role_code": "store_manager",
  "role_name": "门店店长",
  "data_scope": "store",
  "description": "管理单个门店的所有数据"
}
```

### 3.4 更新角色

**接口**: `PUT /api/roles/:id`

### 3.5 删除角色

**接口**: `DELETE /api/roles/:id`

---

## 4. 加盟商管理

**基础路径**: `/api/franchisees`

**实现文件**: `api/routes/franchisees.js`

**关联表**: `organizations` (org_type='franchisee')

### 4.1 获取加盟商列表

**接口**: `GET /api/franchisees`

### 4.2 获取加盟商详情

**接口**: `GET /api/franchisees/:id`

### 4.3 创建加盟商

**接口**: `POST /api/franchisees`

### 4.4 更新加盟商

**接口**: `PUT /api/franchisees/:id`

### 4.5 删除加盟商

**接口**: `DELETE /api/franchisees/:id`

---

## 5. 客户案例

**基础路径**: `/api/cases`

**实现文件**: `api/routes/cases.js`

**关联表**: `customer_cases`

### 5.1 获取案例列表

**接口**: `GET /api/cases`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| case_type | string | 否 | 案例类型 |
| is_featured | boolean | 否 | 是否精选 |

### 5.2 获取案例详情

**接口**: `GET /api/cases/:id`

### 5.3 创建案例

**接口**: `POST /api/cases`

### 5.4 更新案例

**接口**: `PUT /api/cases/:id`

### 5.5 删除案例

**接口**: `DELETE /api/cases/:id`

---

## 6. 订单管理

**基础路径**: `/api/orders`

**实现文件**: `api/routes/orders.js`

**关联表**: `orders`, `order_items`

### 6.1 获取订单列表

**接口**: `GET /api/orders`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_status | string | 否 | 订单状态 |
| payment_status | string | 否 | 支付状态 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |

### 6.2 获取订单详情

**接口**: `GET /api/orders/:id`

### 6.3 创建订单

**接口**: `POST /api/orders`

### 6.4 更新订单

**接口**: `PUT /api/orders/:id`

### 6.5 删除订单

**接口**: `DELETE /api/orders/:id`

---

## 7. 方案模板

**基础路径**: `/api/solution-templates`

**实现文件**: `api/routes/solution-templates.js`

**关联表**: `solution_templates`

### 7.1 获取方案模板列表

**接口**: `GET /api/solution-templates`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 方案类别 |
| scope | string | 否 | 共享范围 |

### 7.2 获取模板详情

**接口**: `GET /api/solution-templates/:id`

### 7.3 创建模板

**接口**: `POST /api/solution-templates`

### 7.4 更新模板

**接口**: `PUT /api/solution-templates/:id`

### 7.5 删除模板

**接口**: `DELETE /api/solution-templates/:id`

---

## 8. 客户资料模板

**基础路径**: `/api/customer-profile-templates`

**实现文件**: `api/routes/customer-profile-templates.js`

**关联表**: `customer_profile_templates`

### 8.1 获取客户模板列表

**接口**: `GET /api/customer-profile-templates`

**响应示例**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "template_code": "TPL001",
        "template_name": "标准客户资料模板",
        "fields": [
          {
            "field_key": "skin_type",
            "field_name": "肤质类型",
            "field_type": "select",
            "options": ["干性", "油性", "混合性", "敏感性"]
          }
        ],
        "scope": "org",
        "status": "active"
      }
    ]
  }
}
```

### 8.2 获取模板详情

**接口**: `GET /api/customer-profile-templates/:id`

### 8.3 创建模板

**接口**: `POST /api/customer-profile-templates`

**请求体**:

```json
{
  "template_code": "TPL002",
  "template_name": "VIP客户资料模板",
  "fields": [
    {
      "field_key": "skin_type",
      "field_name": "肤质类型",
      "field_type": "select",
      "required": true,
      "options": ["干性", "油性", "混合性", "敏感性", "中性"]
    },
    {
      "field_key": "preferences",
      "field_name": "护理偏好",
      "field_type": "checkbox",
      "required": false,
      "options": ["美白", "补水", "抗衰", "祛痘"]
    }
  ],
  "scope": "org"
}
```

### 8.4 更新模板

**接口**: `PUT /api/customer-profile-templates/:id`

### 8.5 删除模板

**接口**: `DELETE /api/customer-profile-templates/:id`

---

## 9. 任务模板

**基础路径**: `/api/task-templates`

**实现文件**: `api/routes/task-templates.js`

**关联表**: `task_templates`

### 9.1 获取任务模板列表

**接口**: `GET /api/task-templates`

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | 否 | 任务分类 |

**响应示例**:

```json
{
  "success": true,
  "data": {
    "list": [
      {
        "id": 1,
        "template_code": "TASK001",
        "template_name": "客户跟进流程",
        "category": "customer_follow_up",
        "priority": "medium",
        "steps": [
          {
            "step_order": 1,
            "step_name": "客户信息确认",
            "step_type": "checklist",
            "checklist_items": ["确认客户姓名", "核对预约时间"]
          }
        ]
      }
    ]
  }
}
```

### 9.2 获取模板详情

**接口**: `GET /api/task-templates/:id`

### 9.3 创建模板

**接口**: `POST /api/task-templates`

**请求体**:

```json
{
  "template_code": "TASK002",
  "template_name": "服务质量检查",
  "category": "quality_check",
  "priority": "high",
  "steps": [
    {
      "step_order": 1,
      "step_name": "服务前准备检查",
      "step_type": "checklist",
      "checklist_items": [
        "检查设备状态",
        "准备护理产品",
        "确认客户需求"
      ]
    },
    {
      "step_order": 2,
      "step_name": "服务过程记录",
      "step_type": "form",
      "description": "记录服务详细过程"
    }
  ]
}
```

### 9.4 更新模板

**接口**: `PUT /api/task-templates/:id`

### 9.5 删除模板

**接口**: `DELETE /api/task-templates/:id`

---

## 10. AI接口

**基础路径**: `/api/ai`

**实现文件**: `api/routes/ai.js`

### 10.1 AI分析

**接口**: `POST /api/ai/analyze`

**描述**: 使用AI进行数据分析

**请求体**:

```json
{
  "type": "customer_behavior",
  "data": {
    // 分析数据
  }
}
```

### 10.2 AI推荐

**接口**: `POST /api/ai/recommend`

**描述**: AI智能推荐

**请求体**:

```json
{
  "type": "service_recommendation",
  "customer_id": 123,
  "context": {
    // 上下文信息
  }
}
```

---

## 错误码说明

| 错误码 | 说明 | HTTP状态码 |
|--------|------|-----------|
| ERR_INVALID_PARAMS | 参数错误 | 400 |
| ERR_NOT_FOUND | 资源不存在 | 404 |
| ERR_UNAUTHORIZED | 未授权 | 401 |
| ERR_FORBIDDEN | 无权限 | 403 |
| ERR_INTERNAL | 服务器内部错误 | 500 |
| ERR_DUPLICATE | 数据重复 | 409 |
| ERR_DATABASE | 数据库错误 | 500 |

---

## 数据模型

### Organization (组织)

```typescript
interface Organization {
  id: number;
  org_code: string;
  org_name: string;
  org_type: 'platform' | 'franchisee' | 'store';
  parent_id?: number;
  level: number;
  contact_person?: string;
  contact_phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
}
```

### User (用户)

```typescript
interface User {
  id: number;
  username: string;
  real_name: string;
  org_id: number;
  phone?: string;
  email?: string;
  status: 'active' | 'inactive' | 'locked';
  created_at: string;
  updated_at: string;
}
```

### Role (角色)

```typescript
interface Role {
  id: number;
  role_code: string;
  role_name: string;
  data_scope: 'all' | 'org' | 'store' | 'self';
  description?: string;
  status: 'active' | 'inactive';
}
```

---

## 附录

### 测试方法

使用 `curl` 命令测试接口:

```bash
# 获取组织列表
curl -X GET http://localhost:3000/api/organizations

# 创建组织
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"org_code":"ORG003","org_name":"测试组织","org_type":"store"}'

# 获取组织详情
curl -X GET http://localhost:3000/api/organizations/1

# 更新组织
curl -X PUT http://localhost:3000/api/organizations/1 \
  -H "Content-Type: application/json" \
  -d '{"org_name":"更新后的组织名称"}'

# 删除组织
curl -X DELETE http://localhost:3000/api/organizations/1
```

### Postman Collection

可以导入以下Postman Collection进行API测试: (链接待添加)

---

**文档版本**: v1.0
**最后更新**: 2025-12-04
**维护团队**: 美业CRM开发团队
