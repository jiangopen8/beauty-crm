# 客户案例 API 接口文档

## 基础信息

**Base URL**: `http://localhost:3000/api/cases`

**认证方式**: 暂无（待实现 JWT）

**响应格式**: JSON

---

## 接口列表

### 1. 获取案例列表

**请求**:
```
GET /api/cases
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| org_id | number | ✅ | 组织ID（多租户隔离） |
| page | number | ❌ | 页码，默认1 |
| pageSize | number | ❌ | 每页数量，默认10 |
| case_type | string | ❌ | 案例类型: `skin_care`, `hair_care`, `body_care`, `other` |
| is_featured | boolean | ❌ | 是否精选: `true`, `false` |
| keyword | string | ❌ | 搜索关键词（标题、客户名称、问题描述） |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "customer_id": 1,
        "org_id": 1,
        "case_title": "敏感肌修复成功案例",
        "case_type": "skin_care",
        "initial_problems": "客户描述...",
        "results": "治疗效果...",
        "customer_name": "张小姐",
        "customer_phone": "13800138000",
        "is_featured": 1,
        "is_public": 0,
        "created_at": "2025-12-02T11:28:17.000Z",
        "updated_at": "2025-12-02T11:28:17.000Z"
      }
    ],
    "total": 3,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "MISSING_ORG_ID",
    "message": "缺少组织ID参数"
  }
}
```

---

### 2. 获取案例详情

**请求**:
```
GET /api/cases/:id
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 案例ID |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "customer_id": 1,
    "org_id": 1,
    "case_title": "敏感肌修复成功案例",
    "case_type": "skin_care",
    "service_period": "3个月",
    "service_frequency": "每周2次",
    "initial_problems": "客户描述...",
    "treatment_plan": "治疗方案...",
    "products_used": ["产品A", "产品B"],
    "results": "治疗效果...",
    "before_photos": ["url1", "url2"],
    "after_photos": ["url3", "url4"],
    "customer_feedback": "客户评价...",
    "satisfaction_score": 5,
    "is_featured": 1,
    "is_public": 0,
    "display_order": 0,
    "customer_name": "张小姐",
    "customer_phone": "13800138000",
    "created_at": "2025-12-02T11:28:17.000Z",
    "updated_at": "2025-12-02T11:28:17.000Z"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "CASE_NOT_FOUND",
    "message": "案例不存在"
  }
}
```

---

### 3. 创建案例

**请求**:
```
POST /api/cases
Content-Type: application/json
```

**请求体**:
```json
{
  "customer_id": 1,
  "org_id": 1,
  "case_title": "敏感肌修复成功案例",
  "case_type": "skin_care",
  "service_period": "3个月",
  "service_frequency": "每周2次",
  "initial_problems": "客户描述...",
  "treatment_plan": "治疗方案...",
  "products_used": ["产品A", "产品B"],
  "results": "治疗效果...",
  "before_photos": ["url1"],
  "after_photos": ["url2"],
  "customer_feedback": "很满意",
  "satisfaction_score": 5,
  "is_featured": 0,
  "is_public": 0,
  "display_order": 0
}
```

**字段说明**:
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| customer_id | number | ✅ | 客户ID（外键） |
| org_id | number | ✅ | 组织ID |
| case_title | string | ✅ | 案例标题（最长200字符） |
| case_type | string | ❌ | 案例类型，默认 `other` |
| service_period | string | ❌ | 服务周期，如"3个月" |
| service_frequency | string | ❌ | 服务频次，如"每周2次" |
| initial_problems | text | ❌ | 初始问题描述 |
| treatment_plan | text | ❌ | 治疗方案 |
| products_used | array | ❌ | 使用产品列表 |
| results | text | ❌ | 效果说明 |
| before_photos | array | ❌ | 前照片URLs |
| after_photos | array | ❌ | 后照片URLs |
| customer_feedback | text | ❌ | 客户评价 |
| satisfaction_score | number | ❌ | 满意度评分（1-5） |
| is_featured | boolean | ❌ | 是否精选，默认 0 |
| is_public | boolean | ❌ | 是否公开，默认 0 |
| display_order | number | ❌ | 展示顺序，默认 0 |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "案例创建成功"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMS",
    "message": "缺少必填字段：org_id 和 case_title 是必填的"
  }
}
```

---

### 4. 更新案例

**请求**:
```
PUT /api/cases/:id
Content-Type: application/json
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 案例ID |

**请求体**: （同创建接口，所有字段都是可选的）
```json
{
  "case_title": "更新后的标题",
  "results": "更新后的效果说明"
}
```

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "case_title": "更新后的标题",
    ...
  },
  "message": "案例更新成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "UPDATE_FAILED",
    "message": "案例更新失败"
  }
}
```

---

### 5. 更新精选状态

**请求**:
```
PATCH /api/cases/:id/featured
Content-Type: application/json
```

**请求体**:
```json
{
  "is_featured": true
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "精选状态更新成功"
}
```

---

### 6. 更新公开状态

**请求**:
```
PATCH /api/cases/:id/public
Content-Type: application/json
```

**请求体**:
```json
{
  "is_public": true
}
```

**成功响应** (200):
```json
{
  "success": true,
  "message": "公开状态更新成功"
}
```

---

### 7. 删除案例（软删除）

**请求**:
```
DELETE /api/cases/:id
```

**路径参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 案例ID |

**成功响应** (200):
```json
{
  "success": true,
  "message": "案例删除成功"
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "DELETE_FAILED",
    "message": "删除失败"
  }
}
```

---

### 8. 获取统计信息

**请求**:
```
GET /api/cases/stats?org_id=1
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| org_id | number | ✅ | 组织ID |

**成功响应** (200):
```json
{
  "success": true,
  "data": {
    "total": 10,
    "featured_count": "3",
    "public_count": "5",
    "today_count": "2"
  }
}
```

**字段说明**:
- `total`: 案例总数
- `featured_count`: 精选案例数
- `public_count`: 公开案例数
- `today_count`: 今日新增案例数

---

## 错误代码说明

| 错误代码 | 说明 |
|----------|------|
| MISSING_ORG_ID | 缺少组织ID参数 |
| CASE_NOT_FOUND | 案例不存在 |
| INVALID_PARAMS | 无效的请求参数 |
| UPDATE_FAILED | 更新失败 |
| DELETE_FAILED | 删除失败 |
| INTERNAL_ERROR | 服务器内部错误 |

---

## 注意事项

1. **多租户隔离**: 所有请求都需要提供 `org_id`，确保数据隔离
2. **软删除**: 删除操作不会物理删除数据，只是标记 `is_deleted = 1`
3. **外键约束**: 创建案例时 `customer_id` 必须存在于 `customers` 表中
4. **JSON 字段**: `products_used`, `before_photos`, `after_photos` 会自动序列化/反序列化

---

**文档版本**: v1.0
**更新日期**: 2025-12-02
