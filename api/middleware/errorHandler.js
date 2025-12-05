/**
 * 统一错误处理中间件
 */

const { error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../config/constants');

/**
 * 错误处理中间件
 * 必须放在所有路由之后
 */
function errorHandler(err, req, res, next) {
    // 记录错误日志
    console.error('❌ 错误:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        timestamp: new Date().toISOString()
    });

    // 默认错误状态码和信息
    let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;
    let errorMessage = err.message || '服务器内部错误';
    let errorDetails = err.details || null;

    // 处理特定类型的错误
    if (err.name === 'ValidationError') {
        // 验证错误
        statusCode = HTTP_STATUS.BAD_REQUEST;
        errorCode = ERROR_CODES.VALIDATION_ERROR;
        errorMessage = '参数验证失败';
        errorDetails = err.details || err.message;
    } else if (err.name === 'UnauthorizedError' || err.message.includes('Token')) {
        // 认证错误
        statusCode = HTTP_STATUS.UNAUTHORIZED;
        errorCode = ERROR_CODES.UNAUTHORIZED;
        errorMessage = err.message || '未授权访问';
    } else if (err.code === 'ER_DUP_ENTRY') {
        // 数据库唯一键冲突
        statusCode = HTTP_STATUS.CONFLICT;
        errorCode = ERROR_CODES.ALREADY_EXISTS;
        errorMessage = '数据已存在';
    } else if (err.code && err.code.startsWith('ER_')) {
        // 其他数据库错误
        statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        errorCode = ERROR_CODES.DATABASE_ERROR;
        errorMessage = '数据库操作失败';
        // 生产环境不返回详细的数据库错误
        if (process.env.APP_ENV !== 'production') {
            errorDetails = err.message;
        }
    }

    // 返回错误响应
    res.status(statusCode).json(
        error(errorMessage, errorCode, errorDetails)
    );
}

/**
 * 404错误处理
 */
function notFoundHandler(req, res, next) {
    const err = new Error(`路由不存在: ${req.method} ${req.path}`);
    err.statusCode = HTTP_STATUS.NOT_FOUND;
    err.code = ERROR_CODES.NOT_FOUND;
    next(err);
}

/**
 * 异步路由错误捕获包装器
 * 用于包装async函数，自动捕获错误并传递给错误处理中间件
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
