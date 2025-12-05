# 🚀 快速启动指南 - 美业CRM系统

**最后更新**: 2025-12-02
**项目版本**: v1.2.0

---

## 一、快速启动服务

### 启动后端服务 (必做)
```bash
cd D:\work6\美业客户后台
npm start
```

**预期输出**:
```
✅ 数据库连接成功
✅ 服务器运行中...
   环境: development
   端口: 3000
   地址: http://localhost:3000
```

### 停止服务
```
Ctrl + C
```

---

## 二、访问系统页面

### 主要功能页面
```
http://localhost:3000/settings.html     # 系统设置 ⭐ (最新完成)
http://localhost:3000/users.html        # 用户管理
http://localhost:3000/franchisees.html  # 加盟商管理
```

### 测试账号
```
用户名: admin, manager_sh, consultant_wang ...
密码: 123456 (所有账号统一)
默认组织: ID=7 (上海静安旗舰店)
```

---

## 三、最新功能 (2025-12-02完成)

### ✅ 组织切换功能
**位置**: settings.html → "组织切换"标签页

**功能说明**:
- 查看所有可用组织列表
- 一键切换到不同组织
- 查看当前组织信息
- 创建/编辑/删除组织
- 设置自动保存到localStorage

**使用方法**:
1. 打开系统设置页面
2. 点击"组织切换"标签
3. 查看组织列表
4. 点击"切换"按钮
5. 确认后页面自动刷新

### ✅ 主题配置功能
**位置**: settings.html → "系统配置"标签页

**功能说明**:
- **5种主题色**:
  - 紫色渐变 (默认) - 优雅专业
  - 粉色渐变 - 活力时尚
  - 蓝色渐变 - 科技现代
  - 绿色渐变 - 清新自然
  - 橙色渐变 - 温暖热情

- **2种显示模式**:
  - 浅色模式 - 日间使用
  - 深色模式 - 夜间护眼

**使用方法**:
1. 打开系统设置页面
2. 点击"系统配置"标签
3. 点击任意颜色块切换主题
4. 点击"浅色/深色模式"切换
5. 设置立即生效,自动保存

---

## 四、下次工作重点

### 🔴 优先级1: 安全认证 (最重要)
- [ ] 实现JWT认证系统
- [ ] 添加登录/登出功能
- [ ] 组织访问权限控制
- [ ] API接口权限验证

### 🟡 优先级2: UI优化
- [ ] 创建/编辑组织改用模态框
- [ ] 深色模式细节完善
- [ ] 添加主题色预览功能
- [ ] 优化错误提示样式

### 🟢 优先级3: 数据验证
- [ ] 删除组织前检查关联数据
- [ ] 表单验证完善
- [ ] 输入格式验证
- [ ] 数据一致性检查

---

## 五、关键文件位置

```
D:\work6\美业客户后台\
├── settings.html              # 系统设置 ⭐ (本次重点修改)
├── users.html                 # 用户管理 (已完成)
├── franchisees.html           # 加盟商管理 (已完成)
├── js/
│   ├── api.js                 # API封装(已有organizationAPI)
│   ├── utils.js               # 工具函数
│   └── db.js                  # 数据库配置
├── api/
│   ├── server.js              # Express服务器
│   ├── models/User.js         # 用户模型
│   └── routes/users.js        # 用户路由
├── database/
│   ├── db.config.js           # 数据库配置
│   ├── test-connection.js     # 测试连接
│   └── create-test-users.js   # 创建测试数据
├── docs/
│   ├── 工作日志-2025-12-01-用户管理模块.md
│   └── 工作日志-2025-12-02-组织切换与主题配置.md  ← 详细上下文
└── QUICK_START.md             # 本文件
```

---

## 六、常用命令速查

### 开发命令
```bash
npm start                      # 启动后端服务
Ctrl + C                      # 停止服务
node -v                       # 查看Node版本
npm -v                        # 查看npm版本
```

### 数据库测试
```bash
node database/test-connection.js      # 测试数据库连接
node database/create-test-users.js    # 创建测试用户
```

### 生产部署
```bash
# SSH连接服务器
ssh root@8.210.246.101

# 上传文件
scp settings.html root@8.210.246.101:/var/www/beauty-crm/

# 重启PM2服务
ssh root@8.210.246.101 "pm2 restart beauty-crm-backend"

# 查看PM2日志
ssh root@8.210.246.101 "pm2 logs beauty-crm-backend"
```

### Git操作
```bash
git status                    # 查看状态
git add .                     # 添加所有文件
git commit -m "完成组织切换功能"  # 提交
git push                      # 推送到远程
```

---

## 七、调试技巧

### 浏览器控制台 (F12)
```javascript
// 查看当前组织
localStorage.getItem('currentOrgId')
localStorage.getItem('currentOrgName')

// 查看主题设置
localStorage.getItem('theme_color')
localStorage.getItem('display_mode')

// 测试组织API
await organizationAPI.getList()
await organizationAPI.getById(7)

// 清除localStorage
localStorage.clear()
```

### 后端调试
```bash
# 查看端口占用
netstat -ano | findstr :3000

# 杀死进程
taskkill /PID <进程ID> /F

# 测试API
curl http://localhost:3000/api/organizations
curl http://localhost:3000/api/users?org_id=7
```

---

## 八、故障排除

### ❌ 问题1: 数据库连接失败
**症状**: 启动时显示数据库连接错误

**解决方法**:
```bash
# 1. 检查环境变量
cat .env

# 2. 测试数据库连接
node database/test-connection.js

# 3. 检查数据库密码是否正确
# 编辑 .env 文件,确认 DB_PASSWORD
```

### ❌ 问题2: 端口3000被占用
**症状**: Error: listen EADDRINUSE :::3000

**解决方法**:
```bash
# Windows查看占用端口的进程
netstat -ano | findstr :3000

# 杀死进程 (替换<PID>为实际进程ID)
taskkill /PID <PID> /F

# 或者修改端口
# 编辑 api/server.js,将 3000 改为其他端口
```

### ❌ 问题3: 组织列表加载失败
**症状**: 页面显示"获取组织列表失败"

**解决方法**:
```bash
# 1. 检查后端API是否正常
curl http://localhost:3000/api/organizations

# 2. 查看浏览器控制台错误 (F12)
# 3. 检查数据库中是否有组织数据
# 4. 查看后端日志
```

### ❌ 问题4: 主题色不生效
**症状**: 点击主题色没有变化

**解决方法**:
1. 清除浏览器缓存 (Ctrl + F5)
2. 检查localStorage: `localStorage.getItem('theme_color')`
3. 检查CSS变量是否正确加载
4. 查看控制台是否有JS错误

---

## 九、LocalStorage数据说明

### 组织相关
```javascript
currentOrgId: "7"              // 当前组织ID
currentOrgName: "上海静安旗舰店"  // 当前组织名称
```

### 主题相关
```javascript
theme_color: "purple"          // 主题色: purple|pink|blue|green|orange
display_mode: "light"          // 显示模式: light|dark
ui_scale: "100"                // UI缩放: 80-120
```

### 其他设置
```javascript
org_logo: "data:image/..."     // 组织Logo (base64)
```

---

## 十、重要文档链接

### 📚 工作日志
1. [2025-12-01 用户管理模块](./docs/工作日志-2025-12-01-用户管理模块.md)
   - 用户管理功能完整实现
   - API路由问题修复
   - 数据库查询优化

2. [2025-12-02 组织切换与主题配置](./docs/工作日志-2025-12-02-组织切换与主题配置.md) ⭐
   - 组织切换功能详解
   - 主题配置系统
   - 关键代码位置索引
   - **推荐重点阅读**

### 📖 主题功能文档
- [主题配置使用说明](./主题配置使用说明.md)
- [主题功能测试清单](./主题功能测试清单.md)
- [主题配置快速指南](./主题配置-快速指南.md)

### 🔧 技术文档
- [API接口文档](./api/README.md)
- [数据库设置报告](./database/DATABASE_SETUP_REPORT.md)
- [部署文档](./DEPLOYMENT.md)

---

## 十一、环境信息

### 开发环境
```
操作系统: Windows
Node.js: (运行 node -v 查看)
npm: (运行 npm -v 查看)
数据库: MySQL (阿里云RDS)
项目路径: D:\work6\美业客户后台\
```

### 数据库连接
```
Host: rm-uf6n6109o1lz3s13lso.mysql.rds.aliyuncs.com
User: daymade
Database: beautydb (开发环境)
Database: beauty_crm (生产环境)
Port: 3306
```

### 生产服务器
```
IP: 8.210.246.101
Port: 5002
PM2应用: beauty-crm-backend
路径: /var/www/beauty-crm/
```

---

## 十二、快速恢复工作流程

### 每次开始工作时:

1. **启动服务** ✅
   ```bash
   cd D:\work6\美业客户后台
   npm start
   ```

2. **验证服务** ✅
   - 访问: http://localhost:3000/settings.html
   - 检查控制台是否有错误

3. **查看上次工作** ✅
   - 阅读: `docs/工作日志-2025-12-02-组织切换与主题配置.md`
   - 了解已完成功能和待办事项

4. **选择任务** ✅
   - 参考"下次工作重点"部分
   - 优先实现JWT认证系统

### 每次结束工作时:

1. **停止服务** ✅
   ```
   Ctrl + C
   ```

2. **提交代码** ✅
   ```bash
   git add .
   git commit -m "描述本次修改"
   git push
   ```

3. **更新工作日志** ✅
   - 记录本次完成的功能
   - 记录遗留问题
   - 更新下次工作计划

---

## 🎯 立即开始

### 最快启动 (30秒)
```bash
# 1. 启动服务
cd D:\work6\美业客户后台
npm start

# 2. 打开浏览器
http://localhost:3000/settings.html

# 3. 测试功能
- 点击"组织切换"标签
- 点击"系统配置"标签,切换主题色
```

### 详细了解 (5分钟)
1. 阅读本文档 (QUICK_START.md)
2. 阅读工作日志 (docs/工作日志-2025-12-02-组织切换与主题配置.md)
3. 测试所有新功能

---

**💡 提示**:
- 详细工作上下文请查看: `docs/工作日志-2025-12-02-组织切换与主题配置.md`
- 遇到问题先查看"故障排除"部分
- 下次工作优先实现JWT认证系统

**🎊 祝工作顺利!**
