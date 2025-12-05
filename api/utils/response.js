/**
 * 统一响应格式工具
 * 用于规范API响应格式
 */

/**
 * 成功响应
 * @param {*} data - 响应数据
 * @param {string} message - 提示信息
 * @returns {object} 统一格式的成功响应
 */
function success(data = null, message = '操作成功') {
    return {
        success: true,
        data: data,
        message: message,
        timestamp: new Date().toISOString()
    };
}

/**
 * 分页响应
 * @param {Array} items - 数据列表
 * @param {number} total - 总记录数
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页大小
 * @returns {object} 带分页信息的响应
 */
function successWithPagination(items, total, page, pageSize) {
    return {
        success: true,
        data: {
            items: items,
            pagination: {
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                total: total,
                totalPages: Math.ceil(total / pageSize)
            }
        },
        message: '查询成功',
        timestamp: new Date().toISOString()
    };
}

/**
 * 错误响应
 * @param {string} message - 错误信息
 * @param {string} code - 错误码
 * @param {*} details - 错误详情
 * @returns {object} 统一格式的错误响应
 */
function error(message = '操作失败', code = 'ERROR', details = null) {
    return {
        success: false,
        error: {
            code: code,
            message: message,
            details: details
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * 验证错误响应
 * @param {*} validationErrors - 验证错误详情
 * @returns {object} 验证错误响应
 */
function validationError(validationErrors) {
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: '参数验证失败',
            details: validationErrors
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * 未授权响应
 * @param {string} message - 错误信息
 * @returns {object} 未授权响应
 */
function unauthorized(message = '未授权访问') {
    return {
        success: false,
        error: {
            code: 'UNAUTHORIZED',
            message: message
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * 禁止访问响应
 * @param {string} message - 错误信息
 * @returns {object} 禁止访问响应
 */
function forbidden(message = '没有权限访问') {
    return {
        success: false,
        error: {
            code: 'FORBIDDEN',
            message: message
        },
        timestamp: new Date().toISOString()
    };
}

/**
 * 资源未找到响应
 * @param {string} message - 错误信息
 * @returns {object} 未找到响应
 */
function notFound(message = '资源不存在') {
    return {
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: message
        },
        timestamp: new Date().toISOString()
    };
}

module.exports = {
    success,
    successWithPagination,
    error,
    validationError,
    unauthorized,
    forbidden,
    notFound
};
