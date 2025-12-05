/**
 * Express应用主文件
 * 配置中间件和路由
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 创建Express应用
const app = express();

// ============================================
// 中间件配置
// ============================================

// 跨域配置
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// 静态文件服务 - 必须在API路由之前!
const staticPath = path.join(__dirname, '..');
console.log('📁 静态文件目录:', staticPath);
app.use(express.static(staticPath));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP请求日志（开发环境）
if (process.env.APP_ENV === 'development') {
    app.use(morgan('dev'));
}

// ============================================
// 路由配置
// ============================================

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: '服务器运行正常',
        timestamp: new Date().toISOString(),
        env: process.env.APP_ENV || 'development'
    });
});

// API根路径
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: '美业客户洞察CRM系统 API',
        version: '1.0.0',
        endpoints: {
            franchisees: '/api/franchisees',
            customers: '/api/customers',
            orders: '/api/orders',
            tasks: '/api/tasks',
            auth: '/api/auth',
            customerProfileTemplates: '/api/customer-profile-templates',
            diagnosisTemplates: '/api/diagnosis-templates',
            taskTemplates: '/api/task-templates'
        }
    });
});

// 业务路由
app.use('/api/franchisees', require('./routes/franchisees'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/organizations', require('./routes/organizations'));
app.use('/api/cases', require('./routes/cases'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/solution-templates', require('./routes/solution-templates'));
app.use('/api/customer-profile-templates', require('./routes/customer-profile-templates'));
app.use('/api/diagnosis-templates', require('./routes/diagnosis-templates'));
app.use('/api/task-templates', require('./routes/task-templates'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customer-profiles', require('./routes/customer-profiles'));

// TODO: 添加其他路由
// app.use('/api/customers', require('./routes/customers'));
// app.use('/api/orders', require('./routes/orders'));
// app.use('/api/tasks', require('./routes/tasks'));
// app.use('/api/auth', require('./routes/auth'));

// ============================================
// 错误处理
// ============================================

// 404错误处理（必须在所有路由之后）
app.use(notFoundHandler);

// 统一错误处理（必须在最后）
app.use(errorHandler);

module.exports = app;
