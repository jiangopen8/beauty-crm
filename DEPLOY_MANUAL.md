# 美业客户后台 - 部署手册

## 📋 部署信息

- **服务器IP**: 8.210.246.101
- **目标路径**: /var/www/beautybackendnew
- **服务端口**: 5002
- **访问地址**: http://8.210.246.101:5002

---

## 🚀 方式一：自动部署（推荐）

### 前提条件
1. 已配置SSH密钥认证到服务器
2. 本地已安装 `rsync`（Git Bash自带）

### 执行步骤

在 Git Bash 中执行：

```bash
cd "D:/work6/美业客户后台"
chmod +x deploy.sh
./deploy.sh
```

脚本会自动完成：
- ✅ 测试SSH连接
- ✅ 创建目标目录
- ✅ 上传项目文件
- ✅ 启动Python服务
- ✅ 配置防火墙

---

## 📦 方式二：手动部署

### 步骤1: 连接服务器

```bash
ssh root@8.210.246.101
```

### 步骤2: 创建目标目录

```bash
mkdir -p /var/www/beautybackendnew
cd /var/www/beautybackendnew
```

### 步骤3: 上传文件

**选项A - 使用 rsync（推荐）**

在本地 Git Bash 执行：

```bash
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    "D:/work6/美业客户后台/" root@8.210.246.101:/var/www/beautybackendnew/
```

**选项B - 使用 scp**

在本地 Git Bash 执行：

```bash
scp -r "D:/work6/美业客户后台"/* root@8.210.246.101:/var/www/beautybackendnew/
```

**选项C - 使用 FTP/SFTP 工具**

使用 WinSCP、FileZilla 等工具：
- 主机: 8.210.246.101
- 协议: SFTP
- 端口: 22
- 上传到: /var/www/beautybackendnew

### 步骤4: 安装 Python（如果未安装）

```bash
# CentOS/RHEL
yum install -y python3

# Ubuntu/Debian
apt-get update && apt-get install -y python3
```

### 步骤5: 启动服务

```bash
cd /var/www/beautybackendnew

# 后台运行Python HTTP服务
nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &

# 查看进程
ps aux | grep "python.*5002"
```

### 步骤6: 配置防火墙

**CentOS 7/8 (firewalld)**

```bash
firewall-cmd --zone=public --add-port=5002/tcp --permanent
firewall-cmd --reload
```

**Ubuntu (ufw)**

```bash
ufw allow 5002/tcp
ufw reload
```

**传统 iptables**

```bash
iptables -I INPUT -p tcp --dport 5002 -j ACCEPT
service iptables save
```

**阿里云/腾讯云安全组**

记得在云服务器控制台的安全组中开放 5002 端口！

### 步骤7: 验证部署

```bash
# 检查服务是否运行
curl http://localhost:5002

# 查看日志
tail -f /var/log/beauty-backend.log
```

---

## 🔧 服务管理命令

### 查看服务状态

```bash
ps aux | grep "python.*5002"
netstat -tlnp | grep 5002
```

### 停止服务

```bash
pkill -f "python.*5002"
```

### 启动服务

```bash
cd /var/www/beautybackendnew
nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &
```

### 重启服务

```bash
pkill -f "python.*5002"
cd /var/www/beautybackendnew
nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &
```

### 查看日志

```bash
# 实时查看日志
tail -f /var/log/beauty-backend.log

# 查看最近100行
tail -n 100 /var/log/beauty-backend.log
```

---

## 🌐 访问地址

部署成功后，通过以下地址访问：

### 主要页面
- **客户管理**: http://8.210.246.101:5002/customers.html
- **客户详情**: http://8.210.246.101:5002/customer-detail.html
- **数据看板**: http://8.210.246.101:5002/index.html
- **订单管理**: http://8.210.246.101:5002/orders.html
- **任务管理**: http://8.210.246.101:5002/tasks.html
- **案例库**: http://8.210.246.101:5002/cases.html
- **系统设置**: http://8.210.246.101:5002/settings.html

### 工具页面
- **数据清除**: http://8.210.246.101:5002/clear-data.html
- **手势演示**: http://8.210.246.101:5002/mobile-gestures-demo.html

---

## 📱 移动端测试

在手机浏览器访问：
```
http://8.210.246.101:5002/customers.html
```

或使用电脑浏览器的设备模拟器（F12 → Ctrl+Shift+M）

---

## ⚙️ 使用 systemd 管理服务（可选，推荐生产环境）

### 创建服务文件

```bash
cat > /etc/systemd/system/beauty-backend.service << 'EOF'
[Unit]
Description=Beauty Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/beautybackendnew
ExecStart=/usr/bin/python3 -m http.server 5002
Restart=always
RestartSec=10
StandardOutput=append:/var/log/beauty-backend.log
StandardError=append:/var/log/beauty-backend.log

[Install]
WantedBy=multi-user.target
EOF
```

### 启用并启动服务

```bash
# 重载systemd配置
systemctl daemon-reload

# 启用开机自启
systemctl enable beauty-backend

# 启动服务
systemctl start beauty-backend

# 查看状态
systemctl status beauty-backend
```

### systemd 管理命令

```bash
# 启动
systemctl start beauty-backend

# 停止
systemctl stop beauty-backend

# 重启
systemctl restart beauty-backend

# 查看状态
systemctl status beauty-backend

# 查看日志
journalctl -u beauty-backend -f
```

---

## 🔍 故障排查

### 问题1: 无法访问服务

**检查服务是否运行**
```bash
ps aux | grep "python.*5002"
netstat -tlnp | grep 5002
```

**检查防火墙**
```bash
# firewalld
firewall-cmd --list-ports

# ufw
ufw status

# iptables
iptables -L -n | grep 5002
```

**检查云服务器安全组**
- 登录阿里云/腾讯云控制台
- 找到安全组设置
- 确保开放了 5002/tcp 端口

### 问题2: 服务启动失败

**查看错误日志**
```bash
tail -f /var/log/beauty-backend.log
```

**检查端口占用**
```bash
netstat -tlnp | grep 5002
lsof -i:5002
```

**杀死占用进程**
```bash
kill -9 $(lsof -t -i:5002)
```

### 问题3: 文件权限问题

**修复权限**
```bash
cd /var/www/beautybackendnew
chmod -R 755 .
chown -R root:root .
```

---

## 🔄 更新部署

### 快速更新

```bash
# 1. 上传新文件（覆盖）
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    "D:/work6/美业客户后台/" root@8.210.246.101:/var/www/beautybackendnew/

# 2. 重启服务
ssh root@8.210.246.101 "pkill -f 'python.*5002' && cd /var/www/beautybackendnew && nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &"
```

### 如果使用 systemd

```bash
# 1. 上传新文件
rsync -avz --progress \
    "D:/work6/美业客户后台/" root@8.210.246.101:/var/www/beautybackendnew/

# 2. 重启服务
ssh root@8.210.246.101 "systemctl restart beauty-backend"
```

---

## 📊 性能优化建议

### 使用 Nginx 反向代理（可选）

如果需要更好的性能和HTTPS支持，可以在前面加一层Nginx：

```nginx
server {
    listen 80;
    server_name 8.210.246.101;

    location / {
        proxy_pass http://localhost:5002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 📞 技术支持

如遇到部署问题，请提供：
1. 错误日志：`/var/log/beauty-backend.log`
2. 系统信息：`uname -a` 和 `cat /etc/os-release`
3. 服务状态：`ps aux | grep python` 和 `netstat -tlnp | grep 5002`

---

**部署日期**: 2025-11-30
**版本**: v1.0
**端口**: 5002
**服务器**: 8.210.246.101
