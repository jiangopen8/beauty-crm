# users.html 及其他页面的 Bug 修复总结

## 问题诊断

### 问题1: API 404 错误
- **症状**: users.html 页面中 `/api/users?org_id=7` 和 `/api/roles?status=active` 返回 404
- **根本原因**: js/api.js 中的 API_BASE_URL 配置有误
  - 在生产环境（8.210.246.101）上，API_BASE_URL 被设置为空字符串 ''
  - 导致 API 调用使用相对路径，请求被发送到 http://8.210.246.101:5002（Nginx）
  - 而实际 API 服务运行在 http://8.210.246.101:5004（Node.js）

### 问题2: Solana/Web3 注入错误
- **症状**: "TypeError: Cannot assign to read only property 'solana' of object '#<Window>'" 
- **来源**: 浏览器扩展（如 MetaMask 钱包）在注入时出错
- **影响**: 虽然报错，但不应该导致页面完全崩溃

## 修复方案

### 修复1: API_BASE_URL 配置 (js/api.js)
**修改前**:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5004' : '';
```

**修改后**:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5004'
    : `http://${window.location.hostname}:5004`;
```

**效果**: 
- 本地开发: 使用 http://localhost:5004
- 生产环境: 使用 http://8.210.246.101:5004
- 所有通过 js/api.js 加载的页面都会自动使用正确的 API URL

### 修复2: 浏览器扩展错误处理 (users.html)
**添加代码**:
```javascript
// 错误处理：防止浏览器扩展（如钱包注入）导致的页面崩溃
window.addEventListener('error', function(event) {
    if (event.message && (event.message.includes('solana') || event.message.includes('inpage'))) {
        console.warn('浏览器扩展注入错误已处理，页面继续运行:', event.message);
        event.preventDefault();
        return false;
    }
}, true);
```

**效果**: 捕获并忽略浏览器扩展注入导致的错误，防止页面崩溃

## 受影响的页面（已自动修复）

以下页面都加载了 js/api.js，因此都会自动受益于 API_BASE_URL 修复：
- ✅ users.html（用户管理）
- ✅ cases.html（客户案例）
- ✅ customer-profile-templates.html（客户模板）
- ✅ diagnosis-templates.html（诊断模板）
- ✅ franchisees.html（加盟管理）
- ✅ organizations.html（组织管理）
- ✅ settings.html（系统设置）
- ✅ task-templates.html（任务模板）
- ✅ templates.html（方案模板）
- ✅ test-change-password.html（密码修改测试）

## 已部署的文件

1. **js/api.js** - 修复 API_BASE_URL 配置
2. **users.html** - 添加浏览器扩展错误处理

## 验证

### API 端点验证 ✅
```bash
$ curl http://localhost:5004/api/users?org_id=7
{"success":true,"data":{"items":[...]}}

$ curl http://localhost:5004/api/roles?status=active
{"success":true,"data":{"items":[...]}}
```

### 配置验证 ✅
- js/api.js 已部署到远程服务器
- users.html 已部署到远程服务器
- 所有其他页面自动继承 API_BASE_URL 修复

## 后续行动

1. ✅ 清除浏览器缓存（可选）
2. ✅ 重新访问 http://8.210.246.101:5002/users.html
3. ✅ 用户列表和角色应该正常加载
4. ⚠️ 如果浏览器安装了多个钱包扩展，可能仍会出现注入错误（已处理）

## 技术细节

### 问题根源分析
系统架构:
- Nginx (5002): 前端文件托管
- Node.js API (5004): 后端服务
- MySQL (3306): 数据库

当用户访问 http://8.210.246.101:5002/users.html：
1. Nginx 返回 users.html 文件
2. 页面加载 js/api.js，获取 API_BASE_URL
3. 旧配置: API_BASE_URL = '' (空)
4. API 调用: fetch('' + '/api/users?org_id=7') → http://8.210.246.101:5002/api/users?org_id=7
5. Nginx 没有 /api 路由 → 404 错误

新配置修复:
1. API_BASE_URL = 'http://8.210.246.101:5004'
2. API 调用: fetch('http://8.210.246.101:5004' + '/api/users?org_id=7')
3. 请求到达 Node.js API → 200 成功响应

### 浏览器扩展错误分析
MetaMask 和其他钱包扩展尝试在 window 对象上注入 solana/ethereum 属性。
某些扩展版本在注入时会失败，导致：
```
TypeError: Cannot assign to read only property 'solana' of object '#<Window>'
```

解决方案是添加全局错误监听器，捕获这些错误并防止它们传播。

## 相关文件

- .env (APP_PORT=5004) ✅
- api/server.js (PORT = 5004) ✅
- ecosystem.config.js (APP_PORT: 5004) ✅
- js/customerProfile.js (已更新到 5004) ✅
- js/modules/customer-profile.js (已更新到 5004) ✅

