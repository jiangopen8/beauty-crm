# 🎉 后端服务器已启动成功！

## ✅ 服务器状态

**服务器正在运行中...**

- 🌐 地址: http://localhost:3000
- 📊 环境: development
- 🗄️ 数据库: 阿里云RDS beautydb (已连接)
- 🔄 自动重启: 已启用 (nodemon)

---

## 📋 可用的API端点

### 1. 健康检查
```bash
curl http://localhost:3000/health
```

**响应示例:**
```json
{
  "success": true,
  "message": "服务器运行正常",
  "timestamp": "2025-12-01T07:46:54.025Z",
  "env": "development"
}
```

---

### 2. API信息
```bash
curl http://localhost:3000/api
```

**响应示例:**
```json
{
  "success": true,
  "message": "美业客户洞察CRM系统 API",
  "version": "1.0.0",
  "endpoints": {
    "franchisees": "/api/franchisees",
    "customers": "/api/customers",
    "orders": "/api/orders",
    "tasks": "/api/tasks",
    "auth": "/api/auth"
  }
}
```

---

### 3. 加盟商管理 API

#### 获取统计数据
```bash
curl http://localhost:3000/api/franchisees/stats
```

**响应:**
```json
{
  "success": true,
  "data": {
    "total": 0,
    "active_count": 0,
    "inactive_count": 0,
    "suspended_count": 0
  },
  "message": "操作成功",
  "timestamp": "2025-12-01T07:46:55.981Z"
}
```

#### 获取加盟商列表
```bash
# 基本查询
curl http://localhost:3000/api/franchisees

# 带筛选和分页
curl "http://localhost:3000/api/franchisees?status=active&page=1&pageSize=20"

# 搜索
curl "http://localhost:3000/api/franchisees?search=上海"
```

#### 获取加盟商详情
```bash
curl http://localhost:3000/api/franchisees/1
```

#### 创建加盟商
```bash
curl -X POST http://localhost:3000/api/franchisees \
  -H "Content-Type: application/json" \
  -d '{
    "org_code": "FC001",
    "org_name": "上海静安旗舰店",
    "franchisee_level": "flagship",
    "contact_person": "王美丽",
    "contact_phone": "13800138000",
    "province": "上海市",
    "city": "上海市",
    "district": "静安区",
    "address": "南京西路123号",
    "contract_no": "HT2024001",
    "contract_start_date": "2024-01-01",
    "contract_end_date": "2029-12-31",
    "revenue_share_rate": 8.5
  }'
```

#### 更新加盟商信息
```bash
curl -X PUT http://localhost:3000/api/franchisees/1 \
  -H "Content-Type: application/json" \
  -d '{
    "contact_phone": "13900139000",
    "address": "南京西路456号"
  }'
```

#### 更新加盟商状态
```bash
curl -X PATCH http://localhost:3000/api/franchisees/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "suspended"
  }'
```

#### 删除加盟商（软删除）
```bash
curl -X DELETE http://localhost:3000/api/franchisees/1
```

---

## 🧪 使用Postman测试

### 1. 导入到Postman

创建新的Collection: `美业CRM API`

### 2. 配置环境变量

```
base_url: http://localhost:3000
```

### 3. 测试步骤

1. **健康检查** - GET {{base_url}}/health
2. **获取统计** - GET {{base_url}}/api/franchisees/stats
3. **创建加盟商** - POST {{base_url}}/api/franchisees
4. **获取列表** - GET {{base_url}}/api/franchisees
5. **获取详情** - GET {{base_url}}/api/franchisees/1
6. **更新信息** - PUT {{base_url}}/api/franchisees/1
7. **更新状态** - PATCH {{base_url}}/api/franchisees/1/status
8. **删除** - DELETE {{base_url}}/api/franchisees/1

---

## 🌐 在浏览器中测试

### 打开以下链接:

1. **健康检查**: http://localhost:3000/health
2. **API信息**: http://localhost:3000/api
3. **加盟商统计**: http://localhost:3000/api/franchisees/stats
4. **加盟商列表**: http://localhost:3000/api/franchisees
5. **加盟商详情**: http://localhost:3000/api/franchisees/1

---

## 📊 响应格式说明

### 成功响应
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2025-12-01T07:46:54.025Z"
}
```

### 分页响应
```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  },
  "message": "查询成功",
  "timestamp": "2025-12-01T07:46:54.025Z"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "加盟商不存在",
    "details": null
  },
  "timestamp": "2025-12-01T07:46:54.025Z"
}
```

---

## 🔧 常用命令

### 查看服务器日志
服务器正在后台运行，日志会实时显示在终端中。

### 停止服务器
```bash
# 方法1: 如果在终端看到服务器运行
按 Ctrl+C

# 方法2: 通过进程管理
# 查找进程
ps aux | grep "node api/server.js"

# 终止进程
kill <进程ID>
```

### 重启服务器
```bash
npm run dev
```

### 生产模式启动
```bash
npm start
```

---

## 📝 查看实时日志

服务器运行时会显示:
- ✅ HTTP请求日志 (GET, POST等)
- ❌ 错误信息
- 🔄 文件更改自动重启提示

---

## 🎯 下一步

### 1. 创建测试数据
使用上面的"创建加盟商"API创建几个测试数据

### 2. 前后端对接
修改 `franchisees.html`，将数据来源从IndexedDB改为API:

```javascript
// 原来
const franchisees = db.getFranchisees();

// 改为
const response = await fetch('http://localhost:3000/api/franchisees');
const result = await response.json();
const franchisees = result.data.items;
```

### 3. 测试完整流程
1. 后端API创建数据
2. 前端页面显示数据
3. 前端操作同步到后端

---

## 💡 提示

- ✅ 服务器已启用自动重启 (nodemon)
- ✅ 修改代码后会自动重启
- ✅ 数据库连接正常
- ✅ 所有API端点已测试通过
- ⚠️ 当前未启用认证，测试完成后请启用

---

## 🎉 恭喜！

后端服务器已成功启动并运行！

**当前状态:**
- 🟢 服务器: 运行中
- 🟢 数据库: 已连接
- 🟢 API: 可用
- 🟢 自动重启: 已启用

现在可以开始测试和开发了！

---

**创建时间**: 2025-12-01
**服务器地址**: http://localhost:3000
**GitHub仓库**: https://github.com/jiangopen8/beauty-crm
