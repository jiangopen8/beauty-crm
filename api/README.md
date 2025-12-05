# 美业CRM系统 - 后端目录结构说明

## 📂 项目目录结构

```
D:\work6\美业客户后台\
├── api/                        # 后端API代码目录 ⭐ 新建
│   ├── config/                 # 配置文件
│   │   ├── db.js              # 数据库配置（引用database/db.config.js）
│   │   └── constants.js       # 常量定义
│   │
│   ├── controllers/            # 控制器层（处理HTTP请求）
│   │   ├── authController.js         # 用户认证（登录/登出/注册）
│   │   ├── franchiseeController.js   # 加盟商管理 ⭐ 核心
│   │   ├── customerController.js     # 客户管理
│   │   ├── orderController.js        # 订单管理
│   │   ├── taskController.js         # 任务管理
│   │   ├── templateController.js     # 方案模板
│   │   └── statsController.js        # 数据统计
│   │
│   ├── models/                 # 数据模型层（数据库操作）
│   │   ├── Franchisee.js      # 加盟商模型
│   │   ├── Customer.js         # 客户模型
│   │   ├── Order.js            # 订单模型
│   │   ├── User.js             # 用户模型
│   │   └── Task.js             # 任务模型
│   │
│   ├── routes/                 # 路由层（API路由定义）
│   │   ├── auth.js             # 认证路由: /api/auth/*
│   │   ├── franchisees.js      # 加盟商路由: /api/franchisees/*
│   │   ├── customers.js        # 客户路由: /api/customers/*
│   │   ├── orders.js           # 订单路由: /api/orders/*
│   │   ├── tasks.js            # 任务路由: /api/tasks/*
│   │   ├── templates.js        # 模板路由: /api/templates/*
│   │   ├── stats.js            # 统计路由: /api/stats/*
│   │   └── index.js            # 路由汇总（引入所有路由）
│   │
│   ├── middleware/             # 中间件
│   │   ├── auth.js             # JWT身份验证
│   │   ├── permission.js       # 权限检查
│   │   ├── validator.js        # 请求参数验证
│   │   ├── errorHandler.js     # 统一错误处理
│   │   └── logger.js           # 日志记录
│   │
│   ├── services/               # 业务逻辑层
│   │   ├── franchiseeService.js   # 加盟商业务逻辑
│   │   ├── customerService.js     # 客户业务逻辑
│   │   ├── orderService.js        # 订单业务逻辑
│   │   └── authService.js         # 认证业务逻辑
│   │
│   ├── utils/                  # 工具函数
│   │   ├── response.js         # 统一响应格式
│   │   ├── jwt.js              # JWT工具
│   │   ├── crypto.js           # 加密工具
│   │   └── validator.js        # 验证工具
│   │
│   ├── app.js                  # Express应用主文件
│   └── server.js               # 服务器启动文件
│
├── database/                   # 数据库相关（已存在）
│   ├── db.config.js           # 数据库连接配置
│   ├── init.sql               # 初始化SQL脚本
│   ├── init-db.js             # 数据库初始化脚本
│   ├── test-connection.js     # 连接测试
│   └── verify-tables.js       # 表结构验证
│
├── docs/                       # 文档（已存在）
│   ├── 需求分析.md
│   ├── 系统设计.md
│   ├── 数据库表结构说明.md
│   └── ...
│
├── css/                        # 前端样式（已存在）
├── js/                         # 前端脚本（已存在）
├── *.html                      # 前端页面（已存在）
│
├── .env                        # 环境配置（已存在）
├── .gitignore                  # Git忽略文件
├── package.json                # 项目依赖
└── README.md                   # 项目说明
```

---

## 🎯 目录职责说明

### 1. **api/config/** - 配置目录
存放应用配置、常量定义

**文件说明：**
- `db.js` - 数据库连接配置（引用database/db.config.js）
- `constants.js` - 业务常量（状态码、枚举值等）

### 2. **api/controllers/** - 控制器目录
处理HTTP请求，调用Service层，返回响应

**命名规范：** `xxxController.js`

**示例：**
```javascript
// franchiseeController.js
exports.getFranchisees = async (req, res, next) => {
    try {
        const franchisees = await franchiseeService.getList(req.query);
        res.json(success(franchisees));
    } catch (error) {
        next(error);
    }
};
```

### 3. **api/models/** - 数据模型目录
封装数据库操作（CRUD）

**命名规范：** `Xxx.js`（首字母大写）

**示例：**
```javascript
// Franchisee.js
class Franchisee {
    static async findAll(filters) {
        // 数据库查询逻辑
    }

    static async findById(id) {
        // ...
    }

    static async create(data) {
        // ...
    }
}
```

### 4. **api/routes/** - 路由目录
定义API路由和对应的控制器方法

**命名规范：** `xxx.js`（复数形式）

**示例：**
```javascript
// franchisees.js
const router = require('express').Router();
const franchiseeController = require('../controllers/franchiseeController');
const auth = require('../middleware/auth');

router.get('/', auth.verify, franchiseeController.getFranchisees);
router.get('/:id', auth.verify, franchiseeController.getFranchiseeById);
router.post('/', auth.verify, franchiseeController.createFranchisee);

module.exports = router;
```

### 5. **api/middleware/** - 中间件目录
请求拦截、验证、日志等

**文件说明：**
- `auth.js` - JWT验证
- `permission.js` - 权限检查
- `validator.js` - 参数验证
- `errorHandler.js` - 错误处理
- `logger.js` - 日志记录

### 6. **api/services/** - 业务逻辑目录
复杂业务逻辑处理，调用Model层

**命名规范：** `xxxService.js`

**示例：**
```javascript
// franchiseeService.js
class FranchiseeService {
    async getList(filters) {
        // 业务逻辑：权限过滤、数据处理等
        const franchisees = await Franchisee.findAll(filters);
        return this.formatFranchiseeList(franchisees);
    }
}
```

### 7. **api/utils/** - 工具函数目录
通用工具函数、辅助方法

**文件说明：**
- `response.js` - 统一响应格式
- `jwt.js` - JWT生成和验证
- `crypto.js` - 加密解密
- `validator.js` - 数据验证

---

## 📊 API分层架构

```
HTTP请求
    ↓
路由层 (routes/)         → 定义URL和HTTP方法
    ↓
中间件 (middleware/)     → 认证、权限、验证
    ↓
控制器层 (controllers/)  → 处理请求，调用Service
    ↓
服务层 (services/)       → 业务逻辑处理
    ↓
模型层 (models/)         → 数据库操作
    ↓
数据库 (MySQL RDS)
```

---

## 🚀 API端点规划

### 加盟商管理 API（franchisees.html）

| 方法 | 路径 | 说明 | 控制器方法 |
|-----|------|------|-----------|
| GET | `/api/franchisees` | 获取加盟商列表 | `getFranchisees` |
| GET | `/api/franchisees/:id` | 获取加盟商详情 | `getFranchiseeById` |
| POST | `/api/franchisees` | 创建加盟商 | `createFranchisee` |
| PUT | `/api/franchisees/:id` | 更新加盟商信息 | `updateFranchisee` |
| DELETE | `/api/franchisees/:id` | 删除加盟商 | `deleteFranchisee` |
| GET | `/api/franchisees/stats` | 获取统计数据 | `getStats` |

### 客户管理 API（customers.html）

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/customers` | 获取客户列表 |
| GET | `/api/customers/:id` | 获取客户详情 |
| POST | `/api/customers` | 创建客户 |
| PUT | `/api/customers/:id` | 更新客户 |
| DELETE | `/api/customers/:id` | 删除客户 |

### 订单管理 API（orders.html）

| 方法 | 路径 | 说明 |
|-----|------|------|
| GET | `/api/orders` | 获取订单列表 |
| GET | `/api/orders/:id` | 获取订单详情 |
| POST | `/api/orders` | 创建订单 |
| PUT | `/api/orders/:id` | 更新订单状态 |

### 认证 API

| 方法 | 路径 | 说明 |
|-----|------|------|
| POST | `/api/auth/login` | 用户登录 |
| POST | `/api/auth/logout` | 用户登出 |
| POST | `/api/auth/refresh` | 刷新Token |
| GET | `/api/auth/me` | 获取当前用户信息 |

---

## 📦 需要安装的依赖

```bash
# 核心框架
npm install express

# 中间件
npm install cors              # 跨域支持
npm install body-parser       # 请求体解析（Express 4.16+已内置）
npm install morgan            # HTTP请求日志

# 认证相关
npm install jsonwebtoken      # JWT
npm install bcryptjs          # 密码加密

# 验证相关
npm install joi               # 数据验证
npm install express-validator # Express验证中间件

# 工具
npm install dotenv            # 环境变量（已安装）
npm install mysql2            # MySQL驱动（已安装）

# 开发工具
npm install --save-dev nodemon  # 自动重启
```

---

## 🔧 环境配置（.env）

```env
# 应用配置
APP_NAME=美业客户洞察CRM系统
APP_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

# 数据库配置
DB_HOST=rm-m5ej7x6xf3yb5876hao.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=beautydba
DB_PASSWORD=Shujuku1979
DB_NAME=beautydb
DB_CHARSET=utf8mb4
DB_TIMEZONE=+08:00

# JWT配置
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS配置
CORS_ORIGIN=*
```

---

## 📋 package.json scripts建议

```json
{
  "scripts": {
    "start": "node api/server.js",
    "dev": "nodemon api/server.js",
    "db:test": "node database/test-connection.js",
    "db:init": "node database/init-db.js",
    "db:verify": "node database/verify-tables.js"
  }
}
```

---

## 🎯 下一步开发计划

### 阶段一：基础框架搭建
1. ✅ 创建目录结构
2. ⏳ 安装Express和必要依赖
3. ⏳ 创建 `app.js` 和 `server.js`
4. ⏳ 配置中间件（CORS、body-parser等）
5. ⏳ 创建统一响应格式

### 阶段二：认证模块
1. ⏳ 实现JWT工具函数
2. ⏳ 创建认证中间件
3. ⏳ 实现登录/登出API
4. ⏳ 测试认证流程

### 阶段三：加盟商管理API
1. ⏳ 创建Franchisee模型
2. ⏳ 创建franchiseeController
3. ⏳ 创建franchisees路由
4. ⏳ 测试API接口

### 阶段四：前后端对接
1. ⏳ 修改 `franchisees.html` 使用API
2. ⏳ 实现登录页面
3. ⏳ 测试完整流程

---

## 📚 参考资料

- [Express官方文档](https://expressjs.com/)
- [JWT官方网站](https://jwt.io/)
- [MySQL2文档](https://github.com/sidorares/node-mysql2)
- [Joi验证库](https://joi.dev/)

---

## 💡 开发建议

### 1. 代码规范
- 使用 ES6+ 语法
- 统一使用 async/await
- 控制器方法必须有try-catch
- 所有API返回统一格式

### 2. 错误处理
```javascript
// 统一错误响应格式
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "参数验证失败",
        "details": {...}
    }
}
```

### 3. 成功响应
```javascript
// 统一成功响应格式
{
    "success": true,
    "data": {...},
    "message": "操作成功"
}
```

### 4. 分页格式
```javascript
{
    "success": true,
    "data": {
        "items": [...],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 100,
            "totalPages": 5
        }
    }
}
```

---

**创建时间**: 2025-12-01
**维护者**: 美业CRM开发团队
**文档版本**: v1.0
