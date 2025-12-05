# 🚀 后端API快速启动指南

## ✅ 当前状态

已完成：
- ✅ 阿里云RDS数据库连接成功
- ✅ 15张数据库表已创建
- ✅ 后端API目录结构已创建
- ✅ 前端HTML页面已完成

---

## 📂 后端目录结构

```
api/
├── config/         ← 配置文件
├── controllers/    ← 控制器（处理请求）
├── models/         ← 数据模型（数据库操作）
├── routes/         ← 路由定义
├── middleware/     ← 中间件（认证、验证）
├── services/       ← 业务逻辑
├── utils/          ← 工具函数
├── app.js          ← Express应用主文件
└── server.js       ← 服务器启动文件
```

---

## 🎯 下一步：开始开发

### 步骤1：安装后端依赖

```bash
cd "D:\work6\美业客户后台"

# 安装核心依赖
npm install express cors morgan

# 安装认证相关
npm install jsonwebtoken bcryptjs

# 安装验证相关
npm install joi

# 安装开发工具
npm install --save-dev nodemon
```

### 步骤2：创建基础文件

需要创建的核心文件：

1. **api/app.js** - Express应用主文件
2. **api/server.js** - 服务器启动文件
3. **api/config/db.js** - 数据库配置
4. **api/utils/response.js** - 统一响应格式
5. **api/middleware/errorHandler.js** - 错误处理

### 步骤3：实现加盟商管理API

加盟商管理是核心功能，优先实现：

1. **api/models/Franchisee.js** - 数据库操作
2. **api/controllers/franchiseeController.js** - 请求处理
3. **api/routes/franchisees.js** - 路由定义
4. **api/services/franchiseeService.js** - 业务逻辑（可选）

### 步骤4：测试API

```bash
# 启动开发服务器
npm run dev

# 访问
http://localhost:3000/api/franchisees
```

### 步骤5：前端对接

修改 `franchisees.html`，将IndexedDB改为API调用：

```javascript
// 原来
const franchisees = db.getFranchisees();

// 改为
const response = await fetch('/api/franchisees');
const result = await response.json();
const franchisees = result.data;
```

---

## 📋 API开发优先级

### P0 - 高优先级（加盟商管理）

| 功能 | API端点 | 状态 |
|-----|---------|------|
| 获取加盟商列表 | `GET /api/franchisees` | ⏳ 待开发 |
| 获取加盟商详情 | `GET /api/franchisees/:id` | ⏳ 待开发 |
| 创建加盟商 | `POST /api/franchisees` | ⏳ 待开发 |
| 更新加盟商 | `PUT /api/franchisees/:id` | ⏳ 待开发 |
| 删除加盟商 | `DELETE /api/franchisees/:id` | ⏳ 待开发 |
| 获取统计数据 | `GET /api/franchisees/stats` | ⏳ 待开发 |

### P1 - 中优先级（认证）

| 功能 | API端点 | 状态 |
|-----|---------|------|
| 用户登录 | `POST /api/auth/login` | ⏳ 待开发 |
| 用户登出 | `POST /api/auth/logout` | ⏳ 待开发 |
| 获取当前用户 | `GET /api/auth/me` | ⏳ 待开发 |

### P2 - 低优先级（其他模块）

- 客户管理API
- 订单管理API
- 任务管理API
- 方案模板API

---

## 💻 开发命令

### 数据库相关
```bash
npm run db:test      # 测试数据库连接
npm run db:init      # 初始化数据库
npm run db:verify    # 验证表结构
```

### 后端开发
```bash
npm run dev          # 启动开发服务器（自动重启）
npm start            # 启动生产服务器
```

### 前端访问
```bash
# 方式1: 使用Python简单服务器
python -m http.server 8080

# 方式2: 使用Node.js http-server
npx http-server -p 8080

# 访问前端
http://localhost:8080/franchisees.html

# 访问API
http://localhost:3000/api/franchisees
```

---

## 📝 开发示例

### 1. 创建 app.js（Express应用）

```javascript
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 路由
app.use('/api/franchisees', require('./routes/franchisees'));

// 错误处理
app.use(require('./middleware/errorHandler'));

module.exports = app;
```

### 2. 创建 server.js（启动服务器）

```javascript
require('dotenv').config();
const app = require('./app');

const PORT = process.env.APP_PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ 服务器运行在 http://localhost:${PORT}`);
});
```

### 3. 创建 Franchisee模型

```javascript
// api/models/Franchisee.js
const db = require('../../database/db.config');

class Franchisee {
    static async findAll(filters = {}) {
        const { status, search } = filters;

        let sql = `
            SELECT * FROM organizations
            WHERE org_type = 'franchisee'
            AND is_deleted = 0
        `;

        if (status) {
            sql += ` AND status = '${status}'`;
        }

        if (search) {
            sql += ` AND (org_name LIKE '%${search}%' OR city LIKE '%${search}%')`;
        }

        return await db.query(sql);
    }

    static async findById(id) {
        const sql = `SELECT * FROM organizations WHERE id = ? AND is_deleted = 0`;
        const rows = await db.query(sql, [id]);
        return rows[0];
    }

    static async create(data) {
        const sql = `INSERT INTO organizations SET ?`;
        const result = await db.query(sql, data);
        return result.insertId;
    }
}

module.exports = Franchisee;
```

### 4. 创建控制器

```javascript
// api/controllers/franchiseeController.js
const Franchisee = require('../models/Franchisee');
const { success, error } = require('../utils/response');

exports.getFranchisees = async (req, res, next) => {
    try {
        const franchisees = await Franchisee.findAll(req.query);
        res.json(success(franchisees));
    } catch (err) {
        next(err);
    }
};

exports.getFranchiseeById = async (req, res, next) => {
    try {
        const franchisee = await Franchisee.findById(req.params.id);
        if (!franchisee) {
            return res.status(404).json(error('加盟商不存在'));
        }
        res.json(success(franchisee));
    } catch (err) {
        next(err);
    }
};
```

### 5. 创建路由

```javascript
// api/routes/franchisees.js
const router = require('express').Router();
const controller = require('../controllers/franchiseeController');

router.get('/', controller.getFranchisees);
router.get('/:id', controller.getFranchiseeById);

module.exports = router;
```

---

## 🔧 常见问题

### Q1: CORS跨域问题
```javascript
// api/app.js
app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));
```

### Q2: 端口被占用
```bash
# 修改 .env 文件
APP_PORT=3001
```

### Q3: 数据库连接失败
```bash
# 检查 .env 配置
# 测试连接
npm run db:test
```

---

## 📚 推荐学习资源

### Express框架
- [Express官方文档](https://expressjs.com/)
- [Express中文文档](https://expressjs.com/zh-cn/)

### RESTful API设计
- [RESTful API设计最佳实践](https://restfulapi.net/)
- [HTTP状态码](https://httpstatuses.com/)

### Node.js
- [Node.js官方文档](https://nodejs.org/docs/)
- [Node.js最佳实践](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎯 接下来做什么？

### 选项A：快速原型（推荐初学者）
1. 直接创建 `app.js` 和 `server.js`
2. 实现一个简单的 GET API
3. 用Postman或浏览器测试
4. 逐步完善功能

### 选项B：完整开发（推荐有经验者）
1. 先搭建完整框架（所有基础文件）
2. 实现认证模块
3. 实现加盟商管理模块
4. 前后端对接测试

### 选项C：模块化开发（推荐团队）
1. 拆分模块（加盟商、客户、订单）
2. 每个模块独立开发
3. 并行开发，最后整合

---

## ✨ 总结

✅ **后端目录已创建完成！**

**当前进度：**
- ✅ 数据库连接成功（阿里云RDS）
- ✅ 15张表已创建
- ✅ 后端目录结构已建立
- ⏳ 待开发：Express应用和API接口

**下一步：**
1. 安装依赖：`npm install express cors morgan jsonwebtoken bcryptjs joi nodemon --save-dev`
2. 创建基础文件（app.js, server.js等）
3. 实现加盟商管理API
4. 前后端对接测试

**需要帮助？**
- 查看 `api/README.md` 了解详细说明
- 参考上面的代码示例
- 随时提问！

---

**创建时间**: 2025-12-01
**维护者**: 美业CRM开发团队
