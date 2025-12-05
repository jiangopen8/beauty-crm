# 美业CRM系统 - 部署文档

## 📋 文档信息

| 项目 | 信息 |
|------|------|
| 文档版本 | v2.0 |
| 最后更新 | 2025-12-04 |
| 部署状态 | ✅ 运行中 |
| 部署时间 | 2025-12-04 |

---

## 服务器信息

- **服务器IP**: 8.210.246.101
- **前端端口**: 5002 (Nginx)
- **后端端口**: 3000 (Node.js/Express)
- **部署目录**: /var/www/beauty-crm
- **前端访问**: http://8.210.246.101:5002/
- **API基础URL**: http://8.210.246.101:3000/api

### 当前运行状态 ✅

- **前端服务**: Nginx - 运行中
- **后端服务**: PM2 (beauty-crm-backend) - 运行中
- **数据库**: 阿里云RDS MySQL 8.0 - 运行中
- **当前组织数**: 3个
- **页面总数**: 25个（15个生产页面 + 10个测试页面）
- **API模块**: 10个模块，52个接口

## 快速部署

### 方式一：自动部署脚本（推荐）

```bash
# Windows (Git Bash)
bash deploy.sh

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### 方式二：手动部署

#### 1. 连接到服务器

```bash
ssh root@8.210.246.101
```

#### 2. 创建部署目录

```bash
mkdir -p /var/www/beauty-crm
cd /var/www/beauty-crm
```

#### 3. 上传文件

在本地执行：

```bash
# 上传项目文件（排除node_modules）
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'logs' \
    ./ root@8.210.246.101:/var/www/beauty-crm/

# 上传.env配置文件
scp .env root@8.210.246.101:/var/www/beauty-crm/.env
```

#### 4. 安装依赖

在服务器上执行：

```bash
cd /var/www/beauty-crm
npm install --production
```

#### 5. 启动PM2进程

```bash
# 创建日志目录
mkdir -p logs

# 启动应用
pm2 start ecosystem.config.js

# 保存PM2配置（开机自启动）
pm2 save
pm2 startup
```

#### 6. 配置Nginx

创建配置文件 `/etc/nginx/sites-available/beauty-crm`:

```nginx
server {
    listen 5002;
    server_name 8.210.246.101;

    # 静态文件根目录
    root /var/www/beauty-crm;
    index index.html;

    # 静态文件访问
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API反向代理
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 健康检查
    location /health {
        proxy_pass http://localhost:3000/health;
    }

    # 静态资源缓存
    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/beauty-crm /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重新加载Nginx
systemctl reload nginx
```

## 环境要求

### 服务器环境

- **操作系统**: Linux (Ubuntu 18.04+ / CentOS 7+)
- **Node.js**: >= 14.0.0
- **Nginx**: >= 1.18.0
- **PM2**: >= 5.0.0

### 安装必要环境（如果未安装）

```bash
# 安装Node.js (使用nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# 安装PM2
npm install -g pm2

# 安装Nginx (Ubuntu)
sudo apt update
sudo apt install nginx

# 安装Nginx (CentOS)
sudo yum install nginx
```

## 配置文件说明

### .env 环境配置

```env
# 数据库配置
DB_HOST=rm-m5ej7x6xf3yb5876hao.mysql.rds.aliyuncs.com
DB_PORT=3306
DB_USER=beautydba
DB_PASSWORD=Shujuku1979
DB_NAME=beautydb
DB_CHARSET=utf8mb4

# 服务器配置
NODE_ENV=production
PORT=3000

# CORS配置
CORS_ORIGIN=http://8.210.246.101:5002
```

### PM2配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'beauty-crm-backend',
    script: './api/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
```

## 常用运维命令

### PM2进程管理

```bash
# 查看所有进程
pm2 list

# 查看详细信息
pm2 show beauty-crm-backend

# 查看日志
pm2 logs beauty-crm-backend

# 查看实时日志
pm2 logs beauty-crm-backend --lines 100

# 重启应用
pm2 restart beauty-crm-backend

# 停止应用
pm2 stop beauty-crm-backend

# 删除应用
pm2 delete beauty-crm-backend

# 清除日志
pm2 flush

# 监控面板
pm2 monit
```

### Nginx管理

```bash
# 测试配置
nginx -t

# 重新加载配置
systemctl reload nginx

# 重启Nginx
systemctl restart nginx

# 查看Nginx状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/access.log

# 查看错误日志
tail -f /var/log/nginx/error.log
```

### 数据库连接测试

```bash
cd /var/www/beauty-crm
npm run db:test
```

### 服务健康检查

```bash
# 本地检查
curl http://localhost:3000/health

# 外部检查
curl http://8.210.246.101:5002/health
```

## 故障排查

### 1. 应用无法启动

```bash
# 查看PM2日志
pm2 logs beauty-crm-backend --err

# 检查端口占用
netstat -tlnp | grep 3000

# 检查Node.js版本
node --version
```

### 2. 无法访问页面

```bash
# 检查Nginx状态
systemctl status nginx

# 检查Nginx配置
nginx -t

# 查看Nginx错误日志
tail -f /var/log/nginx/error.log

# 检查防火墙
firewall-cmd --list-ports
ufw status
```

### 3. 数据库连接失败

```bash
# 测试数据库连接
npm run db:test

# 检查.env配置
cat .env

# 检查网络连接
ping rm-m5ej7x6xf3yb5876hao.mysql.rds.aliyuncs.com
```

### 4. API返回错误

```bash
# 查看后端日志
pm2 logs beauty-crm-backend

# 查看详细错误
cd /var/www/beauty-crm
tail -f logs/pm2-error.log
```

## 更新部署

### 快速更新

```bash
# 本地执行
bash deploy.sh
```

### 仅更新代码（不重启）

```bash
# 上传新代码
rsync -avz --exclude 'node_modules' --exclude '.git' \
    ./ root@8.210.246.101:/var/www/beauty-crm/

# 重启应用
ssh root@8.210.246.101 'cd /var/www/beauty-crm && pm2 restart beauty-crm-backend'
```

### 仅更新前端

```bash
# 上传HTML/CSS/JS文件
rsync -avz --include='*.html' --include='*.css' --include='*.js' --include='js/' \
    ./ root@8.210.246.101:/var/www/beauty-crm/

# Nginx会自动提供新文件，无需重启
```

## 备份策略

### 数据库备份

数据库托管在阿里云RDS，自动备份已启用。

### 代码备份

```bash
# 在服务器上备份
cd /var/www
tar -czf beauty-crm-backup-$(date +%Y%m%d).tar.gz beauty-crm/

# 下载备份到本地
scp root@8.210.246.101:/var/www/beauty-crm-backup-*.tar.gz ./backups/
```

## 性能优化

### PM2集群模式

如果需要提升性能，可以使用集群模式：

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'beauty-crm-backend',
    script: './api/server.js',
    instances: 'max',  // 或指定数字，如 2
    exec_mode: 'cluster',
    autorestart: true
  }]
};
```

### Nginx缓存

已配置静态资源缓存（30天），无需额外配置。

## 安全建议

1. **修改默认端口**: 考虑使用非标准端口
2. **启用防火墙**: 只开放必要端口（5002, 22）
3. **SSL证书**: 如果有域名，建议配置HTTPS
4. **定期更新**: 保持系统和依赖包最新
5. **监控告警**: 配置PM2监控和告警通知

## 访问地址

部署完成后，可以通过以下地址访问：

### 核心业务页面

- **数据看板**: http://8.210.246.101:5002/
- **客户管理**: http://8.210.246.101:5002/customers.html
- **客户详情**: http://8.210.246.101:5002/customer-detail.html
- **订单管理**: http://8.210.246.101:5002/orders.html
- **订单详情**: http://8.210.246.101:5002/order-detail.html
- **任务管理**: http://8.210.246.101:5002/tasks.html
- **客户案例**: http://8.210.246.101:5002/cases.html

### 模板管理页面 ⭐

- **方案模板**: http://8.210.246.101:5002/templates.html
- **客户资料模板**: http://8.210.246.101:5002/customer-profile-templates.html
- **任务模板**: http://8.210.246.101:5002/task-templates.html

### 组织与用户管理 ⭐

- **组织管理**: http://8.210.246.101:5002/organizations.html
- **加盟商管理**: http://8.210.246.101:5002/franchisees.html
- **用户管理**: http://8.210.246.101:5002/users.html
- **角色管理**: http://8.210.246.101:5002/roles.html
- **系统设置**: http://8.210.246.101:5002/settings.html

### API接口 ⭐

- **API基础路径**: http://8.210.246.101:3000/api
- **组织管理API**: http://8.210.246.101:3000/api/organizations
- **用户管理API**: http://8.210.246.101:3000/api/users
- **角色管理API**: http://8.210.246.101:3000/api/roles
- **加盟商管理API**: http://8.210.246.101:3000/api/franchisees
- **客户案例API**: http://8.210.246.101:3000/api/cases
- **订单管理API**: http://8.210.246.101:3000/api/orders
- **方案模板API**: http://8.210.246.101:3000/api/solution-templates
- **客户模板API**: http://8.210.246.101:3000/api/customer-profile-templates
- **任务模板API**: http://8.210.246.101:3000/api/task-templates
- **AI接口**: http://8.210.246.101:3000/api/ai
- **健康检查**: http://8.210.246.101:3000/health

### 测试页面

- **测试页面**: http://8.210.246.101:5002/test.html
- **密码测试**: http://8.210.246.101:5002/test-change-password.html
- **主题测试**: http://8.210.246.101:5002/theme-test.html
- **加盟商API测试**: http://8.210.246.101:5002/franchisees-api.html

## 技术支持

如遇问题，请查看：

1. PM2日志: `pm2 logs beauty-crm-backend`
2. Nginx日志: `/var/log/nginx/error.log`
3. 应用日志: `/var/www/beauty-crm/logs/`

---

## 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2025-12-01 | 初始部署文档 |
| v2.0 | 2025-12-04 | 更新部署状态、添加所有页面和API访问地址 |

**v2.0 主要更新**：
- ✅ 添加当前运行状态信息
- ✅ 更新所有页面访问地址（15个生产页面）
- ✅ 添加完整的API接口访问地址（10个模块）
- ✅ 添加测试页面访问地址

---

**文档版本**: v2.0
**最后更新**: 2025-12-04
**维护团队**: 美业CRM开发团队
**部署状态**: ✅ 生产环境运行中
