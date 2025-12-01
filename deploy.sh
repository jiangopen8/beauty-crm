#!/bin/bash

# 美业客户后台部署脚本
# 目标服务器: 8.210.246.101
# 目标路径: /var/www/beautybackendnew
# 端口: 5002

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
REMOTE_HOST="8.210.246.101"
REMOTE_USER="root"  # 请根据实际情况修改
REMOTE_PATH="/var/www/beautybackendnew"
PORT=5002
LOCAL_PATH="D:/work6/美业客户后台"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  美业客户后台 - 自动部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "目标服务器: ${YELLOW}${REMOTE_HOST}${NC}"
echo -e "目标路径: ${YELLOW}${REMOTE_PATH}${NC}"
echo -e "服务端口: ${YELLOW}${PORT}${NC}"
echo ""

# 步骤1: 测试SSH连接
echo -e "${YELLOW}[1/5] 测试SSH连接...${NC}"
if ssh -o ConnectTimeout=5 ${REMOTE_USER}@${REMOTE_HOST} "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${GREEN}✓ SSH连接成功${NC}"
else
    echo -e "${RED}✗ SSH连接失败，请检查:${NC}"
    echo -e "  1. 服务器IP是否正确"
    echo -e "  2. SSH密钥是否配置"
    echo -e "  3. 防火墙是否开放SSH端口"
    exit 1
fi

# 步骤2: 创建目标目录
echo -e "${YELLOW}[2/5] 创建目标目录...${NC}"
ssh ${REMOTE_USER}@${REMOTE_HOST} "mkdir -p ${REMOTE_PATH}"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 目录创建成功${NC}"
else
    echo -e "${RED}✗ 目录创建失败${NC}"
    exit 1
fi

# 步骤3: 上传项目文件
echo -e "${YELLOW}[3/5] 上传项目文件...${NC}"
echo -e "正在上传，请稍候..."

# 使用rsync上传（排除不必要的文件）
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude 'deploy.sh' \
    --exclude 'deploy-manual.md' \
    "${LOCAL_PATH}/" ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 文件上传成功${NC}"
else
    echo -e "${RED}✗ 文件上传失败${NC}"
    exit 1
fi

# 步骤4: 在服务器上启动Python HTTP服务
echo -e "${YELLOW}[4/5] 配置并启动服务...${NC}"

ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
cd /var/www/beautybackendnew

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "Python3未安装，尝试安装..."
    yum install -y python3 || apt-get install -y python3
fi

# 停止可能存在的旧进程
pkill -f "python.*5002" 2>/dev/null

# 启动Python HTTP服务
nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &

# 获取进程ID
sleep 1
PID=$(pgrep -f "python.*5002")

if [ -n "$PID" ]; then
    echo "✓ 服务启动成功，进程ID: $PID"
    echo "✓ 日志文件: /var/log/beauty-backend.log"
else
    echo "✗ 服务启动失败"
    exit 1
fi
ENDSSH

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 服务启动成功${NC}"
else
    echo -e "${RED}✗ 服务启动失败${NC}"
    exit 1
fi

# 步骤5: 配置防火墙
echo -e "${YELLOW}[5/5] 配置防火墙...${NC}"

ssh ${REMOTE_USER}@${REMOTE_HOST} << 'ENDSSH'
# 检查是否有firewalld
if command -v firewall-cmd &> /dev/null; then
    echo "使用firewalld配置防火墙..."
    firewall-cmd --zone=public --add-port=5002/tcp --permanent
    firewall-cmd --reload
    echo "✓ firewalld配置完成"
# 检查是否有ufw
elif command -v ufw &> /dev/null; then
    echo "使用ufw配置防火墙..."
    ufw allow 5002/tcp
    echo "✓ ufw配置完成"
# 检查是否有iptables
elif command -v iptables &> /dev/null; then
    echo "使用iptables配置防火墙..."
    iptables -I INPUT -p tcp --dport 5002 -j ACCEPT
    service iptables save 2>/dev/null || iptables-save > /etc/iptables/rules.v4
    echo "✓ iptables配置完成"
else
    echo "⚠ 未检测到防火墙，请手动开放端口5002"
fi
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "访问地址: ${YELLOW}http://${REMOTE_HOST}:${PORT}${NC}"
echo -e "主要页面:"
echo -e "  - 客户管理: ${YELLOW}http://${REMOTE_HOST}:${PORT}/customers.html${NC}"
echo -e "  - 数据看板: ${YELLOW}http://${REMOTE_HOST}:${PORT}/index.html${NC}"
echo -e "  - 数据清除: ${YELLOW}http://${REMOTE_HOST}:${PORT}/clear-data.html${NC}"
echo ""
echo -e "服务管理:"
echo -e "  查看日志: ${YELLOW}ssh ${REMOTE_USER}@${REMOTE_HOST} 'tail -f /var/log/beauty-backend.log'${NC}"
echo -e "  停止服务: ${YELLOW}ssh ${REMOTE_USER}@${REMOTE_HOST} 'pkill -f \"python.*5002\"'${NC}"
echo -e "  重启服务: ${YELLOW}ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && nohup python3 -m http.server 5002 > /var/log/beauty-backend.log 2>&1 &'${NC}"
echo ""
