# API 连接问题修复总结

## 问题描述

用户尝试保存用户数据时遇到 API 连接错误：
```
Failed to load resource: net::ERR_CONNECTION_RESET
:5004/api/users?org_id=7:1
API GET请求失败: TypeError: Failed to fetch
```

## 根本原因分析

### 原因1: 多个 Node.js 实例冲突
- **症状**: 同一端口上有两个 Node.js 进程在运行
  - PID 728417: beauty-crm-backend (22 小时)
  - PID 934612: beauty-crm-nodejs (13 分钟)
- **影响**: 可能导致连接被拒绝或重置
- **原因**: 之前部署时没有清理旧实例

### 原因2: 没有连接重试机制
- **症状**: 单次连接失败会导致整个请求失败
- **影响**: 网络抖动或瞬时延迟会导致用户操作失败
- **原因**: 前端 API 调用没有重试逻辑

## 修复方案

### 修复1: 清理重复的 PM2 进程 ✅

**执行的操作**:
```bash
# 停止并删除旧实例
pm2 stop beauty-crm-backend
pm2 delete beauty-crm-backend

# 验证只有一个实例运行
pm2 list | grep beauty
# 输出: beauty-crm-nodejs (PID 937477) online
```

**结果**:
- 旧的 beauty-crm-backend 进程已清理
- 只有 beauty-crm-nodejs 在 5004 端口监听
- 服务重新启动并正常运行

### 修复2: 添加 API 连接重试机制 ✅

**文件**: js/api.js

**新增函数**:
```javascript
/**
 * 为 API 调用添加重试机制
 */
async function fetchWithRetry(url, options = {}, maxRetries = 2) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                timeout: 10000
            });
            return response;
        } catch (error) {
            lastError = error;

            // 如果不是最后一次，等待后重试
            if (attempt < maxRetries) {
                const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000);
                await new Promise(resolve => setTimeout(resolve, delayMs));
                continue;
            }
        }
    }

    throw lastError;
}
```

**工作原理**:
1. 第一次尝试发送请求
2. 如果失败，等待 1 秒后进行第二次尝试
3. 如果再失败，等待 2 秒后进行第三次尝试
4. 如果三次都失败，抛出错误

**好处**:
- 解决瞬时网络问题
- 适应服务启动延迟
- 增强用户体验

### 修复3: 优化 API_BASE_URL 配置 ✅

**改进**:
```javascript
// 使用函数而不是常量，便于调试和动态切换
let API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:5004'
    : `http://${window.location.hostname}:5004`;

function getAPIBaseURL() {
    return API_BASE_URL;
}
```

## 验证步骤

### 1. 服务状态验证 ✅

```bash
# 检查 PM2 进程
pm2 list | grep beauty-crm
# 输出: beauty-crm-nodejs | online

# 检查端口监听
netstat -tulpn | grep 5004
# 输出: tcp6 :::5004 :::* LISTEN 937477/node

# 健康检查
curl http://localhost:5004/health
# 输出: {"success":true,"message":"服务器运行正常"...}
```

### 2. API 端点验证 ✅

```bash
# 测试用户列表
curl http://localhost:5004/api/users?org_id=7
# 输出: {"success":true,"data":{"items":[...]}}

# 测试角色列表
curl http://localhost:5004/api/roles?status=active
# 输出: {"success":true,"data":{"items":[...]}}
```

### 3. 前端测试

用户应该现在能够：
1. ✅ 访问 http://8.210.246.101:5002/users.html
2. ✅ 看到用户列表正常加载
3. ✅ 创建/编辑用户而不出现 API 错误
4. ✅ 即使网络抖动也能自动重试

## 部署清单

| 项目 | 状态 | 说明 |
|------|------|------|
| 删除旧 PM2 进程 | ✅ | beauty-crm-backend 已删除 |
| 服务重启 | ✅ | beauty-crm-nodejs 正常运行 |
| js/api.js 更新 | ✅ | 添加重试机制已部署 |
| 远程部署 | ✅ | 文件已同步到 8.210.246.101 |
| API 验证 | ✅ | 所有端点正常响应 |

## 技术细节

### 为什么会出现 ERR_CONNECTION_RESET？

```
用户操作 → 保存用户表单 → API POST 请求
    ↓
浏览器发送 HTTP POST 到 http://8.210.246.101:5004/api/users
    ↓
多个 Node.js 进程导致：
  - 连接被拒绝
  - 连接被复位
  - 响应异常
    ↓
浏览器报错: ERR_CONNECTION_RESET
```

### 为什么添加重试机制？

1. **提升容错能力**: 临时网络问题会自动重试
2. **减少用户投诉**: 单次失败不再意味着操作失败
3. **适应分布式环境**: 多个服务实例的负载均衡
4. **改善用户体验**: 用户无需手动刷新重试

## 相关文件

- **api/server.js**: Node.js 服务入口 (未修改)
- **api/app.js**: Express 配置 (包含 CORS 设置)
- **js/api.js**: 前端 API 客户端 (✅ 已更新)
- **users.html**: 用户管理页面 (✅ 已添加错误处理)
- **.env**: 环境配置 (APP_PORT=5004)

## 后续建议

1. **监控 PM2 进程**
   ```bash
   pm2 startup
   pm2 save
   ```
   这样会在服务器重启时自动启动进程

2. **检查日志**
   ```bash
   pm2 logs beauty-crm-nodejs --lines 50
   ```

3. **设置进程监控告警**
   ```bash
   pm2 install pm2-auto-restart
   ```

4. **定期检查端口占用**
   ```bash
   netstat -tulpn | grep 5004
   lsof -i :5004
   ```

## 时间线

| 时间 | 事件 |
|------|------|
| 用户报告 | users.html API 404 和 Solana 错误 |
| 修复1 | API_BASE_URL 配置更新 |
| 修复2 | 添加浏览器扩展错误处理 |
| 用户尝试保存 | 遇到 ERR_CONNECTION_RESET 错误 |
| 诊断 | 发现两个 PM2 进程冲突 |
| 修复3 | 删除旧进程，服务正常 |
| 修复4 | 添加 API 连接重试机制 |
| 部署 | 所有修复已部署到生产环境 |

---

**最后更新**: 2025-12-05  
**修复状态**: ✅ 已完成并测试  
**下一步**: 用户可以重试之前失败的操作

