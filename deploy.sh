#!/bin/bash

# 美业CRM系统部署脚本
# 目标服务器: 8.210.246.101:5002
# 使用PM2管理Node.js进程

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
SERVER_IP="8.210.246.101"
SERVER_USER="root"
REMOTE_DIR="/var/www/beauty-crm"
APP_NAME="beauty-crm-backend"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  美业CRM系统 - 部署脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 步骤 1: 检查本地环境
echo -e "${YELLOW}步骤 1/6: 检查本地环境...${NC}"
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未找到 package.json 文件${NC}"
    exit 1
fi
if [ ! -f ".env" ]; then
    echo -e "${RED}警告: 未找到 .env 文件${NC}"
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✓ 本地文件检查完成${NC}"
echo ""

# 步骤 2: 测试SSH连接
echo -e "${YELLOW}步骤 2/6: 测试SSH连接...${NC}"
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH连接成功${NC}"
else
    echo -e "${RED}✗ SSH连接失败${NC}"
    echo -e "${RED}请确保:${NC}"
    echo -e "  1. SSH密钥已配置 (ssh-copy-id ${SERVER_USER}@${SERVER_IP})"
    echo -e "  2. 服务器防火墙允许SSH连接"
    echo -e "  3. 服务器IP正确"
    exit 1
fi
echo ""

# 步骤 3: 创建远程目录
echo -e "${YELLOW}步骤 3/6: 创建远程目录...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${REMOTE_DIR}"
echo -e "${GREEN}✓ 目录创建完成${NC}"
echo ""

# 步骤 4: 上传文件
echo -e "${YELLOW}步骤 4/6: 上传项目文件...${NC}"
echo -e "正在同步文件到服务器..."

# 检查是否有rsync
if command -v rsync &> /dev/null; then
    echo "使用rsync上传..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude '.gitignore' \
        --exclude 'logs/*.log' \
        --exclude '*.bak' \
        --exclude '*.tmp' \
        --exclude 'docs/' \
        ./ ${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/
else
    echo "rsync不可用，使用scp上传..."
    # 创建临时打包文件
    tar --exclude='node_modules' \
        --exclude='.git' \
        --exclude='.gitignore' \
        --exclude='logs/*.log' \
        --exclude='*.bak' \
        --exclude='*.tmp' \
        --exclude='docs/' \
        -czf /tmp/beauty-crm-deploy.tar.gz .

    # 上传到服务器
    scp /tmp/beauty-crm-deploy.tar.gz ${SERVER_USER}@${SERVER_IP}:/tmp/

    # 在服务器上解压
    ssh ${SERVER_USER}@${SERVER_IP} "cd ${REMOTE_DIR} && tar -xzf /tmp/beauty-crm-deploy.tar.gz && rm /tmp/beauty-crm-deploy.tar.gz"

    # 删除本地临时文件
    rm /tmp/beauty-crm-deploy.tar.gz
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 文件上传成功${NC}"
else
    echo -e "${RED}✗ 文件上传失败${NC}"
    exit 1
fi
echo ""

# 步骤 5: 在服务器上安装依赖和配置
echo -e "${YELLOW}步骤 5/6: 服务器端配置...${NC}"
ssh ${SERVER_USER}@${SERVER_IP} << ENDSSH
    cd ${REMOTE_DIR}

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        echo "Node.js未安装，请先安装Node.js (版本 >= 14)"
        exit 1
    fi
    echo "Node.js版本: \$(node --version)"

    # 检查PM2
    if ! command -v pm2 &> /dev/null; then
        echo "PM2未安装，正在安装..."
        npm install -g pm2
    fi
    echo "PM2版本: \$(pm2 --version)"

    # 安装依赖
    echo "安装依赖包..."
    npm install --production

    # 创建日志目录
    mkdir -p logs

    # 停止旧进程
    echo "停止旧进程..."
    pm2 stop ${APP_NAME} 2>/dev/null || true
    pm2 delete ${APP_NAME} 2>/dev/null || true

    # 启动应用
    echo "启动应用..."
    pm2 start ecosystem.config.js

    # 保存PM2配置
    pm2 save

    # 设置开机自启动
    pm2 startup | grep -v PM2 | bash || true

    echo ""
    echo "应用状态:"
    pm2 list
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 服务器配置完成${NC}"
else
    echo -e "${RED}✗ 服务器配置失败${NC}"
    exit 1
fi
echo ""

# 步骤 6: 健康检查
echo -e "${YELLOW}步骤 6/6: 健康检查...${NC}"
sleep 3
if curl -f -s http://${SERVER_IP}:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端API运行正常${NC}"
else
    echo -e "${RED}⚠ 后端API健康检查失败，请检查日志${NC}"
fi

if curl -f -s http://${SERVER_IP}:5002/ > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端页面可访问${NC}"
else
    echo -e "${RED}⚠ 前端页面访问失败，请检查Nginx配置${NC}"
fi
echo ""

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "访问地址:"
echo -e "  前端首页: ${BLUE}http://${SERVER_IP}:5002/${NC}"
echo -e "  加盟商管理: ${BLUE}http://${SERVER_IP}:5002/franchisees.html${NC}"
echo -e "  API端点: ${BLUE}http://${SERVER_IP}:5002/api${NC}"
echo -e "  健康检查: ${BLUE}http://${SERVER_IP}:5002/health${NC}"
echo ""
echo -e "常用命令:"
echo -e "  查看日志: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs ${APP_NAME}'${NC}"
echo -e "  查看状态: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'pm2 list'${NC}"
echo -e "  重启应用: ${YELLOW}ssh ${SERVER_USER}@${SERVER_IP} 'pm2 restart ${APP_NAME}'${NC}"
echo ""
echo -e "${BLUE}注意: 请确保Nginx已配置并运行，参考 DEPLOYMENT.md 文档${NC}"
echo ""
